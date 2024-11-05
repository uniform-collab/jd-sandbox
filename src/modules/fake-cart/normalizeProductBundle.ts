import { flattenValues, EntryData } from '@uniformdev/canvas';
import normalizeProduct from './normalizeProduct';

export const normalizeProductBundle = (payload: CommerceTypes.AddToCartItem): CommerceTypes.ProductBundle => {
  const bundle = payload?.entry;

  const flattenProductBundle = flattenValues(bundle) as Omit<CommerceTypes.ProductBundle, 'products'> &
    Record<string, EntryData[]>;

  return {
    ...flattenProductBundle,
    id: bundle._id,
    products: flattenProductBundle.products.map((product: EntryData) => normalizeProduct(product)),
  };
};

export default normalizeProductBundle;
