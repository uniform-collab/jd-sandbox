import { FC, useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import Image from '../../components/Image';
import { useFakeCartContext } from './FakeCartProvider';
import ModalLayoutRight from './ModalLayoutRight';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import ShoppingCartItem from '../../components/ShoppingCartItem';
import ButtonCheckout from './ButtonCheckout';
import ShoppingBundle from './ShoppingBundle';

type Styles = {
  container?: string;
};
type CartContentProps = {
  onCloseModal: () => void;
  styles?: Styles;
};

const togglePageScroll = (isHiddenManual?: boolean): void => {
  const html = document.querySelector('html');
  if (!html) return;
  const isHidden = isHiddenManual ?? html.style.overflow === 'hidden';
  html.style.overflow = isHidden ? 'auto' : 'hidden';
};

const CartContent: FC<CartContentProps> = ({ onCloseModal, styles }) => {
  const t = useTranslations();
  const { cartItems, isCartLoading, cartAmount, updateItemQuantity, removeItemFromFakeCart, isModalFakeCartOpen } =
    useFakeCartContext();

  const hasItems = Boolean(cartItems.length);

  const productsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    togglePageScroll(!isModalFakeCartOpen);
    if (!isModalFakeCartOpen) return;
    // scroll modal to the bottom
    productsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isModalFakeCartOpen]);

  useEffect(() => {
    // close modal on last product removed
    if (!cartItems.length) onCloseModal();
  }, [onCloseModal, cartItems.length]);

  const showLoadingIndications = isCartLoading && !hasItems;

  return (
    <div className={classNames('flex relative h-full flex-col', styles?.container)}>
      <div className="border-b fixed top-0 w-full flex justify-between items-center bg-white z-50 lg:py-0 py-2 px-4 sm:px-14">
        <button className="w-24 h-16 flex group items-center" type="submit" onClick={onCloseModal}>
          <Image
            unoptimized
            width={16}
            height={16}
            alt="icon-cross"
            src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282918/csk-icons/icon-cross-black_c9f098_sqlipa.svg"
            className="fill-black group-hover:stroke-black duration-300 stroke-transparent w-3"
          />
          <p className="pl-2 uppercase text-sm group-hover:underline duration-300  font-bold">{t('Close')}</p>
        </button>
        {!showLoadingIndications && (
          <div className="flex justify-around text-xl font-extrabold items-center">
            <p className="uppercase mr-2">{t('My Cart')}</p>
            <div className="mr-4">
              <CurrencyFormatter amount={cartAmount} />
            </div>
            <Image
              unoptimized
              alt="icon-cart"
              width={30}
              height={30}
              src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282886/csk-icons/icon-cart_zzou3e_yovtho.svg"
            />
          </div>
        )}
      </div>
      {!showLoadingIndications ? (
        <div ref={productsContainerRef} className="flex box-border flex-col mt-16">
          <div>
            {cartItems.map(item => (
              <div key={item?.product?.key} className="p-4 sm:px-14 border-b">
                {item?.bundle ? (
                  <ShoppingBundle
                    key={item.bundle?.id}
                    bundle={item.bundle}
                    quantity={item.quantity}
                    updateItemQuantity={updateItemQuantity}
                    removeItemFromCart={removeItemFromFakeCart}
                    isInModal
                  />
                ) : (
                  <ShoppingCartItem
                    updateItemQuantity={updateItemQuantity}
                    removeItemFromCart={removeItemFromFakeCart}
                    product={item.product}
                    quantity={item.quantity}
                    isInModal
                  />
                )}
              </div>
            ))}
          </div>
          <div className="pt-11 pr-4 sm:pr-14">
            <div className="flex flex-row justify-end font-bold text-2xl">
              <span className="pr-4">{t('Subtotal')}: </span>
              <CurrencyFormatter amount={cartAmount} />
            </div>
            <div className="flex flex-row justify-end">
              <ButtonCheckout />
            </div>
          </div>
        </div>
      ) : (
        <div className="md:pt-14 lg:mt-8 text-secondary-content flex justify-center">
          <span className={classNames('loading loading-spinner loading-lg', { hidden: !isCartLoading })}></span>
        </div>
      )}
    </div>
  );
};

const ShoppingCartModal: FC<{ styles?: Styles }> = ({ styles }) => {
  const { isModalFakeCartOpen, setIsModalFakeCartOpen } = useFakeCartContext();

  const onCloseModal = useCallback((): void => setIsModalFakeCartOpen(false), [setIsModalFakeCartOpen]);

  return (
    <ModalLayoutRight isOpen={isModalFakeCartOpen} onCloseModal={onCloseModal}>
      <CartContent onCloseModal={onCloseModal} styles={styles} />
    </ModalLayoutRight>
  );
};

export default ShoppingCartModal;
