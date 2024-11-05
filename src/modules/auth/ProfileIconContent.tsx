import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import { ProfileIconProps, UserIcon } from './ProfileIcon';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

const ProfileIcon = dynamic(() => import('./ProfileIcon').then(mod => mod.default), {
  ssr: false,
  loading: () => <UserIcon width={24} height={24} color="white" />,
});

const ProfileIconContent: FC<ProfileIconProps> = props =>
  DISABLE_EXTRA_FEATURES ? <UserIcon width={24} height={24} color="gray" /> : <ProfileIcon {...props} />;

registerUniformComponent({
  type: 'profileIcon',
  component: ProfileIconContent,
});

export default ProfileIconContent;
