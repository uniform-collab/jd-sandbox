/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC } from 'react';
import { GetStaticPaths } from 'next';
import { CANVAS_DRAFT_STATE, CANVAS_PUBLISHED_STATE } from '@uniformdev/canvas';
import { withUniformGetStaticProps, prependLocale } from '@uniformdev/canvas-next/route';
import { getBreadcrumbs, getProjectMapClient, getRouteClient, getState } from '../utilities/canvas/canvasClients';
// @ts-ignore: It is assumed that each application implements the Page at the appropriate location
import Page, { PageProps } from '@/components/Page';
// @ts-ignore: It is assumed that each application implements the ProductDetailsPage at the appropriate location
import ProductDetailsPage from '@/components/ProductDetailsPage';
// @ts-ignore: It is assumed that each application implements the localeSettings json at the appropriate location
import localizationSettings from '@/context/locales.json';

const PRODUCT_DETAILS_PAGE_TYPE = 'productDetailsPage';
const SKIP_PATHS = ['/profile', '/:locale/profile'];

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

// Doc: https://docs.uniform.app/docs/guides/composition/url-management/routing/slug-based-routing

export const getStaticProps = withUniformGetStaticProps({
  requestOptions: context => ({
    state: getState(Boolean(context.preview)),
  }),
  param: 'slug',
  modifyPath: prependLocale,
  client: getRouteClient(),
  handleComposition: async (routeResponse, _context) => {
    const { composition, errors } = routeResponse.compositionApiResponse || {};

    if (errors?.some(e => e.type === 'data' || e.type === 'binding')) {
      return { notFound: true };
    }

    const preview = Boolean(_context.preview);

    const slug = _context.params?.slug;
    const breadcrumbs = DISABLE_EXTRA_FEATURES
      ? []
      : await getBreadcrumbs({
          compositionId: composition._id,
          preview,
          dynamicTitle: composition?.parameters?.pageTitle?.value as string,
          urlSegments: typeof slug === 'string' ? slug?.split('/') : slug,
        });

    const translations = await import(`@/locales/${_context.locale || _context.defaultLocale || 'en-US'}.json`)
      .then(m => m.default)
      .catch(() => ({}));

    return {
      props: { preview, data: composition || null, context: { breadcrumbs }, localizationSettings, translations },
    };
  },
});

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const { nodes } = await getProjectMapClient().getNodes({
    state: process.env.NODE_ENV === 'development' ? CANVAS_DRAFT_STATE : CANVAS_PUBLISHED_STATE,
  });
  const preparedPaths =
    nodes?.reduce(
      (acc: string[], { path, type }) => (type === 'composition' && !SKIP_PATHS.includes(path) ? [...acc, path] : acc),
      []
    ) || [];

  return {
    paths: locales?.length ? getLocalizedPaths(preparedPaths, locales) : preparedPaths,
    fallback: 'blocking',
  };
};

interface LocalizedPath {
  params: {
    slug: string[];
  };
  locale?: string;
}

function getLocalizedPaths(paths: string[], locales: string[] = []) {
  if (!paths || paths.length <= 0) {
    return [];
  }
  return locales.reduce(
    (accumulatedPaths: LocalizedPath[], locale: string) => {
      const pathsForLocale = paths.map(p => {
        const pathWithoutLocale = p.replace(`/:locale`, '');
        const slug = pathWithoutLocale.split('/').filter(Boolean);

        return {
          params: {
            slug: slug.length > 0 ? slug : [],
          },
          locale,
        };
      });

      return accumulatedPaths.concat(pathsForLocale);
    },
    [
      // Render default home page for SSG mode
      {
        params: {
          slug: [],
        },
      },
    ]
  );
}

const PageResolver: FC<PageProps> = props =>
  props.data.type === PRODUCT_DETAILS_PAGE_TYPE ? <ProductDetailsPage {...props} /> : <Page {...props} />;

export default PageResolver;
