import { FC, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import { useTranslations } from 'next-intl';
import { useUserProfileDataContext } from './UserProfileDataProvider';
import ShoppingCartItem from '../../components/ShoppingCartItem';
import InformationContent from '../../components/InformationContent';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import ShoppingBundle from '../fake-cart/ShoppingBundle';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

type Styles = {
  container?: string;
};

export type UserProfileProps = {
  styles?: Styles;
};

const OrderHistory: FC<UserProfileProps> = ({ styles }) => {
  const t = useTranslations();
  const { orders = [] } = useUserProfileDataContext() || {};

  if (!orders?.length) {
    return (
      <div className={classNames('my-auto ', styles?.container)}>
        <InformationContent
          title={t('Order history is empty') || ''}
          text={t('Your purchase history will be displayed here') || ''}
          className="text-secondary-content"
        />
      </div>
    );
  }

  return (
    <div className={classNames(styles?.container)}>
      <p className="text-3xl">{t('Order history')}</p>
      <p className="text-gray-500 mb-8">{t('The last 20 orders')}</p>
      {orders.map((order, index) => (
        <OrderItem key={`order-${index}`} order={order} />
      ))}
    </div>
  );
};

const OrderItem: FC<{
  order: UserProfile.Order;
}> = ({ order }) => {
  const t = useTranslations();
  const [isOpened, setOpened] = useState(false);

  const { id, created_at, cart } = order;

  const toggleAccordion = useCallback(() => setOpened(isOpened => !isOpened), []);

  const cartAmount = useMemo(
    () =>
      cart?.reduce((acc, cartItem) => {
        if (cartItem.product) {
          return acc + cartItem.quantity * ((cartItem.product.price as number) || 0);
        } else if (cartItem.bundle) {
          const totalProductPrice = cartItem.bundle.products?.reduce((acc, product) => acc + Number(product.price), 0);

          const totalWithDiscount = totalProductPrice - totalProductPrice / cartItem?.bundle?.discount;

          return acc + cartItem.quantity * (totalWithDiscount || 0);
        }
        return acc;
      }, 0) || 0,
    [cart]
  );

  return (
    <div className="mb-6 last:mb-0">
      <button
        onClick={toggleAccordion}
        className={classNames('flex flex-row justify-between items-center p-2 md:p-4 font-bold bg-primary w-full')}
      >
        <p className={classNames('text-start text-primary-content')}># {id}</p>
        <p className={classNames('text-start text-primary-content')}>{new Date(created_at).toDateString()}</p>
        {Boolean(cartAmount) && (
          <div className="flex flex-row text-primary-content gap-2">
            <span>{t('Total')}: </span>
            <CurrencyFormatter amount={cartAmount} />
          </div>
        )}
        <div className="flex items-center">
          {isOpened ? (
            <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.50013 0L0 7.13651L1.95843 9L7.5 3.7271L13.0416 9L15 7.13651L7.50013 0Z"
                fill="white"
              />
            </svg>
          ) : (
            <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.49987 9L15 1.86349L13.0416 0L7.5 5.2729L1.95843 0L0 1.86349L7.49987 9Z"
                fill="white"
              />
            </svg>
          )}
        </div>
      </button>
      {isOpened && (
        <div className="md:pt-6 lg:mb-8 px-4 text-secondary-content">
          <div className="md:flex flex-row font-bold border-b pb-2">
            <div className="basis-3/5">{t('ITEM')}</div>
            <div className="basis-1/5">{t('QTY')}</div>
            <div className="basis-1/5 text-right">{t('PRICE')}</div>
          </div>
          {cart?.map(cartItem =>
            cartItem?.bundle ? (
              <ShoppingBundle key={cartItem.bundle?.id} quantity={cartItem.quantity} bundle={cartItem.bundle} />
            ) : (
              <ShoppingCartItem key={cartItem.product.id} quantity={cartItem.quantity} product={cartItem.product} />
            )
          )}
          <div className="flex flex-row justify-end font-bold text-2xl mt-6">
            <span className="pr-4">{t('Subtotal')}: </span>
            <CurrencyFormatter amount={cartAmount} />
          </div>
        </div>
      )}
    </div>
  );
};

const OrderHistoryContent: FC<UserProfileProps> = props =>
  DISABLE_EXTRA_FEATURES ? (
    <div>
      <InformationContent
        title="Order history functionality is not enabled"
        text="Please use DISABLE_EXTRA_FEATURES env variable to activate it"
        className="text-secondary-content"
      />
    </div>
  ) : (
    <OrderHistory {...props} />
  );

registerUniformComponent({
  type: 'orderHistory',
  component: OrderHistoryContent,
});

export default OrderHistoryContent;
