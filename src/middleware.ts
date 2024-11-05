/* eslint-disable @typescript-eslint/ban-ts-comment */
import { parse } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';
import { Context, CookieTransitionDataStore, UNIFORM_DEFAULT_COOKIE_NAME } from '@uniformdev/context';
import { createUniformEdgeMiddleware } from '@uniformdev/context-edge-vercel';

import { STORE_ANONYMOUS_ID_COOKIE_NAME } from './modules/segment/constants';
import { STORE_USER_COOKIE_NAME } from './modules/auth/constants';
import { formatQuirksFormTraits } from './modules/segment/utilities';
// @ts-ignore: It is assumed that each application implements the locales file at the appropriate location
import locales from '@/context/locales.json';
import { getManifestClient } from './utilities/canvas/canvasClients';

const SKIP_MIDDLEWARE_FOR_SSR_PAGES = ['/profile', '/:locale/profile'];

const NEXT_LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

const INSIGHTS_HOST = process.env.UNIFORM_INSIGHTS_ENDPOINT;
const INSIGHTS_API_KEY = process.env.UNIFORM_INSIGHTS_KEY;

// ToDo: the best place should be discussed
const COUNTRY_PRIORITY_LOCALES: Record<string, string> = {
  NL: 'nl-NL',
  DK: 'nl-NL',
  BE: 'nl-NL',
  DE: 'nl-NL',
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     */
    '/(.*?trpc.*?|(?!static|.*\\..*|_next|images|img|api|favicon.ico).*)',
    '/',
  ],
};

async function getManifest() {
  return getManifestClient().get();
}

export async function middleware(request: NextRequest) {
  const data = request.headers.get('x-nextjs-data');
  const previewDataCookie = request.cookies.get('__next_preview_data');
  const {
    nextUrl: { search },
  } = request;

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  // disabling middleware in preview
  if (Boolean(previewDataCookie) || Boolean(data) || params.is_incontext_editing_mode === 'true') {
    return NextResponse.next();
  }

  const url = request.nextUrl;
  const queryParams = urlSearchParams.toString();

  // rewriting for insights
  if (INSIGHTS_HOST && INSIGHTS_API_KEY && url.pathname === '/v0/events') {
    const insightsPath = `${INSIGHTS_HOST}${url.pathname}?${queryParams}`;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${INSIGHTS_API_KEY}`);
    return NextResponse.rewrite(new URL(insightsPath), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // locale redirection
  const currentLocale = request.cookies.get(NEXT_LOCALE_COOKIE_NAME)?.value;
  if (currentLocale && currentLocale !== url.locale) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}${url.pathname}${queryParams ? `?${queryParams}` : ''}`, request.url)
    );
  }

  const currentCountryCode = request.geo?.country;
  if (!currentLocale && currentCountryCode) {
    const recommendedLocale = currentCountryCode ? COUNTRY_PRIORITY_LOCALES[currentCountryCode] : undefined;
    const foundLocale =
      recommendedLocale && locales.locales.includes(recommendedLocale)
        ? recommendedLocale
        : locales.locales.find((locale: string) => locale.endsWith(currentCountryCode));
    if (foundLocale) {
      const newResponse = NextResponse.redirect(
        new URL(`/${foundLocale}${url.pathname}${queryParams ? `?${queryParams}` : ''}`, request.url)
      );
      newResponse.cookies.set(NEXT_LOCALE_COOKIE_NAME, foundLocale);
      return newResponse;
    }
  }

  const isSsrPage = SKIP_MIDDLEWARE_FOR_SSR_PAGES.includes(url.pathname);

  // disabling edge-side personalization in locally and SSR pages
  if (!process.env.VERCEL_URL || isSsrPage) {
    return NextResponse.next();
  }

  const serverCookieValue = request
    ? parse(request.headers.get('cookie') ?? '')[UNIFORM_DEFAULT_COOKIE_NAME]
    : undefined;

  // ManifestClient has some caching mechanism, so looks like it's safe to call it on each request
  const manifest = await getManifest();

  const context = new Context({
    defaultConsent: true,
    manifest,
    transitionStore: new CookieTransitionDataStore({
      serverCookieValue,
    }),
  });

  const userId = request.cookies.get(STORE_USER_COOKIE_NAME)?.value || '';
  const anonymousId = request.cookies.get(STORE_ANONYMOUS_ID_COOKIE_NAME)?.value || '';

  if (userId || anonymousId) {
    await fetch(`https://${process.env.VERCEL_URL}/api/user/traits?user_id=${userId}&anonymous_id=${anonymousId}`, {
      cache: 'no-store',
    })
      .then(result => result.json())
      .then(quirks => context.update({ quirks: formatQuirksFormTraits(quirks) }))
      .catch(e => console.error(e));
  }

  const handler = createUniformEdgeMiddleware();

  const response = await handler({
    context,
    origin: new URL(request.url),
    request,
  });

  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  return response;
}
