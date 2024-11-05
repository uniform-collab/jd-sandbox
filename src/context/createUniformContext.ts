import { NextPageContext } from 'next';
import {
  Context,
  ManifestV2,
  ContextPlugin,
  enableDebugConsoleLogDrain,
  enableContextDevTools,
  enableUniformInsights,
} from '@uniformdev/context';
import { NextCookieTransitionDataStore } from '@uniformdev/context-next';
import { enableGoogleGtagAnalytics } from '@uniformdev/context-gtag';

const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export default function createUniformContext(manifest: ManifestV2, serverContext?: NextPageContext): Context {
  const plugins: ContextPlugin[] = [enableContextDevTools(), enableDebugConsoleLogDrain('debug')];
  // Docs: https://docs.uniform.app/integrations/data/google-analytics#activate-ga-plugin
  if (googleAnalyticsId) plugins.push(enableGoogleGtagAnalytics({ emitAll: true }));

  // adding the insights plugin client-side only
  if (typeof window !== 'undefined' && window.document) {
    plugins.push(
      // running against a local endpoint, will use edge middleware to rewrite to the actual endpoint
      enableUniformInsights({
        endpoint: {
          apiKey: '',
          type: 'api',
          host: window.location.protocol + '//' + window.location.host,
        },
      })
    );
  }

  return new Context({
    defaultConsent: true,
    manifest,
    transitionStore: new NextCookieTransitionDataStore({
      serverContext,
    }),
    plugins: plugins,
  });
}
