import { ComponentType } from 'react';
import classNames from 'classnames';
import { ComponentProps } from '@uniformdev/canvas-react';
import { metrophobic } from '../../fonts';
import { CardVariants } from '../../canvas/Card';

const getOverriddenSearchEntryResultList =
  <T,>(Component: ComponentType<ComponentProps<T>>): ComponentType<ComponentProps<T>> =>
  (props: ComponentProps<T>) => {
    const component = props.component?.slots?.resultItem?.[0];
    const componentVariant = props.component?.variant;
    const textColorVariant = component?.parameters?.textColorVariant;

    const textColorVariantValue = textColorVariant?.value;
    return (
      <Component
        {...props}
        itemStyles={{
          title: classNames({ 'text-secondary': componentVariant === CardVariants.Featured }),
          description: metrophobic.className,
          container: '!border-0 !rounded-none',
          imageContainer: classNames({
            'h-96': ![CardVariants.BackgroundImage, CardVariants.Featured].includes(componentVariant as CardVariants),
          }),
          cardBody: classNames({
            'bg-gradient-to-t from-[#000] from-[0%] to-[#55493B] to-[150.76%]':
              !componentVariant && textColorVariantValue !== 'Dark',
            'px-0': !componentVariant && textColorVariantValue !== 'Light',
          }),
        }}
      />
    );
  };

export default getOverriddenSearchEntryResultList;
