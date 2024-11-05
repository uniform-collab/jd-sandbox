import { FC } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { CurrencyFormatterProps } from './';

const CurrencyFormatter: FC<CurrencyFormatterProps> = ({ amount, className }) => {
  const { locale = 'en-US' } = useRouter();
  const t = useTranslations();

  const formattedPrice = new Intl.NumberFormat(locale, { style: 'currency', currency: t('USD') }).format(amount);
  return <div className={className}>{formattedPrice}</div>;
};

export default CurrencyFormatter;
