declare namespace CommerceTypes {
  interface ProductImage {
    id: string;
    url: string;
  }

  interface Product {
    id: string;
    key: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    categories: string[];
    rootCategories?: string[];
    subCategories?: string[];
    thumbnailId: string;
    images: ProductImage[];
  }

  interface ProductBundle {
    id: string;
    logo: ProductImage[];
    title: string;
    discount: number;
    description: string;
    products: Product[];
  }

  interface Category {
    id: string;
    name: string;
    url: string;
    parentId: string;
  }

  type ProductsHashCache = Record<string, Product>;

  interface SearchParams {
    limit?: string;
    page?: string;
    categoryId?: string;
    keyword?: string;
    sortField?: 'price' | 'id' | 'name' | 'slug' | 'description';
    sortDirection?: string;
  }

  interface AddToCartItem {
    id?: string;
    slug?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  //TODO: think how to improve normalize process
  interface FakeCartAddItem {
    productKey?: string;
    quantity: number;
    bundleId?: bundleId;
  }

  interface FakeCartItem {
    productKey?: string;
    quantity: number;
    bundleId?: bundleId;
  }

  interface CartItem {
    product: Product;
    quantity: number;
    bundle?: ProductBundle;
  }
}
