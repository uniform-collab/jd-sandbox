import { NextApiRequest, NextApiResponse } from 'next';
import { STORE_USER_COOKIE_NAME } from '../../../modules/auth/constants';
import { updateUser } from '../../../modules/auth/db-api';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_from_cookie = req.cookies[STORE_USER_COOKIE_NAME];
  const { id = id_from_cookie, name, email } = req.body;

  const { data, authError, error } = await updateUser({ id, name, email });

  if (authError) {
    return res.status(authError.status || 500).json(authError);
  }

  if (error) {
    return res.status(400).json(error);
  }

  return res.status(200).json(data);
};
