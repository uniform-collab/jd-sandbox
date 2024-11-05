import { FC, SVGProps, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import classNames from 'classnames';
import { useUserProfileDataContext } from './UserProfileDataProvider';
import { useTranslations } from 'next-intl';
import Login from './Login';
import UserProfile from './UserProfile';
import { getUserProfileById } from './db-api';
import { STORE_USER_COOKIE_NAME } from '../segment/constants';

type Styles = {
  link?: string;
  login?: {
    container?: string;
  };
};

export type ProfileIconProps = {
  link: Types.ProjectMapLink;
  styles?: Styles;
};

export const UserIcon: FC<SVGProps<SVGSVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="currentColor" {...props}>
    <path
      d="M24.3061 25.461C23.2192 24.0219 21.8129 22.8549 20.1982 22.0518C18.5834 21.2487 16.8042 20.8316 15.0008 20.8332C13.1973 20.8316 11.4182 21.2487 9.80338 22.0518C8.18861 22.8549 6.78237 24.0219 5.69545 25.461M24.3061 25.461C26.4271 23.5744 27.923 21.0876 28.5982 18.3304C29.2734 15.5732 29.0945 12.6759 28.0853 10.0227C27.076 7.36944 25.2841 5.0857 22.9472 3.47431C20.6102 1.86292 17.8386 1 15 1C12.1614 1 9.38978 1.86292 7.05283 3.47431C4.71587 5.0857 2.92396 7.36944 1.91472 10.0227C0.905487 12.6759 0.726616 15.5732 1.40183 18.3304C2.07705 21.0876 3.57445 23.5744 5.69545 25.461M24.3061 25.461C21.7457 27.7449 18.4317 29.0049 15.0008 29C11.5693 29.0053 8.25626 27.7453 5.69545 25.461M19.6674 11.4997C19.6674 12.7374 19.1758 13.9244 18.3006 14.7996C17.4254 15.6748 16.2385 16.1664 15.0008 16.1664C13.7631 16.1664 12.5761 15.6748 11.7009 14.7996C10.8258 13.9244 10.3341 12.7374 10.3341 11.4997C10.3341 10.262 10.8258 9.07501 11.7009 8.19982C12.5761 7.32464 13.7631 6.83297 15.0008 6.83297C16.2385 6.83297 17.4254 7.32464 18.3006 8.19982C19.1758 9.07501 19.6674 10.262 19.6674 11.4997Z"
      fill="black"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileIcon: FC<ProfileIconProps> = ({ link, styles }) => {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile.ProfileData['profile'] | null>(null);

  const { logout } = useUserProfileDataContext();
  const userId = getCookie(STORE_USER_COOKIE_NAME) || '';

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        const { data: profile, error } = await getUserProfileById(userId);
        if (error) throw new Error(error.message);
        setProfile(profile);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) run();
  }, [userId]);

  const handleOpenModal = useCallback(() => setShowModal(true), []);
  const handleCloseModalClick = useCallback(() => setShowModal(false), []);

  if (!link) {
    return null;
  }

  return (
    <>
      <div className="dropdown">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label tabIndex={0} className={classNames('cursor-pointer', styles?.link)}>
          <UserIcon
            width={24}
            height={24}
            className={classNames(styles?.link, { '!text-secondary': Boolean(userId) })}
            href={link?.path}
          />
        </label>
        <ul
          tabIndex={0}
          className={classNames(
            'menu menu-sm dropdown-content mt-5 z-[1000] p-2 shadow rounded-none bg-primary min-w-[200px] right-0 uppercase',
            { '!invisible !opacity-0': showModal }
          )}
        >
          {!isLoading ? (
            <p className="font-normal uppercase mb-2 mt-2 text-center">
              {t('Hello')}, {profile?.name || t('stranger')}
            </p>
          ) : (
            <p className="font-normal uppercase mb-2 mt-2 text-center"> {t('Loading')}...</p>
          )}
          <div className="h-[1px] my-2 bg-secondary" />
          <Link tabIndex={0} className={classNames('p-4', styles?.link)} href={link?.path}>
            {t('My Profile')}
          </Link>
          {!Boolean(userId) ? (
            <button className={classNames('p-4 text-left uppercase', styles?.link)} onClick={handleOpenModal}>
              {t('Sign In')}
            </button>
          ) : (
            <button className={classNames('p-4 text-left uppercase', styles?.link)} onClick={logout}>
              {t('Log Out')}
            </button>
          )}
        </ul>
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
        <form method="dialog" className="modal-box !rounded-none p-8 max-w-lg" onClick={e => e.stopPropagation()}>
          <Login styles={styles?.login} />
        </form>
      </dialog>
    </>
  );
};

export default ProfileIcon;
