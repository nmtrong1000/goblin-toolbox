import { ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="container page-section state-card">
      <span aria-hidden="true" className="tool-icon tool-icon-large rise">
        <Compass strokeWidth={1.8} />
      </span>
      <h1 className="page-title rise rise-1">{t('errors.notFound')}</h1>
      <Link className="card-action rise rise-2" to="/" viewTransition>
        {t('errors.backHome')}
        <ArrowRight aria-hidden="true" className="card-action-arrow" size={16} />
      </Link>
    </section>
  );
}
