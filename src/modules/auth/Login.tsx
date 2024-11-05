import { ChangeEvent, FC, useCallback, useState } from 'react';
import { getCookie } from 'cookies-next';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import Input from '../../components/Input';
import Button from '../../components/Button';
import InformationContent from '../../components/InformationContent';
import { STORE_USER_COOKIE_NAME } from './constants';
import { useUserProfileDataContext } from './UserProfileDataProvider';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

type Styles = {
  container?: string;
};

export type LoginProps = {
  styles?: Styles;
};

const Login: FC<LoginProps> = ({ styles }) => {
  const t = useTranslations();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { login, register, logout } = useUserProfileDataContext();

  const userId: string | undefined = getCookie(STORE_USER_COOKIE_NAME);

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value: newValue } = e.target;
      setEmail(newValue);
      setError(!EMAIL_REGEX.test(newValue) ? t('Please Enter a valid email address') || '' : '');
    },
    [t]
  );

  const handleRegisterButtonClick = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error?.message);
        setIsLoading(false);
        return;
      }

      const profile: UserProfile.Profile = await response.json();
      register(String(profile.id));
    } catch (e) {
      console.error(e);
      setError(t('Something went wrong') || '');
      setIsLoading(false);
    }
  }, [email, name, register, t]);

  const handleLoginButtonClick = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error?.message);
        setIsLoading(false);
        return;
      }

      const { id }: UserProfile.Profile = await response.json();
      login(String(id));
    } catch (e) {
      console.error(e);
      setError(t('Something went wrong') || '');
      setIsLoading(false);
    }
  }, [email, login, t]);

  const handleLogOutButtonClick = useCallback(() => {
    try {
      setIsLoading(true);
      logout();
    } catch (e) {
      console.error(e);
      setError(t('Something went wrong') || '');
      setIsLoading(false);
    }
  }, [logout, t]);

  const handleSwitchModeClick = useCallback(() => {
    setIsLogin(prevState => !prevState);
    setError('');
  }, []);

  if (userId && !isLoading) {
    return (
      <div className={classNames('flex flex-col text-secondary-content', styles?.container)}>
        <InformationContent
          title={t('Oops, looks like something went wrong') || ''}
          text={`${t(`We couldn't access the profile of the user with the id:`)} ${userId}`}
          className="text-secondary-content !mb-14 !pt-0"
        />
        <div className="mx-auto my-2">
          <span className={classNames('loading loading-spinner loading-lg', { hidden: !isLoading })}></span>
        </div>
        <div className="mx-auto">
          <Button style="secondary" copy={t('Log out and reset personalization')} onClick={handleLogOutButtonClick} />
        </div>
      </div>
    );
  }

  const isCanLogin = !Boolean(error) && email && (isLogin || name);

  return (
    <div className={classNames('text-secondary-content', styles?.container)}>
      <div className="flex flex-col h-[525px]">
        <p className="font-bold text-3xl text-center my-4">{t('Welcome')}</p>
        <Input
          id="name"
          className={classNames('transition-transform min-h-min mb-6', { hidden: isLogin })}
          placeholder={t('Name')}
          value={name}
          onChange={handleNameChange}
        />
        <Input
          id="email"
          placeholder={t('Email')}
          className="min-h-[100px]"
          value={email}
          onChange={handleEmailChange}
          errorMessage={error}
        />
        <div className="grow mx-auto my-2">
          <span className={classNames('loading loading-spinner loading-lg', { hidden: !isLoading })}></span>
        </div>
        <Button
          className={classNames('w-full', { '!bg-gray-200': !isCanLogin })}
          onClick={isLogin ? handleLoginButtonClick : handleRegisterButtonClick}
          copy={isLogin ? t('Login') : t('Register')}
          disable={!isCanLogin || isLoading}
          style="primary"
        />
        <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
          <p className="mx-4 mb-0 text-center font-semibold">{t('or')}</p>
        </div>
        <Button
          className="w-full"
          onClick={handleSwitchModeClick}
          copy={!isLogin ? t('Back to login') : t('Register')}
          style="secondary"
          disable={isLoading}
        />
      </div>
    </div>
  );
};

export default Login;
