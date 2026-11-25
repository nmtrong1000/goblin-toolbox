import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CatalogProvider } from '#/catalog/CatalogProvider.tsx';
import { LanguageSelect } from '#/components/LanguageSelect.tsx';

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="site-frame">
      <header className="masthead">
        <Link className="brand" to="/">
          {t('brand')}
        </Link>
        <nav aria-label={t('nav.home')} className="main-nav">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/vaults">{t('nav.vaults')}</Link>
        </nav>
        <LanguageSelect />
      </header>
      <main>
        <CatalogProvider>
          <Outlet />
        </CatalogProvider>
      </main>
      <footer className="site-footer">
        <span>{t('brand')}</span>
      </footer>
    </div>
  );
}
