import { FC, useEffect, useMemo } from 'react';
import { useUniformContext } from '@uniformdev/context-react';
import { camelize } from '@/utilities';
import Page from './Page';
import { PageProps } from './Page';
import { Entry, flattenValues } from '@uniformdev/canvas';

const createEnrichment = (flattenedEntry: Record<string, unknown> | null | undefined) => ({
  cat: 'subCategory',
  key: camelize((flattenedEntry?.title as string) || ''),
  str: 5,
});

const ProductDetailsPage: FC<PageProps> = props => {
  const { context } = useUniformContext();
  const { pageSubcategories } = props.data?.parameters || {};

  const subcategories = pageSubcategories?.value as Entry | Entry[] | string | undefined;

  const enrichments = useMemo(() => {
    if (Array.isArray(subcategories)) {
      return (
        subcategories.map(subCategory => {
          const flattenedEntry = flattenValues(subCategory.entry);
          return createEnrichment(flattenedEntry);
        }) || []
      );
    }

    const flattenedEntry = flattenValues((subcategories as Entry)?.entry);
    return [createEnrichment(flattenedEntry)];
  }, [subcategories]);

  useEffect(() => {
    context.update({ enrichments });
  }, [context, enrichments]);

  return <Page {...props} />;
};

export default ProductDetailsPage;
