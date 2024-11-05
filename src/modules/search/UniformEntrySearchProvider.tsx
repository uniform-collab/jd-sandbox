import {
  FC,
  Dispatch,
  SetStateAction,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import {
  getAllAvailableFiltersForEntry,
  mapCanvasParameters,
  mapUniformContentEntryFields,
  useGetSearchEngine,
} from './utils';
import { ComponentProps } from '@uniformdev/canvas-react';
import { FilterBy } from './EntryFilterBox';

const ENTRY_SEARCH_ENDPOINT = '/api/getEntries';
export const ARRAY_OPERATORS = ['in', 'nin'];

interface UniformEntrySearchContextProps {
  search: string;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  currentPage: number;
  allPossibleFilters: Record<string, { label: string; value: string; isDisplayPriority: boolean }[]>;
  avaliableFilters: Record<string, { label: string; value: string; isDisplayPriority: boolean }[]>;
  setSearch: Dispatch<SetStateAction<string>>;
  filterBy: FilterBy[];
  setFilterBy: Dispatch<SetStateAction<FilterBy[]>>;
  setAdditionalFilters: Dispatch<SetStateAction<Record<string, unknown>>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  resultEntries: EntrySearch.EntryResultItem[] | undefined;
}

export const UniformEntrySearchContext = createContext<UniformEntrySearchContextProps>({
  search: '',
  pageSize: 50,
  totalPages: 0,
  totalCount: 0,
  currentPage: 0,
  filterBy: [],
  allPossibleFilters: {},
  avaliableFilters: {},
  setFilterBy: () => null,
  setSearch: () => null,
  setAdditionalFilters: () => null,
  setCurrentPage: () => null,
  isLoading: false,
  resultEntries: [] || undefined,
});

export type UniformEntrySearchContextProviderProps = {
  initialFilters?: EntrySearch.UniformBlockValue[];
  pageSize?: string;
  children: ReactNode;
};

const UniformEntrySearchContextProvider: FC<ComponentProps<UniformEntrySearchContextProviderProps>> = ({
  initialFilters,
  pageSize: initPageSize,
  children,
}) => {
  const { locale = 'en-US' } = useRouter();
  const pageSize = Number(initPageSize);
  const [search, setSearch] = useState<string>('');
  const [filterBy, setFilterBy] = useState<FilterBy[]>([]);
  const [allPossibleFilters, setAllPossibleFilters] = useState<
    Record<string, { label: string; value: string; isDisplayPriority: boolean }[]>
  >({});
  const [avaliableFilters, setAvaliableFilters] = useState<
    Record<string, { label: string; value: string; isDisplayPriority: boolean }[]>
  >({});
  const [additionalFilters, setAdditionalFilters] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resultEntries, setResultEntries] = useState<EntrySearch.EntryResultItem[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const searchEngine = useGetSearchEngine<EntrySearch.ArticleEntry | EntrySearch.ProductEntry>({
    endpoint: ENTRY_SEARCH_ENDPOINT,
    setResultEntries,
    setAvaliableFilters,
    filterBy,
    setTotalCount,
    setIsLoading,
    mapUniformContentEntryFields,
  });

  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize]);

  const baseFilter = useMemo(
    () =>
      initialFilters
        ?.map(({ fields, _id }, index) => mapCanvasParameters<EntrySearch.FilterBlock>(fields, _id || String(index)))
        .reduce<Record<string, unknown>>((acc, { key, operator, value }) => {
          acc[key] = ARRAY_OPERATORS.includes(operator) ? { [operator]: value.split('|') } : { [operator]: value };
          return acc;
        }, {}) || {},
    [initialFilters]
  );

  useEffect(() => {
    if (!filterBy.length) return;

    getAllAvailableFiltersForEntry({
      endpoint: ENTRY_SEARCH_ENDPOINT,
      body: {
        filters: { ...baseFilter },
        locale,
      },
      fields: filterBy,
    }).then(setAllPossibleFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBy]);

  useEffect(() => {
    setIsLoading(true);
    searchEngine({
      filters: { ...baseFilter, ...additionalFilters },
      locale,
      withTotalCount: true,
      limit: pageSize,
      offset: currentPage * pageSize,
      ...(search ? { search } : undefined),
    });
  }, [additionalFilters, baseFilter, currentPage, locale, pageSize, search, searchEngine]);

  const value = useMemo(
    () => ({
      search,
      pageSize,
      currentPage,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      isLoading,
      allPossibleFilters,
      avaliableFilters,
      resultEntries,
      setSearch,
      setAdditionalFilters,
      setCurrentPage,
      filterBy,
      setFilterBy,
    }),
    [
      search,
      pageSize,
      currentPage,
      totalCount,
      isLoading,
      resultEntries,
      allPossibleFilters,
      avaliableFilters,
      filterBy,
      setFilterBy,
    ]
  );

  return <UniformEntrySearchContext.Provider value={value}>{children}</UniformEntrySearchContext.Provider>;
};

export default UniformEntrySearchContextProvider;

export const useUniformEntrySearchContext = () => useContext(UniformEntrySearchContext);
