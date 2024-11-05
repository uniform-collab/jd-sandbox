import { FC, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUniformContext } from '@uniformdev/context-react';
import { useTranslations } from 'next-intl';
import Button from '../../components/Button';

const ButtonCheckout: FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const { context } = useUniformContext();

  const onOrderComplete = useCallback(() => {
    context.update({ quirks: { abandoned: 'true' } });
    //TODO: think how to avoid hardcoding the route
    router.push(`shopping-cart/checkout`);
  }, [context, router]);

  return <Button copy={t('Proceed to Checkout')} style="primary" onClick={onOrderComplete} />;
};

export default ButtonCheckout;
