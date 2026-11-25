import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="page-section">
      <h1 className="page-title">{t('errors.notFound')}</h1>
    </section>
  );
}
