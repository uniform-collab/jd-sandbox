import { FC, useCallback } from 'react';
import { registerUniformComponent, ComponentProps } from '@uniformdev/canvas-react';
import BaseAddToCart, { BaseAddToCartProps } from '../../components/BaseAddToCart';
import { useFakeCartContext } from './FakeCartProvider';

export type Props = ComponentProps<
  {
    productKey: string;
  } & BaseAddToCartProps
>;

const AddToCart: FC<Props> = ({ buttonStyle, buttonCopy, productKey }) => {
  const { addItemToFakeCart } = useFakeCartContext();
  const handleButtonClick = useCallback(
    (quantity: number) => {
      addItemToFakeCart({
        productKey,
        quantity,
      });

      window.dispatchEvent(
        new CustomEvent('Add to cart', {
          detail: {
            productKey,
            quantity,
          },
        })
      );
    },
    [productKey, addItemToFakeCart]
  );

  return <BaseAddToCart buttonStyle={buttonStyle} buttonCopy={buttonCopy} onClick={handleButtonClick} />;
};

registerUniformComponent({
  type: 'addToCart',
  component: AddToCart,
});

export default AddToCart;
