import axios from 'axios';

const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
const SEGMENT_API_KEY = process.env.SEGMENT_API_KEY;
const BASE_URL = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles`;
const BASIC_AUTH = Buffer.from(SEGMENT_API_KEY + ':').toString('base64');

export const getSegmentTraitsById = (idSlug: string) =>
  axios
    .get<SegmentProfile.SegmentData>(`${BASE_URL}${idSlug}/traits`, {
      headers: {
        Authorization: `Basic ${BASIC_AUTH}`,
        'accept-encoding': 'gzip,deflate',
      },
    })
    .then(result => result?.data || { traits: {} })
    .catch(() => ({ traits: {} }));

export const getSegmentTraitsByAnonymousId = async (anonymousId: string) => {
  if (!SEGMENT_SPACE_ID || !SEGMENT_API_KEY) {
    console.info('The segment environment variables are not configured');
    return {};
  }

  const segmentData = await getSegmentTraitsById(`/anonymous_id:${anonymousId}`);
  return segmentData?.traits || {};
};

export const getSegmentTraitsByUserId = async (userId: string) => {
  if (!SEGMENT_SPACE_ID || !SEGMENT_API_KEY) {
    console.info('The segment environment variables are not configured');
    return {};
  }

  const segmentData = await getSegmentTraitsById(`/user_id:${userId}`);
  return segmentData?.traits || {};
};
