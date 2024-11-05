import { useCallback, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { STORE_USER_COOKIE_NAME } from '../segment/constants';
import { getCartByUserId, subscribeOnCartUpdate } from './db-api';
import useStorage from '../../hooks/useStorage';
import { FakeCartDataStorageKey } from '../fake-cart/FakeCartProvider';
import { RealtimePostgresChangesPayload } from '@supabase/realtime-js/src/RealtimeChannel';
import { compareObjects } from '../../utilities';
import { useDebounce } from '../../hooks/useDebounce';

const EventTracker = () => {
  const [currentCart, setCurrentCart] = useStorage<UserProfile.FakeCart>(FakeCartDataStorageKey.UserCart, {});
  const userId = getCookie(STORE_USER_COOKIE_NAME);

  const addOrder = useCallback((ev: CustomEvent<{ cartItems: UserProfile.OrderItem[] }>) => {
    const { cartItems = [] } = ev.detail;
    fetch('/api/user/addOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }),
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCart = useCallback(
    useDebounce((ev: CustomEvent<UserProfile.FakeCart>) => {
      fetch('/api/user/updateCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart: ev.detail }),
      });
    }, 1000),
    []
  );

  const updateCurrentCart = useCallback(
    (payload: RealtimePostgresChangesPayload<UserProfile.Cart>) => {
      const { cart } = (payload.new as UserProfile.Cart) || {};
      if (cart && !compareObjects(currentCart, cart)) {
        setCurrentCart(cart, { force: true });
      }
    },
    [currentCart, setCurrentCart]
  );

  useEffect(() => {
    const channels = userId ? subscribeOnCartUpdate(userId, updateCurrentCart) : null;
    return () => {
      channels?.unsubscribe();
    };
  }, [updateCurrentCart, userId]);

  useEffect(() => {
    if (!userId) return;
    getCartByUserId(userId).then(({ data, error }) => {
      if (data && !error) {
        setCurrentCart(data.cart || {}, { force: true });
      } else {
        fetch('/api/user/updateCart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cart: currentCart }),
        });
      }
    }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    window.addEventListener('Update cart', updateCart as EventListener);
    return () => {
      window.removeEventListener('Update cart', updateCart as EventListener);
    };
  }, [updateCart, userId]);

  useEffect(() => {
    window.addEventListener('Order Completed', addOrder as EventListener);
    return () => {
      window.removeEventListener('Order Completed', addOrder as EventListener);
    };
  }, [addOrder]);

  return null;
};

export default EventTracker;
