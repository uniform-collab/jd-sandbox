import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import InformationContent from '../../components/InformationContent';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

const SegmentProfile = dynamic(() => import('./SegmentProfile').then(mod => mod.default), { ssr: false });

const SegmentProfileContent: FC = props =>
  DISABLE_EXTRA_FEATURES ? (
    <div>
      <InformationContent
        title="Segment is not enabled"
        text="Please use DISABLE_EXTRA_FEATURES env variable to activate it"
        className="text-secondary-content"
      />
    </div>
  ) : (
    <SegmentProfile {...props} />
  );

registerUniformComponent({
  type: 'segmentProfileContent',
  component: SegmentProfileContent,
});

export default SegmentProfileContent;
