import { useTranslation } from 'react-i18next';

export function LanguageSelect() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';

  return (
    <label className="language-control">
      <span className="visually-hidden">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        value={locale}
      >
        <option value="en">{t('language.en')}</option>
        <option value="vi">{t('language.vi')}</option>
      </select>
    </label>
  );
}
