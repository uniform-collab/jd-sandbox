import { FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useUserProfileDataContext } from './UserProfileDataProvider';
import Button from '../../components/Button';
import Image from '../../components/Image';

type Styles = {
  container?: string;
};

export type UserProfileProps = {
  styles?: Styles;
};

const UserProfile: FC<UserProfileProps> = ({ styles }) => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string>('');

  const { profile, logout } = useUserProfileDataContext();

  const handleLogOutButtonClick = useCallback(() => {
    setIsLoading(true);
    logout();
  }, [logout]);

  const handleDeleteProfileButtonClick = useCallback(async () => {
    try {
      setShowModal(false);
      setIsLoading(true);
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: profile?.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error?.message);
        setIsLoading(false);
        return;
      }
      logout();
    } catch (e) {
      console.error(e);
      setError('Something went wrong');
      setIsLoading(false);
    }
  }, [profile?.id, logout]);

  const handleOpenModalClick = useCallback(() => setShowModal(true), []);
  const handleCloseModalClick = useCallback(() => setShowModal(false), []);

  if (!profile) return null;

  const { id, name, email } = profile;

  return (
    <div className={classNames('flex flex-col gap-10 text-secondary-content', styles?.container)}>
      <div>
        <p className="font-normal uppercase mb-2">{name}</p>
        <div className="flex flex-row gap-4">
          <Image
            src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282972/csk-icons/icon-profile_kdp16b_stik6h.svg"
            width={50}
            height={50}
            alt="profile icon"
            unoptimized
          />
          <div>
            <p className="font-bold text-1xl">id: {id}</p>
            <p className="font-bold text-gray-600">{email}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-6">
        <Button style="secondary" className="my-auto" copy={t('Log Out')} onClick={handleLogOutButtonClick} />
        <Button
          style="ghost"
          className="my-auto text-red-500"
          copy={t('Delete Profile')}
          onClick={handleOpenModalClick}
        />
        <div className="grow mx-auto">
          <span className={classNames('loading loading-spinner loading-lg', { hidden: !isLoading })}></span>
        </div>
        {Boolean(error) && <p className="font-bold text-red-500 text-xl mb-6">{t('Something went wrong')}</p>}
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        open={showModal}
        className={classNames('modal w-full h-full', {
          // we need override uniform add button zIndex(9900)
          'modal-open z-[9901]': showModal,
        })}
        aria-labelledby="dialognews-label"
        aria-modal="true"
        onClick={handleCloseModalClick}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
        <form method="dialog" className="modal-box p-8 max-w-lg" onClick={e => e.stopPropagation()}>
          <div>
            <p className="font-bold text-xl mb-6">{t('Are you sure you want to delete the user profile?')}</p>
            <div className="flex flex-row gap-4 justify-center">
              <Button style="primary" className="my-auto" copy={t('Cancel')} onClick={handleCloseModalClick} />
              <Button
                style="ghost"
                className="my-auto text-red-500"
                copy={t('Delete Profile')}
                onClick={handleDeleteProfileButtonClick}
              />
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default UserProfile;
