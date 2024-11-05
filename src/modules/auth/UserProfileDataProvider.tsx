import { FC, ReactNode, createContext, useContext, useCallback } from 'react';
import { setCookie, deleteCookie } from 'cookies-next';
import EventTracker from './EventTracker';
import { STORE_USER_COOKIE_NAME } from './constants';
import { useUniformContext } from '@uniformdev/context-react';
import { useRouter } from 'next/router';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

interface UserProfileDataContextProps {
  profile?: UserProfile.ProfileData['profile'];
  orders?: UserProfile.ProfileData['orders'];
  login: (userId: string) => void;
  register: (userId: string) => void;
  logout: () => void;
}

export const UserProfileDataContext = createContext<UserProfileDataContextProps>({
  profile: undefined,
  orders: undefined,
  login: () => null,
  register: () => null,
  logout: () => null,
});

interface userProfileDataContextProviderProps {
  children: ReactNode;
  data?: UserProfile.ProfileData;
}

const UserProfileDataContextProvider: FC<userProfileDataContextProviderProps> = ({ children, data }) => {
  const router = useRouter();
  const { context } = useUniformContext();

  const login = useCallback(
    (userId: string) => {
      setCookie(STORE_USER_COOKIE_NAME, userId);
      window.dispatchEvent(new CustomEvent('Identify User', { detail: { userId } }));
      context.forget(true);
      router.reload();
    },
    [context, router]
  );

  const register = useCallback(
    (userId: string) => {
      setCookie(STORE_USER_COOKIE_NAME, userId);
      window.dispatchEvent(new CustomEvent('Identify User', { detail: { userId } }));
      router.reload();
    },
    [router]
  );

  const logout = useCallback(() => {
    deleteCookie(STORE_USER_COOKIE_NAME);
    window.dispatchEvent(new CustomEvent('Reset AnonymousId'));
    context.forget(true);
    router.reload();
  }, [context, router]);
  return (
    <UserProfileDataContext.Provider value={{ ...data, login, register, logout }}>
      <EventTracker />
      {children}
    </UserProfileDataContext.Provider>
  );
};

export default (props: userProfileDataContextProviderProps) =>
  DISABLE_EXTRA_FEATURES ? props.children : <UserProfileDataContextProvider {...props} />;

export const useUserProfileDataContext = () => useContext(UserProfileDataContext);
