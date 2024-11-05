import { FC, useState, useEffect, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { CheckoutFormData } from './FakeCartProvider';

type FieldName = 'name' | 'address' | 'city' | 'state' | 'zip';

type CheckoutFormProps = {
  onSubmit: (checkoutData: CheckoutFormData) => void;
  initialValues?: CheckoutFormData;
  isValidationEnabled?: boolean;
};

const CheckoutForm: FC<CheckoutFormProps> = ({ onSubmit, initialValues, isValidationEnabled = false }) => {
  const t = useTranslations();
  const [isTouched, setIsTouched] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: initialValues?.name ?? '',
    address: initialValues?.address ?? '',
    city: initialValues?.city ?? '',
    state: initialValues?.state ?? '',
    zip: initialValues?.zip ?? '',
  });
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { id, value } = e.target;
    setIsTouched(true);
    setCheckoutData({
      ...checkoutData,
      [id]: value,
    });

    if (isValidationEnabled) {
      setErrors({
        ...errors,
        [id]: '',
      });
    }
  };

  const onSubmitForm = () => {
    const newErrors: Partial<CheckoutFormData> = {};
    const requiredFields: FieldName[] = ['name', 'address', 'city', 'state', 'zip'];

    if (isValidationEnabled) {
      requiredFields.forEach(field => {
        if (!checkoutData[field]) {
          newErrors[field] = t('This field is required');
        }
      });
    }

    if (Object.keys(newErrors).length === 0) {
      onSubmit(checkoutData);
    } else {
      setErrors(newErrors);
    }
  };

  useEffect(() => {
    if (!isTouched && initialValues) {
      setCheckoutData(initialValues);
    }
  }, [initialValues, isTouched]);

  return (
    <div>
      <Input
        label={t('Name')}
        type="text"
        id="name"
        onChange={handleChange}
        value={checkoutData.name}
        errorMessage={errors.name}
      />

      <Input
        label={t('Address')}
        type="text"
        id="address"
        onChange={handleChange}
        value={checkoutData.address}
        errorMessage={errors.address}
      />

      <Input
        label={t('City')}
        type="text"
        id="city"
        onChange={handleChange}
        value={checkoutData.city}
        errorMessage={errors.city}
      />

      <Input
        label={t('State')}
        type="text"
        id="state"
        onChange={handleChange}
        value={checkoutData.state}
        errorMessage={errors.state}
      />

      <Input
        label={t('Zip')}
        type="text"
        id="zip"
        onChange={handleChange}
        value={checkoutData.zip}
        errorMessage={errors.zip}
      />

      <Button copy={t('Continue')} style="primary" onClick={onSubmitForm} />
    </div>
  );
};

export default CheckoutForm;
