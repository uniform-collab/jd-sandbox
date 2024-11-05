import { NextApiRequest, NextApiResponse } from 'next';
import { ContentClient } from '@uniformdev/canvas';
import { normalizeProduct } from '../../../modules/fake-cart/normalizeProduct';
import { normalizeProductBundle } from '../../../modules/fake-cart/normalizeProductBundle';
import { getContentClient } from '../../../utilities/canvas/canvasClients';

const getMemoizedContentClient = (() => {
  let canvasClient: ContentClient;
  return () => {
    if (!canvasClient) canvasClient = getContentClient();
    return canvasClient;
  };
})();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { productKeys, bundleKeys, locale = 'en-US' } = req.query;

  const productIDs = JSON.parse(productKeys as string);
  const bundleIDs = JSON.parse(bundleKeys as string);

  const entryIDs = [...productIDs, ...bundleIDs];

  if (!entryIDs || !entryIDs.length) {
    return res.status(200).json([]);
  }

  const { entries: contentEntries } = await getMemoizedContentClient()?.getEntries({
    entryIDs,
    locale: locale as string,
  });

  const productBundles = contentEntries.filter(item => item.entry.type === 'productBundle');

  const products = contentEntries.filter(item => item.entry.type === 'product');

  const normalizedProducts = products?.map(entry => normalizeProduct(entry));
  const normalizedProductBudles = productBundles?.map(entry => normalizeProductBundle(entry));

  return res.status(200).json({
    products: normalizedProducts,
    bundles: normalizedProductBudles,
  });
};
