import { FC } from 'react';
import { UniformText, useUniformContextualEditingState } from '@uniformdev/canvas-react';
import { useTranslations } from 'next-intl';
import BaseButton from '../../components/Button';
import { formatProjectMapLink } from '../../utilities';
import { ButtonProps } from '.';

export const Button: FC<ButtonProps> = ({ copy, link, style, animationType }) => {
  const t = useTranslations();
  const { previewMode } = useUniformContextualEditingState();
  const isContextualEditing = previewMode === 'editor';

  if (!Boolean(copy) && !isContextualEditing) {
    return null;
  }

  return (
    <BaseButton
      href={formatProjectMapLink(link)}
      animationType={animationType}
      copy={<UniformText placeholder={t('Button copy goes here')} parameterId="copy" />}
      style={style}
    />
  );
};
