import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';

const Checkout = dynamic(() => import('./Checkout').then(mod => mod.default), { ssr: false });

const CheckoutContent: FC = () => <Checkout />;

registerUniformComponent({
  type: 'checkoutContent',
  component: CheckoutContent,
});

export default CheckoutContent;
