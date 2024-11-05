import { FC } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import Image from '../../components/Image';
import { useFakeCartContext } from './FakeCartProvider';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import InformationContent from '../../components/InformationContent';
import ShoppingCartItem from '../../components/ShoppingCartItem';
import ButtonCheckout from './ButtonCheckout';
import ShoppingBundle from './ShoppingBundle';

const ShoppingCart: FC = () => {
  const t = useTranslations();
  const { cartItems, isCartLoading, cartAmount, updateItemQuantity, removeItemFromFakeCart } = useFakeCartContext();
  const hasItems = Boolean(cartItems.length);

  if (isCartLoading && !hasItems) {
    return (
      <div className="md:pt-14 lg:mb-8 text-secondary-content flex justify-center">
        <span className={classNames('loading loading-spinner loading-lg', { hidden: !isCartLoading })}></span>
      </div>
    );
  }

  return (
    <div className="md:pt-14 lg:mb-8 text-secondary-content">
      {hasItems && (
        <div className="md:flex flex-row font-bold border-b pb-4 hidden">
          <div className="basis-3/5">{t('ITEM')}</div>
          <div className="basis-1/5">{t('QTY')}</div>
          <div className="basis-1/5 text-right">{t('PRICE')}</div>
        </div>
      )}
      {hasItems ? (
        cartItems.map(cartItem =>
          cartItem?.bundle ? (
            <ShoppingBundle
              key={cartItem.bundle?.id}
              bundle={cartItem.bundle}
              quantity={cartItem.quantity}
              updateItemQuantity={updateItemQuantity}
              removeItemFromCart={removeItemFromFakeCart}
            />
          ) : (
            <ShoppingCartItem
              updateItemQuantity={updateItemQuantity}
              removeItemFromCart={removeItemFromFakeCart}
              key={cartItem.product?.key}
              quantity={cartItem.quantity}
              product={cartItem.product}
            />
          )
        )
      ) : (
        <InformationContent
          title={t('Your shopping cart is empty') || ''}
          text={t('Products added to the cart will appear here.') || ''}
          imageComponent={
            <Image
              src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282886/csk-icons/icon-cart_zzou3e_yovtho.svg"
              width={75}
              height={75}
              alt="cart icon"
              unoptimized
            />
          }
        />
      )}
      {hasItems && (
        <div className="pt-9">
          <div className="flex flex-row justify-end font-bold text-2xl">
            <span className="pr-4">{t('Subtotal') || ''}: </span>
            <CurrencyFormatter amount={cartAmount} />
          </div>
          <div className="flex flex-row justify-end">
            <ButtonCheckout />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
