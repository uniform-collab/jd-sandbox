import { ComponentType } from 'react';
import classNames from 'classnames';
import { ComponentProps } from '@uniformdev/canvas-react';
import { metrophobic } from '../../fonts';
import { CardVariants } from '../../canvas/Card';

const getOverriddenCoveoResultList =
  <T,>(Component: ComponentType<ComponentProps<T>>): ComponentType<ComponentProps<T>> =>
  (props: ComponentProps<T>) => {
    const component = props.component?.slots?.resultItemComponent?.[0];
    const textColorVariant = component?.parameters?.textColorVariant;

    const textColorVariantValue = textColorVariant?.value;
    return (
      <Component
        {...props}
        itemStyles={{
          title: classNames({ 'text-secondary': component?.variant === CardVariants.Featured }),
          description: metrophobic.className,
          container: '!border-0 !rounded-none',
          image: classNames({
            'h-96': ![CardVariants.BackgroundImage, CardVariants.Featured].includes(component?.variant as CardVariants),
          }),
          cardBody: classNames({
            'bg-gradient-to-t from-[#000] from-[0%] to-[#55493B] to-[150.76%]':
              !component?.variant && textColorVariantValue !== 'Dark',
            'px-0': !component?.variant && textColorVariantValue !== 'Light',
          }),
        }}
      />
    );
  };

export default getOverriddenCoveoResultList;
