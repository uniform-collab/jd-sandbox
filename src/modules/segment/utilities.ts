import { ScoreVector } from '@uniformdev/context';

const ENRICHMENTS_VALUE: Record<string, string> = {
  int_c: 'Coffee Makers',
  int_b: 'Coffee Beans',
};

export const getHighestScoredInterestEnrichment = (scores: ScoreVector) => {
  const traits = Object.keys(scores)
    .filter(k => k.startsWith('int_'))
    .map(k => getInterestTraitFromEnrichment(k, scores));

  if (traits.length <= 0) {
    return undefined;
  }

  traits.sort((a, b) => b.score - a.score);
  return traits[0]?.name;
};

const getInterestTraitFromEnrichment = (enrichmentKey: string, scores: ScoreVector) => ({
  name: ENRICHMENTS_VALUE[enrichmentKey] || enrichmentKey,
  score: scores[enrichmentKey],
});

export const formatQuirksFormTraits = (traits: SegmentProfile.SegmentData['traits'] = {}) =>
  Object.keys(traits).reduce((accumulator: Record<string, string>, key) => {
    accumulator[key.replaceAll('_', '')] = String(traits[key]);
    return accumulator;
  }, {});
