import { FC } from 'react';
import classNames from 'classnames';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import BaseCard, { CardVariants, CardProps } from '../../canvas/Card';
import { metrophobic } from '../../fonts';

const Card: FC<CardProps> = props => {
  const { component, textColorVariant = 'Light' } = props || {};

  return (
    <BaseCard
      {...props}
      textColorVariant={textColorVariant}
      styles={{
        title: classNames({ 'text-secondary': component.variant === CardVariants.Featured }),
        description: metrophobic.className,
        container: '!border-0 !rounded-none',
        imageContainer: classNames({
          'h-96': ![CardVariants.BackgroundImage, CardVariants.Featured].includes(component.variant as CardVariants),
        }),
        cardBody: classNames({
          'bg-gradient-to-t from-[#000] from-[0%] to-[#55493B] to-[150.76%]':
            !component.variant && textColorVariant !== 'Dark',
          'px-0': !component.variant && textColorVariant !== 'Light',
        }),
        image: '!border-0 !rounded-none',
      }}
    />
  );
};

[undefined, CardVariants.BackgroundImage, CardVariants.Featured].forEach(variantId => {
  registerUniformComponent({
    type: 'card',
    component: Card,
    variantId,
  });
});
