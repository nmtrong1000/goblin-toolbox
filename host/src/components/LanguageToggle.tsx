import { useTranslation } from 'react-i18next';
import { supportedLocales } from '#/i18n/index.ts';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';

  return (
    <div aria-label={t('language.label')} className="language-toggle" role="group">
      {supportedLocales.map((locale) => (
        <button
          aria-pressed={locale === current}
          key={locale}
          lang={locale}
          onClick={() => void i18n.changeLanguage(locale)}
          title={t(`language.${locale}`)}
          type="button"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
