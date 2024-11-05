import { FC } from 'react';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import ProfileIcon, { ProfileIconProps, UserIcon } from '../../components/ProfileIcon';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

const ProfileIconContent: FC<ProfileIconProps> = props =>
  DISABLE_EXTRA_FEATURES ? <UserIcon width={24} height={24} color="gray" /> : <ProfileIcon {...props} />;

registerUniformComponent({
  type: 'profileIcon',
  component: ProfileIconContent,
});

export default ProfileIconContent;
