import { FC, ReactNode, createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useUniformContext } from '@uniformdev/context-react';
import useStorage from '../../hooks/useStorage';

const ShoppingCartModal = dynamic(() => import('./ShoppingCartModal').then(com => com), {
  ssr: false,
});

type FakeCart = Record<string, CommerceTypes.FakeCartItem>;

export const DEFAULT_FORM_VALUES: CheckoutFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

export enum CheckoutStep {
  BillingInfo = 'BillingInfo',
  ShippingInfo = 'ShippingInfo',
  ReadyToFinish = 'ReadyToFinish',
  Finished = 'Finished',
}

interface FakeCartContextProps {
  cart: FakeCart;
  isCartLoading: boolean;
  cartItems: CommerceTypes.CartItem[];
  cartAmount: number;
  currentStep: CheckoutStep;
  totalFakeCartItemsCount: number;
  isModalFakeCartOpen: boolean;
  billingData: CheckoutFormData;
  shippingData: CheckoutFormData;
  setCurrentStep: (step: CheckoutStep, options?: { force: boolean }) => void;
  setBillingData: (data: CheckoutFormData, options?: { force: boolean }) => void;
  setShippingData: (data: CheckoutFormData, options?: { force: boolean }) => void;
  setIsModalFakeCartOpen: (isOpen: boolean) => void;
  addItemToFakeCart: (item: CommerceTypes.FakeCartAddItem) => void;
  updateItemQuantity: (productKey: string, quantity: number) => void;
  removeItemFromFakeCart: (productKey: string) => void;
  emptyFakeCart: () => void;
}

export const FakeCartContext = createContext<FakeCartContextProps>({
  cart: {},
  cartItems: [],
  isCartLoading: false,
  cartAmount: 0,
  totalFakeCartItemsCount: 0,
  isModalFakeCartOpen: false,
  currentStep: CheckoutStep.BillingInfo,
  setCurrentStep: () => null,
  billingData: DEFAULT_FORM_VALUES,
  shippingData: DEFAULT_FORM_VALUES,
  setBillingData: () => null,
  setShippingData: () => null,
  setIsModalFakeCartOpen: () => null,
  addItemToFakeCart: () => null,
  updateItemQuantity: () => null,
  removeItemFromFakeCart: () => null,
  emptyFakeCart: () => null,
});

type Styles = {
  modal?: {
    container?: string;
  };
};

export type FakeCartContextProviderProps = {
  children: ReactNode;
  styles?: Styles;
};

export enum FakeCartDataStorageKey {
  UserCart = 'user-cart',
  CheckoutStep = 'checkout-step',
  BillingInfo = 'billing-info',
  ShippingInfo = 'shipping-info',
}

export type CheckoutFormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const FakeCartContextProvider: FC<FakeCartContextProviderProps> = ({ styles, children }) => {
  const { locale } = useRouter();

  const [cart, setFakeCart] = useStorage<FakeCart>(FakeCartDataStorageKey.UserCart, {});

  const [cartItems, setCartItems] = useState<CommerceTypes.CartItem[]>([]);

  const [isCartLoading, setIsCartLoading] = useState<boolean>(false);
  const { context } = useUniformContext();

  const updateCart: typeof setFakeCart = useCallback(
    (newValue, options) => {
      window.dispatchEvent(
        new CustomEvent('Update cart', {
          detail: options?.force ? newValue : { ...cart, ...newValue },
        })
      );
      setFakeCart(newValue, options);
    },
    [cart, setFakeCart]
  );

  const [currentStep, setCurrentStep] = useStorage<CheckoutStep>(
    FakeCartDataStorageKey.CheckoutStep,
    CheckoutStep.BillingInfo
  );

  const fetchProductCart = useCallback(async () => {
    setIsCartLoading(true);

    const cartProducts = Object.entries(cart)
      .filter(([, item]) => item.productKey)
      .map(([productKey]) => productKey);

    const cartBundles = Object.entries(cart)
      .filter(([, item]) => item.bundleId)
      .map(([productKey]) => productKey);

    const productCodes = encodeURIComponent(JSON.stringify(cartProducts));
    const bundleCodes = encodeURIComponent(JSON.stringify(cartBundles));

    const { products, bundles } = await fetch(
      `/api/cart?productKeys=${productCodes}&bundleKeys=${bundleCodes}&locale=${locale}`
    )
      .then(res => res.json())
      .finally(() => setIsCartLoading(false));

    const newProductCartItems =
      products?.map((product: CommerceTypes.Product) => {
        const cartItem = cart[product.key];
        return {
          product,
          quantity: cartItem?.quantity,
        };
      }) || [];

    const newBundleCartItems =
      bundles?.map((bundle: CommerceTypes.ProductBundle) => {
        const cartItem = cart[bundle.id];
        return {
          bundle,
          quantity: cartItem?.quantity,
        };
      }) || [];

    setCartItems([...newProductCartItems, ...newBundleCartItems]);
  }, [locale, cart]);

  useEffect(() => {
    fetchProductCart();
  }, [fetchProductCart]);

  const [billingData, setBillingData] = useStorage(FakeCartDataStorageKey.BillingInfo, DEFAULT_FORM_VALUES);

  const [shippingData, setShippingData] = useStorage(FakeCartDataStorageKey.ShippingInfo, DEFAULT_FORM_VALUES);
  const [isModalFakeCartOpen, setIsModalFakeCartOpen] = useState<boolean>(false);

  const addItemToFakeCart = useCallback(
    (item: CommerceTypes.FakeCartAddItem) => {
      const cardItemId = item.productKey || item.bundleId;

      if (!cardItemId) return;

      const cartItem = cart[cardItemId];

      if (cartItem) {
        updateCart({
          [cardItemId]: {
            ...cartItem,
            quantity: cartItem.quantity + item.quantity,
          },
        });
      } else {
        updateCart({
          [cardItemId]: {
            quantity: item.quantity,
            productKey: item.productKey,
            bundleId: item.bundleId,
          },
        });
      }

      setIsModalFakeCartOpen(true);
    },
    [cart, updateCart]
  );

  const removeItemFromFakeCart = useCallback(
    (productKey: string) => {
      const updatedFakeCart = Object.entries(cart).reduce<FakeCart>((acc, [key, value]) => {
        if (key !== productKey) acc[key] = value;
        return acc;
      }, {});
      if (!Object.keys(updatedFakeCart).length) setIsModalFakeCartOpen(false);
      updateCart(updatedFakeCart, { force: true });
    },
    [cart, updateCart]
  );

  const emptyFakeCart = useCallback(() => {
    if (currentStep === CheckoutStep.Finished) {
      setIsModalFakeCartOpen(false);
      updateCart({}, { force: true });
      setBillingData(DEFAULT_FORM_VALUES, { force: true });
      setShippingData(DEFAULT_FORM_VALUES, { force: true });
      setCurrentStep(CheckoutStep.BillingInfo, { force: true });
    }
  }, [updateCart, setBillingData, setShippingData, setCurrentStep, currentStep]);

  const updateItemQuantity = useCallback(
    (productKey: string, quantity: number) => {
      const cartItem = cart[productKey];
      if (!cartItem) return;
      updateCart({ [productKey]: { ...cartItem, quantity } });
    },
    [cart, updateCart]
  );

  const totalFakeCartItemsCount = useMemo(
    () =>
      cartItems.reduce((acc, cartItem) => {
        if (cartItem.product) {
          return acc + cartItem.quantity;
        } else if (cartItem.bundle) {
          return acc + cartItem.quantity * cartItem.bundle?.products?.length;
        }
        return acc;
      }, 0),
    [cartItems]
  );

  useEffect(() => {
    if (totalFakeCartItemsCount) {
      context.update({ quirks: { isCartEmpty: 'false' } });
    } else {
      context.update({ quirks: { isCartEmpty: 'true', abandoned: 'false' } });
    }
  }, [totalFakeCartItemsCount, context]);

  const cartAmount = useMemo(
    () =>
      cartItems.reduce((acc, cartItem) => {
        if (cartItem.product) {
          return acc + cartItem.quantity * ((cartItem.product.price as number) || 0);
        } else if (cartItem.bundle) {
          const totalProductPrice = cartItem.bundle.products?.reduce((acc, product) => acc + Number(product.price), 0);

          const totalWithDiscount = totalProductPrice - totalProductPrice / cartItem?.bundle?.discount;

          return acc + cartItem.quantity * (totalWithDiscount || 0);
        }
        return acc;
      }, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cart,
      cartItems,
      isCartLoading,
      cartAmount,
      billingData,
      shippingData,
      setBillingData,
      setShippingData,
      currentStep,
      totalFakeCartItemsCount,
      setCurrentStep,
      isModalFakeCartOpen,
      setIsModalFakeCartOpen,
      addItemToFakeCart,
      updateItemQuantity,
      removeItemFromFakeCart,
      emptyFakeCart,
    }),
    [
      cart,
      cartItems,
      isCartLoading,
      cartAmount,
      billingData,
      shippingData,
      setBillingData,
      setShippingData,
      totalFakeCartItemsCount,
      isModalFakeCartOpen,
      setIsModalFakeCartOpen,
      addItemToFakeCart,
      updateItemQuantity,
      removeItemFromFakeCart,
      emptyFakeCart,
      setCurrentStep,
      currentStep,
    ]
  );

  return (
    <FakeCartContext.Provider value={value}>
      {children}
      <ShoppingCartModal styles={styles?.modal} />
    </FakeCartContext.Provider>
  );
};

export default FakeCartContextProvider;

export const useFakeCartContext = () => useContext(FakeCartContext);
