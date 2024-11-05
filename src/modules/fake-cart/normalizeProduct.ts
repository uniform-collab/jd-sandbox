import type { Asset } from '@uniformdev/assets';
import { getMediaUrl } from '../../utilities';

export const normalizeProduct = (payload: CommerceTypes.AddToCartItem): CommerceTypes.Product => {
  try {
    //If entry is present then it is a product from Uniform Content
    if (payload?.entry) {
      const entryFields = payload.entry.fields;

      const variantFields = entryFields.variants.value[0].fields;

      return {
        id: variantFields.code?.value,
        key: payload.entry._id,
        slug: payload?.entry?._slug,
        name: entryFields?.name?.value,
        description: entryFields?.shortDescription?.value,
        price: variantFields?.price?.value,
        categories: [entryFields?.category?.value],
        rootCategories: [entryFields?.category?.value],
        subCategories: [entryFields?.category?.value],
        thumbnailId: '0',
        images: variantFields?.imageGallery?.value.map((image: Asset, index: number) => ({
          id: index.toString(),
          url: getMediaUrl(image),
        })),
      };
    }

    const product = payload as CommerceTypes.AddToCartItem;

    const isImagesNormalized = (product.images as CommerceTypes.ProductImage[])[0]?.id;

    return {
      id: payload.id || '',
      key: payload.id || '',
      slug: payload.slug || '',
      name: payload.name as string,
      description: payload.description as string,
      price: payload.ec_price ? (payload.ec_price as number) : (payload.price as number),
      categories: (payload.categories as string[]) || [
        ...(payload.ec_category as string[]),
        ...(payload.sub_category as string[]),
      ],
      rootCategories: (payload.rootCategories as string[]) || (payload.ec_category as string[]),
      subCategories: (payload.rootCategories as string[]) || (payload.sub_category as string[]),
      images: isImagesNormalized
        ? (payload.images as CommerceTypes.ProductImage[])
        : (payload.images as string[])?.map((image: string, index) => ({
            id: index.toString(),
            url: image,
          })) || [],
      thumbnailId: (payload.thumbnailId as string) || '0',
    };
  } catch (error) {
    return {
      name: '',
      key: '',
      id: '',
      slug: '',
      description: '',
      price: 0,
      categories: [],
      rootCategories: [],
      subCategories: [],
      images: [],
      thumbnailId: '',
      ...payload,
    };
  }
};

export default normalizeProduct;
