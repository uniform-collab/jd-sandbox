import { FC, useState, ChangeEvent, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Button from '../../components/Button';
import Input from '../../components/Input';

const OverrideAnonymousId: FC = () => {
  const t = useTranslations();
  const [newAnonymousId, setNewAnonymousId] = useState<string>('');

  const handleChangeNewAnonymousId = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { value } = e.target;
      setNewAnonymousId(value.trim());
    },
    [setNewAnonymousId]
  );

  const onAnonymousIdOverride = useCallback(
    () => window.dispatchEvent(new CustomEvent('Reset AnonymousId', { detail: { anonymousId: newAnonymousId } })),
    [newAnonymousId]
  );

  const onReset = useCallback(() => window.dispatchEvent(new CustomEvent('Reset AnonymousId')), []);

  return (
    <div className="flex flex-col">
      <p className="font-normal uppercase mb-2">{t('Impersonate')}</p>
      <div className="flex flex-row gap-6">
        <Input
          className="min-h-min w-2/3"
          inputClassName="border-slate-950"
          onChange={handleChangeNewAnonymousId}
          placeholder={`${t('Enter a profile ID')}...`}
        />
        <Button style="primary" className="my-auto" copy={t('Fetch profile')} onClick={onAnonymousIdOverride} />
        <Button style="primary" className="my-auto" copy={t('Reset profile')} onClick={onReset} />
      </div>
      <span className="text-gray-500 w-2/3">{t('Allows you to fetch another profile by ID from Segment')}</span>
    </div>
  );
};

export default OverrideAnonymousId;
