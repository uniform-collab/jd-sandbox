/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import Head from 'next/head';
import { AppContext } from 'next/app';
import { parse } from 'cookie';
import { RootComponentInstance } from '@uniformdev/canvas';
import { UniformContext } from '@uniformdev/context-react';
import { UniformAppProps } from '@uniformdev/context-next';
import { Asset } from '@uniformdev/assets';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { LazyMotion, domAnimation } from 'framer-motion';
// @ts-ignore: It is assumed that each application implements the createUniformContext function at the appropriate location
import createUniformContext from '@/context/createUniformContext';
import TrackersProvider, { GoogleAnalyticsGtag } from '../modules/google-analytics/TrackersProvider';
import '@/canvas';
import FakeCartContextProvider from '../modules/fake-cart/FakeCartProvider';
import { formatQuirksFormTraits } from '../modules/segment/utilities';
import SegmentDataContextProvider from '../modules/segment/SegmentDataProvider';
import { STORE_ANONYMOUS_ID_COOKIE_NAME } from '../modules/segment/constants';
import UserProfileDataContextProvider from '../modules/auth/UserProfileDataProvider';
import { STORE_USER_COOKIE_NAME } from '../modules/auth/constants';
import { getOrdersByAnonymousId, getOrdersByUserId, getUserProfileById } from '../modules/auth/db-api';
import { getSegmentTraitsById } from '../modules/segment/segment-api';
import { getManifestFromDOM, getMediaUrl } from '../utilities';
import '../styles/globals.scss';

const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
const SEGMENT_API_KEY = process.env.SEGMENT_API_KEY;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

export const App = ({
  Component,
  pageProps,
  serverUniformContext,
}: UniformAppProps<{
  segmentData?: SegmentProfile.SegmentData;
  profileData?: UserProfile.ProfileData;
  data: RootComponentInstance;
  context?: unknown;
  translations?: Record<string, string>;
}>) => {
  const router = useRouter();
  const { data: composition } = pageProps || {};
  const {
    pageTitle,
    pageMetaDescription,
    pageKeywords,
    openGraphTitle,
    openGraphDescription,
    openGraphImage,
    overlayTitleToOgImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    overlayTitleToTwitterImage,
    twitterCard,
  } = composition?.parameters || {};
  //This is workaround because spaces removes from query params and not parsing automatically.
  //Space should be encoded as %20 http://www.faqs.org/rfcs/rfc1738.html
  const ogTitle = (openGraphTitle?.value as string)?.replaceAll?.(' ', '%20');
  const twTitle = (twitterTitle?.value as string)?.replaceAll?.(' ', '%20');
  const title: string = pageTitle?.value as string;

  const compositionHeader = composition?.slots?.pageHeader?.[0];

  const favicon = compositionHeader?.parameters?.favicon?.value as Asset | undefined;
  const faviconHref = getMediaUrl(favicon);

  const openGraphImageSrc = getMediaUrl(openGraphImage?.value as Asset | undefined);
  const twitterImageSrc = getMediaUrl(twitterImage?.value as Asset | undefined);

  const renderOgImageElement = () => {
    if (overlayTitleToOgImage?.value && openGraphImageSrc) {
      return (
        <meta
          property="og:image"
          content={`${VERCEL_URL}/api/og?title=${
            ogTitle ?? title?.replaceAll?.(' ', '%20')
          }&image=${openGraphImageSrc}`}
        />
      );
    }
    if (openGraphImage?.value) return <meta property="og:image" content={openGraphImage?.value as string} />;
  };

  const renderTwitterImageElement = () => {
    if (overlayTitleToTwitterImage?.value && twitterImageSrc) {
      return (
        <meta
          property="twitter:image"
          content={`${VERCEL_URL}/api/og?title=${twTitle ?? title?.replaceAll?.(' ', '%20')}&image=${twitterImageSrc}`}
        />
      );
    }
    if (twitterImageSrc) return <meta property="twitter:image" content={twitterImageSrc} />;
  };

  const manifest = getManifestFromDOM();
  const clientContext = createUniformContext(manifest);

  const context = serverUniformContext ?? clientContext;
  const quirks = formatQuirksFormTraits(pageProps.segmentData?.traits);

  if (!!Object.keys(quirks).length) {
    context
      .update({
        quirks,
      })
      .then(() => console.info('The context has been updated based on the traits from Segment'))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => console.error(e));
  }

  return (
    <>
      <Head>
        {/* page metadata */}
        <title>{(pageTitle?.value as string) ?? 'Uniform Component Starter Kit'}</title>
        <meta name="description" content={pageMetaDescription?.value as string} />
        <meta name="keywords" content={pageKeywords?.value as string} />
        {/* Open Graph */}
        <meta property="og:title" content={(openGraphTitle?.value as string) ?? pageTitle?.value} />
        <meta
          property="og:description"
          content={(openGraphDescription?.value as string) ?? pageMetaDescription?.value}
        />
        {renderOgImageElement()}
        {/* Twitter */}
        <meta name="twitter:title" content={(twitterTitle?.value as string) ?? pageTitle?.value} />
        <meta name="twitter:card" content={(twitterCard?.value as string) ?? 'summary'} />
        <meta
          name="twitter:description"
          content={(twitterDescription?.value as string) ?? pageMetaDescription?.value}
        />
        {renderTwitterImageElement() as any} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
        {/* Other stuff */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="version" content={process.env.NEXT_PUBLIC_APP_VERSION} />
        {faviconHref && <link rel="shortcut icon" href={faviconHref} />}
        <GoogleAnalyticsGtag />
      </Head>
      <LazyMotion features={domAnimation}>
        <UniformContext context={context} outputType={process.env.VERCEL_URL ? 'edge' : 'standard'}>
          {/* FixMe: Think what timezone to use */}
          <NextIntlClientProvider
            locale={router.locale || 'en-US'}
            messages={pageProps.translations}
            timeZone="America/Chicago"
            onError={process.env.NODE_ENV !== 'development' ? () => null : undefined}
          >
            <SegmentDataContextProvider data={pageProps?.segmentData}>
              <UserProfileDataContextProvider data={pageProps?.profileData}>
                <Component {...pageProps} providers={FakeCartContextProvider} />
              </UserProfileDataContextProvider>
            </SegmentDataContextProvider>
            <TrackersProvider />
          </NextIntlClientProvider>
        </UniformContext>
      </LazyMotion>
    </>
  );
};

App.getInitialProps = async (context: AppContext) => {
  const statusCode = context.ctx.res?.statusCode;
  if (DISABLE_EXTRA_FEATURES || !SEGMENT_SPACE_ID || !SEGMENT_API_KEY || statusCode === 404) {
    return { pageProps: { statusCode } };
  }

  const userId = parse(context.ctx?.req?.headers?.cookie || '')?.[STORE_USER_COOKIE_NAME];

  // In case when this is anonymous user
  if (!SUPABASE_URL || !SUPABASE_KEY || !userId) {
    const ajs_anonymous_id = parse(context.ctx?.req?.headers?.cookie || '')?.[STORE_ANONYMOUS_ID_COOKIE_NAME];
    if (!ajs_anonymous_id) {
      return { pageProps: { statusCode } };
    }
    const segmentAnonymousData = await getSegmentTraitsById(`/anonymous_id:${ajs_anonymous_id}`);
    const { data: orders, error: errorGetOrders } = await getOrdersByAnonymousId(ajs_anonymous_id);
    if (errorGetOrders) {
      console.error(errorGetOrders);
    }
    return { pageProps: { segmentData: segmentAnonymousData, profileData: { orders }, statusCode } };
  }

  // In case when this is user from db
  const { data: profile, error: errorGetProfiles } = await getUserProfileById(userId);
  const { data: orders, error: errorGetOrders } = await getOrdersByUserId(userId);

  if (errorGetProfiles || errorGetOrders) {
    console.error(errorGetProfiles || errorGetOrders);
  }
  const profileData = { profile, orders };

  const ajs_userId = profileData?.profile?.id;
  const segmentUserData = await getSegmentTraitsById(`/user_id:${ajs_userId}`);

  return { pageProps: { segmentData: segmentUserData, profileData, statusCode } };
};

export default App;
