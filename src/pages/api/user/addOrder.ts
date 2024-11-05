import { NextApiRequest, NextApiResponse } from 'next';
import { STORE_ANONYMOUS_ID_COOKIE_NAME, STORE_USER_COOKIE_NAME } from '../../../modules/auth/constants';
import { addOrder } from '../../../modules/auth/db-api';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_from_cookie = req.cookies[STORE_USER_COOKIE_NAME] || '';
  const anonymous_id_from_cookie = req.cookies[STORE_ANONYMOUS_ID_COOKIE_NAME];
  const { id = id_from_cookie, anonymous_id = anonymous_id_from_cookie, cartItems } = req.body;

  const { data, authError, error } = await addOrder(id, anonymous_id, cartItems);

  if (authError) {
    return res.status(authError.status || 500).json(authError);
  }

  if (error) {
    return res.status(400).json(error);
  }

  return res.status(200).json(data);
};
