import { NextApiRequest, NextApiResponse } from 'next';
import { getSegmentTraitsByAnonymousId, getSegmentTraitsByUserId } from '../../../modules/segment/segment-api';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { user_id, anonymous_id } = req.query;
  if (!anonymous_id && !user_id) {
    return res.status(500).json({ message: 'AnonymousId and UserId not specified' });
  }
  const traits = user_id
    ? await getSegmentTraitsByUserId(user_id as string)
    : await getSegmentTraitsByAnonymousId(anonymous_id as string);
  return res.status(200).json(traits);
};
