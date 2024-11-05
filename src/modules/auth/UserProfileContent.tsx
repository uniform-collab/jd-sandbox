import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import InformationContent from '../../components/InformationContent';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

const UserProfile = dynamic(() => import('./UserProfile').then(mod => mod.default), { ssr: false });

const UserProfileContent: FC = props =>
  DISABLE_EXTRA_FEATURES ? (
    <div>
      <InformationContent
        title="Auth functionality is not enabled"
        text="Please use DISABLE_EXTRA_FEATURES env variable to activate it"
        className="text-secondary-content"
      />
    </div>
  ) : (
    <UserProfile {...props} />
  );

registerUniformComponent({
  type: 'userProfileContent',
  component: UserProfileContent,
});

export default UserProfileContent;
