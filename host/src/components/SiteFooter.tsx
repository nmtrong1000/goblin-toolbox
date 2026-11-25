import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const year = new Date().getFullYear();

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container site-footer-row">
        <span className="site-footer-brand">{t('brand')}</span>
        <nav aria-label={t('footer.label')} className="site-footer-nav">
          <Link to="/" viewTransition>
            {t('nav.home')}
          </Link>
          <Link to="/vaults" viewTransition>
            {t('nav.vaults')}
          </Link>
        </nav>
      </div>
      <p className="site-footer-copyright">{t('footer.copyright', { year })}</p>
    </footer>
  );
}
