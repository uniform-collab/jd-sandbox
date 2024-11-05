import { NextApiRequest, NextApiResponse } from 'next';
import { getUserProfileByEmail, mergeOrderHistory } from '../../../modules/auth/db-api';
import { STORE_ANONYMOUS_ID_COOKIE_NAME } from '../../../modules/auth/constants';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const anonymous_id = req.cookies[STORE_ANONYMOUS_ID_COOKIE_NAME];
  const { email } = req.body;
  const { data, error } = await getUserProfileByEmail(email);

  if (error) {
    return res.status(400).json(error);
  }

  if (!data) {
    return res.status(400).json({ message: 'This email does not exist' });
  }

  if (anonymous_id) {
    const { authError, error: errorMergeOrderHistory } = await mergeOrderHistory(data.id, anonymous_id);
    if (authError) {
      return res.status(authError.status || 500).json(authError);
    }

    if (errorMergeOrderHistory) {
      console.error(errorMergeOrderHistory);
    }
  }

  return res.status(200).json(data);
};
