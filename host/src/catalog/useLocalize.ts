import { useTranslation } from 'react-i18next';
import type { Localized } from '#/catalog/types.ts';

export function useLocalize() {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';
  return (text: Localized) => text[locale];
}
