import { NextApiRequest, NextApiResponse } from 'next';
import { deleteUser } from '../../../modules/auth/db-api';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;

  const { authError, ordersDeleteError, userDeleteError } = await deleteUser(id);

  if (authError || ordersDeleteError || userDeleteError) {
    return res.status(400).json(authError || ordersDeleteError || userDeleteError);
  }

  return res.status(200).json({ id });
};
