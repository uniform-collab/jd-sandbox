import { FC, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import type { Asset } from '@uniformdev/assets';
import { registerUniformComponent, ComponentProps, UniformText } from '@uniformdev/canvas-react';
import { getMediaUrl, REGEX_COLOR_HEX } from '../../utilities';
import Image from '../../components/Image';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import Button from '../../components/Button';
import { getTextColor } from '../../utilities/styling';
import { useFakeCartContext } from './FakeCartProvider';

export type BundleProduct = Types.UniformEntryApiResponse<{
  title: Types.UniformParameter<string>;
  primaryImage: Types.UniformParameter<Asset>;
  variants: Types.UniformParameter<Types.UniformEntry<{ price: Types.UniformParameter<number> }>[]>;
}>;

type BundleResponse = Types.UniformEntryApiResponse<{
  title: Types.UniformParameter<string>;
  description: Types.UniformParameter<string>;
  discount: Types.UniformParameter<number>;
  products: Types.UniformParameter<BundleProduct[]>;
}>;

type Bundle = Types.UniformParameter<BundleResponse> | BundleResponse;

export type ProductBundleProps = ComponentProps<{
  title?: string;
  bundle?: Bundle;
  buttonText?: string;
  buttonStyle?: Types.ButtonStyles;
  primaryTextColor?: Types.ThemeColorsValues;
  secondaryTextColor?: Types.ThemeColorsValues;
  hideDescription?: boolean;
}>;

const DEFAULT_COLOR = '#000';

export const ProductBundle: FC<ProductBundleProps> = ({
  bundle,
  buttonStyle,
  primaryTextColor,
  secondaryTextColor,
  hideDescription,
}) => {
  const { addItemToFakeCart } = useFakeCartContext();

  const currentTextPrimaryColor = REGEX_COLOR_HEX.test(primaryTextColor || DEFAULT_COLOR)
    ? primaryTextColor
    : undefined;

  const currentTextSecondaryColor = REGEX_COLOR_HEX.test(secondaryTextColor || DEFAULT_COLOR)
    ? secondaryTextColor
    : undefined;

  const {
    id: bundleId,
    title: productTitle,
    description,
    products,
    discount,
  } = useMemo(() => {
    const currentBundle: BundleResponse = bundle?.value || bundle;
    const fields = currentBundle?.entry?.fields;
    return {
      id: currentBundle?.entry?._id,
      title: fields?.title?.value,
      description: fields?.description?.value,
      discount: Number(fields?.discount?.value || '0'),
      products: fields?.products?.value?.map(product => ({
        id: product.entry._id,
        title: product.entry.fields.title.value,
        primaryImage: getMediaUrl(product.entry.fields.primaryImage.value),
        price: Number(product.entry.fields?.variants?.value?.[0].fields.price?.value) || 0,
      })),
    };
  }, [bundle]);

  const handleButtonClick = useCallback(() => {
    addItemToFakeCart({
      quantity: 1,
      bundleId,
    });
  }, [bundleId, addItemToFakeCart]);

  const totalWithoutDiscount = products?.reduce((acc, product) => acc + product.price, 0) || 0;
  const totalWithDiscount = totalWithoutDiscount - totalWithoutDiscount / discount;

  if (!bundle) return null;

  return (
    <div
      className={classNames('flex flex-col gap-8', {
        [getTextColor(primaryTextColor as Types.ThemeColorsValues)]: !currentTextPrimaryColor,
      })}
      style={{ color: currentTextPrimaryColor }}
    >
      <UniformText
        parameterId="title"
        className={classNames('uppercase text-3xl text-center', {
          [getTextColor(secondaryTextColor as Types.ThemeColorsValues)]: !currentTextSecondaryColor,
        })}
        style={{ color: currentTextSecondaryColor }}
      />

      <div className="flex flex-col gap-4">
        <div className="uppercase text-3xl text-center">{productTitle}</div>
        {!hideDescription && <div className="text-center">{description}</div>}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col md:flex-row gap-6">
          {products?.map((product, index) => (
            <div key={product.title} className="flex flex-col md:flex-row justify-center items-center gap-6 h-full">
              <div
                className={classNames('text-center text-3xl text-secondary', {
                  invisible: index === 0,
                })}
              >
                +
              </div>
              <div className="flex flex-col gap-2 items-center h-full">
                <Image
                  className="aspect-square"
                  width={350}
                  height={350}
                  src={product.primaryImage}
                  alt={product.title || ''}
                />
                <CurrencyFormatter className="text-2xl" amount={product.price} />
              </div>
            </div>
          ))}
        </div>
        {products?.length && (
          <>
            <div className="text-center text-5xl">=</div>
            <div className="text-xl relative">
              <CurrencyFormatter amount={totalWithoutDiscount} />
              <div className="w-auto h-[3px] bg-red-500 absolute top-1/2 left-[-20px] right-[-20px] rotate-[-16deg]" />
            </div>
            <CurrencyFormatter
              className={classNames('text-4xl', {
                [getTextColor(secondaryTextColor as Types.ThemeColorsValues)]: !currentTextSecondaryColor,
              })}
              amount={totalWithDiscount}
            />
          </>
        )}

        <Button
          onClick={handleButtonClick}
          style={buttonStyle || 'primary'}
          className="w-full md:w-1/4"
          copy={<UniformText parameterId="buttonText" />}
        />
      </div>
    </div>
  );
};

registerUniformComponent({
  type: 'productBundle',
  component: ProductBundle,
});
