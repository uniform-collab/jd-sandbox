import { createClient } from '@supabase/supabase-js';
import { RealtimePostgresChangesPayload } from '@supabase/realtime-js/src/RealtimeChannel';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const USER_EMAIL = process.env.SUPABASE_USER_EMAIL;
const USER_PASSWORD = process.env.SUPABASE_USER_PASSWORD;

const USER_TABLE_NAME = 'users';
const ORDERS_TABLE_NAME = 'orders';
const CART_TABLE_NAME = 'carts';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing environment variables for database');
}

const supabase = createClient<UserProfile.Database>(SUPABASE_URL, SUPABASE_KEY);

export const subscribeOnCartUpdate = (
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<UserProfile.Cart>) => void
) =>
  supabase
    .channel('custom-filter-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: CART_TABLE_NAME, filter: `user=eq.${userId}` },
      callback
    )
    .subscribe();

export const updateCart = async (userId: string, cart: UserProfile.FakeCart) => {
  const { error } = await auth();
  if (error) return { authError: error };
  const createCartResult = await supabase
    .from(CART_TABLE_NAME)
    .upsert({ user: Number(userId), cart })
    .select('*');
  return { data: createCartResult.data?.[0] || null, error: createCartResult.error };
};

export const getCartByUserId = async (userId: string) => {
  const { data, error } = await supabase.from(CART_TABLE_NAME).select('*').eq('user', userId);
  return { data: data?.[0] || null, error };
};

const auth = () => {
  if (!USER_EMAIL || !USER_PASSWORD) {
    return { error: { message: 'Missing environment variables for database', status: 500 } };
  }

  return supabase.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });
};

export const getUserProfileById = async (userId: string) => {
  const { data, error } = await supabase.from(USER_TABLE_NAME).select('*').eq('id', userId);
  if (error) return { error };
  return { data: data?.[0] || null, error };
};

export const getUserProfileByEmail = async (userEmail: string) => {
  const { data, error } = await supabase.from(USER_TABLE_NAME).select('*').eq('email', userEmail);
  if (error) return { error };
  return { data: data?.[0] || null, error };
};

export const getOrdersByAnonymousId = (anonymous_id: string, limit = 20) =>
  supabase
    .from(ORDERS_TABLE_NAME)
    .select('*')
    .eq('anonymous_id', anonymous_id)
    .order('created_at', { ascending: false })
    .limit(limit);

export const mergeOrderHistory = async (userId: number, anonymous_id: string) => {
  const { error } = await auth();
  if (error) return { authError: error };
  const mergeOrderResult = await supabase
    .from(ORDERS_TABLE_NAME)
    .update({ user: userId })
    .eq('anonymous_id', anonymous_id)
    .select('*');
  return { data: mergeOrderResult.data?.[0] || null, error: mergeOrderResult.error };
};

export const getOrdersByUserId = (user_id: string, limit = 20) =>
  supabase
    .from(ORDERS_TABLE_NAME)
    .select('*')
    .eq('user', user_id)
    .order('created_at', { ascending: false })
    .limit(limit);

export const createUser = async (user: UserProfile.UserInsetProps) => {
  const { error } = await auth();
  if (error) return { authError: error };
  const createUserResult = await supabase
    .from(USER_TABLE_NAME)
    .insert({ ...user })
    .select('*');
  return { data: createUserResult.data?.[0] || null, error: createUserResult.error };
};

export const updateUser = async (user: UserProfile.UserUpdateProps) => {
  const { error } = await auth();
  if (error) return { authError: error };
  const updateUserResult = await supabase
    .from(USER_TABLE_NAME)
    .upsert({ ...user })
    .select('*');
  return { data: updateUserResult.data?.[0] || null, error: updateUserResult.error };
};

export const deleteUser = async (userId: string) => {
  const { error } = await auth();
  if (error) return { authError: error };
  const { error: ordersDeleteError } = await supabase.from(ORDERS_TABLE_NAME).delete().eq('user', userId);
  const { error: userDeleteError } = await supabase.from(USER_TABLE_NAME).delete().eq('id', userId);

  return { ordersDeleteError, userDeleteError };
};

export const addOrder = async (
  userId: string | undefined,
  anonymous_id: string | undefined,
  cart: UserProfile.OrderItem
) => {
  const { error } = await auth();
  if (error) return { authError: error };
  const addOrderResult = await supabase
    .from(ORDERS_TABLE_NAME)
    .insert({ user: Number(userId) || null, anonymous_id: anonymous_id || null, cart: cart })
    .select('*');
  return { data: addOrderResult.data?.[0] || null, error: addOrderResult.error };
};
