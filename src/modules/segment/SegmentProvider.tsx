import { FC } from 'react';
import Script from 'next/script';
import * as snippet from '@segment/snippet';
import TrackerScoreSync from './TrackerScoreSync';

const NEXT_PUBLIC_ANALYTICS_WRITE_KEY = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;

const renderSnippet = () => {
  const opts = {
    apiKey: NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
    page: true,
  };
  return process.env.NODE_ENV === 'development' ? snippet.max(opts) : snippet.min(opts);
};

const SegmentProvider: FC = () => {
  if (!NEXT_PUBLIC_ANALYTICS_WRITE_KEY) return null;
  return (
    <>
      <Script id="segment-script" dangerouslySetInnerHTML={{ __html: renderSnippet() }} />
      <TrackerScoreSync />
    </>
  );
};

export default SegmentProvider;
