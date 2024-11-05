import type { NextApiRequest, NextApiResponse } from 'next';
import { mergeTranslationToUniform } from '@uniformdev/tms-sdk';
import {
  SmartlingApiClientBuilder,
  SmartlingJobsApi,
  SmartlingJobBatchesApi,
  ListBatchesParameters,
  SmartlingFilesApi,
  DownloadFileParameters,
  CloseJobParameters,
} from 'smartling-api-sdk-nodejs';
import { getCanvasClient, getContentClient } from '@/utilities/canvas/canvasClients';

// Environment variables
const projectId = process.env.SMARTLING_PROJECT_ID;
const userSecret = process.env.SMARTLING_USER_SECRET;
const userId = process.env.SMARTLING_USER_ID;
const workflowId = process.env.WORKFLOW_ID || undefined;
const workflowTranslatedStageId = process.env.WORKFLOW_TRANSLATED_STAGE_ID || undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!projectId || !userSecret || !userId) {
    return res.status(400).send('No credentials provided');
  }

  const { type, translationJobUid } = req.query;

  if (type !== 'job.completed') {
    console.info('We only react to completed jobs');
    return res.status(200).send('We only react to completed jobs');
  }

  try {
    // Initialize Smartling clients
    const apiBuilder = new SmartlingApiClientBuilder()
      .setBaseSmartlingApiUrl('https://api.smartling.com')
      .authWithUserIdAndUserSecret(userId!, userSecret!);

    const jobsClient = apiBuilder.build(SmartlingJobsApi);
    const jobBatchesClient = apiBuilder.build(SmartlingJobBatchesApi);
    const filesClient = apiBuilder.build(SmartlingFilesApi);

    // Get completed batch details
    const lastBatch = await jobBatchesClient.listBatches(
      projectId,
      new ListBatchesParameters({ translationJobUid, limit: 1, status: 'COMPLETED' })
    );

    if (lastBatch.items.length === 0) {
      console.info(`No completed batches found in project "${projectId}".`);
      return res.status(400).json('No completed batches found');
    }

    const batchInfo = lastBatch.items[0];
    const batchDetails = await jobBatchesClient.getBatchStatus(projectId, batchInfo.batchUid);

    // Process each file in the batch
    const translationsStatus: Record<string, boolean> = {};

    for (const fileInfo of batchDetails.files) {
      const downloadParameters = new DownloadFileParameters({ retrievalType: 'published' });
      const file = await filesClient.downloadFile(
        projectId,
        fileInfo.fileUri,
        fileInfo.targetLocales[0].localeId,
        downloadParameters
      );

      try {
        const translationPayload = JSON.parse(file.toString());

        // Extract metadata
        const { uniformProjectId, uniformReleaseId, entityType, entity } = translationPayload.metadata;

        console.info(
          `Processing translation payload (project: ${uniformProjectId}, release: ${
            uniformReleaseId || 'n/a'
          }, entityType: ${entityType}, entity: ${entity.id})`
        );

        const canvasClient = getCanvasClient();
        const contentClient = getContentClient();

        const { translationMerged } = await mergeTranslationToUniform({
          canvasClient,
          contentClient,
          translationPayload,
          updateComposition: async ({ canvasClient, composition }) => {
            console.info('Updating composition: start');
            const compositionWithWorkflow = ensureWorkflowStage(composition);
            await canvasClient.updateComposition(compositionWithWorkflow);
            console.info('Updating composition: done');
            return true;
          },
          updateEntry: async ({ contentClient, entry }) => {
            console.info('Updating entry: start');
            const entryWithWorkflow = ensureWorkflowStage(entry);
            await contentClient.upsertEntry(entryWithWorkflow);
            console.info('Updating entry: done');
            return true;
          },
          onNotFound: ({ translationPayload }) => {
            console.info(
              `Skipping: cannot find ${translationPayload.metadata.entityType} (${translationPayload.metadata.entity.id})`
            );
          },
          onNotTranslatedResult: ({ updated, errorKind, errorText }) => {
            if (errorKind !== undefined) {
              console.warn(errorText || 'Unknown error');
            } else if (!updated) {
              console.info('Translation has no updates');
            }
          },
        });

        translationsStatus[fileInfo.fileUri] = translationMerged;
      } catch (error) {
        console.error('Error processing file', { exception: error, fileUri: fileInfo.fileUri });
        translationsStatus[fileInfo.fileUri] = false;
      }
    }

    // Close the job if all translations are merged
    if (Object.values(translationsStatus).every(status => status)) {
      console.info('Updating job status: start');
      await jobsClient.closeJob(projectId, translationJobUid as string, new CloseJobParameters({}));
      console.info('Updating job status: done');
    } else {
      console.info('Failed to update job status. Not all translations were merged.', translationsStatus);
    }

    console.info('Smartling Job-Completed Webhook: end');
    return res.status(200).json('Ok');
  } catch (error) {
    console.error('Error handling Smartling job completion', { exception: error });
    return res.status(500).json('Internal Server Error');
  }
}

// Ensure workflow stage for entities
const ensureWorkflowStage = <T extends { workflowId?: string; workflowStageId?: string }>(entity: T): T => {
  if (workflowId && workflowTranslatedStageId && entity.workflowId === workflowId) {
    return {
      ...entity,
      workflowStageId: workflowTranslatedStageId,
    };
  }
  return entity;
};
