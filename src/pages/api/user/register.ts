import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, getUserProfileByEmail, mergeOrderHistory } from '../../../modules/auth/db-api';
import { STORE_ANONYMOUS_ID_COOKIE_NAME } from '../../../modules/auth/constants';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const anonymous_id = req.cookies[STORE_ANONYMOUS_ID_COOKIE_NAME];
  const { name, email } = req.body;

  const { data: foundResult, error: selectError } = await getUserProfileByEmail(email);

  if (selectError) {
    return res.status(400).json({ ...selectError });
  } else if (foundResult) {
    return res.status(400).json({ message: 'This email is already associated with an account' });
  }

  const { authError, data, error } = await createUser({ name, email });

  if (authError) {
    return res.status(authError.status || 500).json(authError);
  }

  if (error) {
    return res.status(400).json(error);
  }

  if (anonymous_id && data?.id) {
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
