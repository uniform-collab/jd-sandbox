import { useCallback, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useScores, useUniformContext } from '@uniformdev/context-react';
import { formatQuirksFormTraits, getHighestScoredInterestEnrichment } from './utilities';
import { STORE_ANONYMOUS_ID_COOKIE_NAME, STORE_USER_COOKIE_NAME } from './constants';

const TrackerScoreSync = () => {
  const scores = useScores();
  const router = useRouter();
  const { context } = useUniformContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderCompletedListener = useCallback((ev: CustomEvent<{ cartItems: Record<string, any>[] }>) => {
    const { cartItems = [] } = ev.detail;

    const payload: SegmentProfile.OrderCompletedEvent = {
      products: cartItems.map(item => item?.product?.id)?.join(','),
      amount: cartItems.map(item => (item?.product?.price || 0) * item?.quantity).reduce((a, b) => a + b),
      categories: cartItems
        .map(item => item?.product?.categories)
        .filter(Boolean)
        .join(','),
    };
    global?.analytics?.track('Order Completed', payload);
    console.info(`The event 'Order complete' has been sent (amount: ${payload.amount})`);
  }, []);

  const addToCartListener = useCallback((ev: CustomEvent) => {
    const { product = {} } = ev.detail;
    const payload: SegmentProfile.SelectProductEvent = {
      product: product?.id,
      categories: product?.categories?.join(',') || '',
    };
    global?.analytics?.track('Add to cart', payload);
    console.info(`The event 'Add to cart' has been sent`);
  }, []);

  const addFavoriteProductListener = useCallback((ev: CustomEvent<SegmentProfile.SelectProductEvent>) => {
    global?.analytics?.track('Product Favorited', ev.detail);
    console.info(`The event 'Product Favorited' has been sent`);
  }, []);

  const resetAnonymousId = useCallback(
    (ev: CustomEvent<{ anonymousId?: string }>) => {
      context.forget(true);
      global?.analytics?.user()?.logout();
      global?.analytics?.setAnonymousId(ev.detail?.anonymousId || uuidv4());
      router.reload();
    },
    [context, router]
  );

  const identifyUser = useCallback(
    (ev: CustomEvent<{ userId?: string }>) => {
      const { userId } = ev.detail || {};
      if (userId) {
        global?.analytics?.identify(ev.detail?.userId);
        router.reload();
      } else {
        console.info(`The event 'Identify User': userId is not specified`);
      }
    },
    [router]
  );

  // Sending custom events
  useEffect(() => {
    window.addEventListener('Order Completed', orderCompletedListener as EventListener);
    window.addEventListener('Add to cart', addToCartListener as EventListener);
    window.addEventListener('Product Favorited', addFavoriteProductListener as EventListener);
    window.addEventListener('Reset AnonymousId', resetAnonymousId as EventListener);
    window.addEventListener('Identify User', identifyUser as EventListener);
    return () => {
      window.removeEventListener('Order Completed', orderCompletedListener as EventListener);
      window.removeEventListener('Add to cart', addToCartListener as EventListener);
      window.removeEventListener('Product Favorited', addFavoriteProductListener as EventListener);
      window.removeEventListener('Reset AnonymousId', resetAnonymousId as EventListener);
      window.removeEventListener('Identify User', identifyUser as EventListener);
    };
  }, [orderCompletedListener, addToCartListener, addFavoriteProductListener, resetAnonymousId, identifyUser]);

  // Sending events based on visitor navigation
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      global?.analytics?.page({
        path: url,
        referrer: window.location.origin,
        url: window.location.origin + url,
        search: '',
      });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // ToDo: for SSG + ESP
  useEffect(() => {
    const userId = getCookie(STORE_USER_COOKIE_NAME) || '';
    const anonymousId = getCookie(STORE_ANONYMOUS_ID_COOKIE_NAME) || '';
    if (userId || anonymousId) {
      fetch(`/api/user/traits?user_id=${userId}&anonymous_id=${anonymousId}`, { cache: 'no-store' })
        .then(result => result.json())
        .then(quirks => context.update({ quirks: formatQuirksFormTraits(quirks) }))
        .catch(e => console.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Interest update on the Segment side based on the highest Enrichment
  useEffect(() => {
    const interest = getHighestScoredInterestEnrichment(scores || {});
    if (!interest) return;
    global?.analytics?.identify(getCookie(STORE_USER_COOKIE_NAME) || '', { interest });
  }, [scores]);

  return null;
};

export default TrackerScoreSync;
