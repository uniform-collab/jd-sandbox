import { FC, useCallback } from 'react';
import { registerUniformComponent, ComponentProps } from '@uniformdev/canvas-react';
import BaseProductInfo, { type Props as BaseProductInfoProps } from '../../components/BaseProductInfo';
import { useFakeCartContext } from './FakeCartProvider';

export type Props = ComponentProps<BaseProductInfoProps & { productKey: string }>;

const ProductInfo: FC<Props> = ({ productKey, ...props }) => {
  const { addItemToFakeCart } = useFakeCartContext();
  const handleButtonClick = useCallback(() => {
    addItemToFakeCart({
      productKey,
      quantity: 1,
    });

    window.dispatchEvent(
      new CustomEvent('Add to cart', {
        detail: {
          productKey,
          quantity: 1,
        },
      })
    );
  }, [productKey, addItemToFakeCart]);

  return <BaseProductInfo {...props} onClickPrimaryButton={handleButtonClick} />;
};

registerUniformComponent({
  type: 'productInfo',
  component: ProductInfo,
});

export default ProductInfo;
