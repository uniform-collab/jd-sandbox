import { FC, ReactNode, createContext, useContext } from 'react';
import SegmentProvider from './SegmentProvider';

const DISABLE_EXTRA_FEATURES = process.env.NEXT_PUBLIC_DISABLE_EXTRA_FEATURES === 'true';

export const SegmentDataContext = createContext<SegmentProfile.SegmentData | undefined>(undefined);

interface Props {
  children: ReactNode;
  data?: SegmentProfile.SegmentData;
}

const SegmentDataContextProvider: FC<Props> = ({ children, data }) =>
  DISABLE_EXTRA_FEATURES ? (
    children
  ) : (
    <SegmentDataContext.Provider value={data}>
      <SegmentProvider />
      {children}
    </SegmentDataContext.Provider>
  );

export default SegmentDataContextProvider;

export const useSegmentDataContext = () => useContext(SegmentDataContext);
