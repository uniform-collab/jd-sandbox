import { FC, useCallback } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from '../../components/Image';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import ProductQuantityItem from '../../components/ProductQuantityItem';

type ShoppingBundleProps = {
  bundle: CommerceTypes.ProductBundle;
  quantity: number;
  discount?: number;
  isInModal?: boolean;
  updateItemQuantity?: (productKey: string, newQuantity: number) => void;
  removeItemFromCart?: (productKey: string) => void;
};

const ShoppingBundle: FC<ShoppingBundleProps> = ({
  bundle,
  isInModal,
  updateItemQuantity,
  quantity,
  removeItemFromCart,
}) => {
  const t = useTranslations();
  const { id, products, discount, title } = bundle;

  const getThumbnailImage = useCallback((product: CommerceTypes.Product) => {
    return product.images?.find(image => image.id === product?.thumbnailId) || product?.images?.[0];
  }, []);

  const increaseProductQuantity = useCallback(
    async (): Promise<void> => updateItemQuantity?.(id, quantity + 1),
    [quantity, updateItemQuantity, id]
  );

  const decreaseProductQuantity = useCallback(
    async (): Promise<void> => updateItemQuantity?.(id, quantity - 1),
    [quantity, updateItemQuantity, id]
  );

  const handleRemoveProductButtonClick = useCallback(() => {
    removeItemFromCart?.(id);
  }, [id, removeItemFromCart]);

  const totalWithoutDiscount = products?.reduce((acc, product) => acc + Number(product.price), 0) || 0;
  const totalWithDiscount = totalWithoutDiscount - totalWithoutDiscount / discount;

  return (
    <div className={classNames('flex flex-col py-3 gap-4', { 'md:flex-row border-b': !isInModal, 'py-2': isInModal })}>
      <div className="basis-3/5">
        <div className={classNames('font-bold block', { 'md:hidden': !isInModal })}>{t('ITEM')}</div>
        <div className={classNames('flex flex-col py-4', { 'lg:py-3': !isInModal })}>
          <div className={classNames('flex justify-between flex-row', { 'md:block': !isInModal })}>
            <div
              className={classNames('border border-slate-300 grid  hover:shadow-inner duration-300', {
                'grid-cols-1 w-max': products.length === 1,
                'grid-cols-2 w-max': products.length === 2,
                'grid-cols-3 w-max': products.length === 3,
                'grid-cols-3 md:grid-cols-4 w-full': products.length > 3,
              })}
            >
              {products.map(product => (
                <div
                  key={product.slug}
                  className={classNames('relative m-2 w-24 h-24  cursor-pointer', { 'lg:w-40 lg:h-40': !isInModal })}
                >
                  <Link href={`products/${product.slug}`}>
                    {Boolean(getThumbnailImage(product)) && <Image fill src={getThumbnailImage(product).url} alt="" />}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div
            className={classNames('py-4 flex flex-col justify-between', {
              'pb-0': isInModal,
            })}
          >
            <div className={classNames('cursor-pointer group', { 'lg:pt-4': !isInModal })}>
              <div className={classNames('max-w-2xl', { 'lg:w-full': !isInModal })}>
                <span className="lg:text-2xl text-xl group-hover:underline duration-300 font-bold">{title}</span>
              </div>
            </div>

            {Boolean(removeItemFromCart) && (
              <button
                type="button"
                className={classNames('items-center mt-2 relative group h-5 hidden', { 'md:inline-flex': !isInModal })}
                onClick={handleRemoveProductButtonClick}
              >
                <Image
                  width={16}
                  height={16}
                  unoptimized
                  src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282950/csk-icons/icon-cross-blue_qyhkct_o7gzai.svg"
                  alt="icon-cross"
                  className="fill-blue-500 group-hover:stroke-blue-400 duration-300 stroke-transparent w-3"
                />
                <span className="text-blue-500 group-hover:underline duration-300 text-sm font-bold pl-2">
                  &nbsp;{t('Remove')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={classNames('flex flex-row justify-between basis-2/5', { 'md:pt-12 md:pb-8': !isInModal })}>
        <div>
          <div className={classNames('font-bold block pb-2', { 'md:hidden': !isInModal })}>QTY</div>
          {Boolean(updateItemQuantity) ? (
            <ProductQuantityItem
              buttonStyle="primary"
              onClickIncrement={increaseProductQuantity}
              onClickDecrement={decreaseProductQuantity}
              quantity={quantity}
            />
          ) : (
            <span className="font-bold text-secondary-content select-none">{quantity}</span>
          )}
        </div>
        <div>
          <div className={classNames('font-bold block pb-2', { 'md:hidden': !isInModal })}>{t('Price')}</div>
          <div className="text-xl relative">
            <CurrencyFormatter amount={totalWithoutDiscount} />
            <div className="w-auto h-[3px] bg-red-500 absolute top-1/2 left-[-20px] right-[-20px] rotate-[-16deg]" />
          </div>
          <CurrencyFormatter className="text-2xl" amount={totalWithDiscount} />
        </div>
      </div>
    </div>
  );
};

export default ShoppingBundle;
