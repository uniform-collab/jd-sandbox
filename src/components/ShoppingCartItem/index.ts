export interface ShoppingCartItemProps {
  product: CommerceTypes.Product;
  quantity: number;
  discount?: number;
  isInModal?: boolean;
  updateItemQuantity?: (productKey: string, newQuantity: number) => void;
  removeItemFromCart?: (productKey: string) => void;
}

export * from './ShoppingCartItem';
export { default } from './ShoppingCartItem';
