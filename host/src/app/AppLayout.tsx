import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CatalogProvider } from '#/catalog/CatalogProvider.tsx';
import { LanguageToggle } from '#/components/LanguageToggle.tsx';
import { MainNav } from '#/components/MainNav.tsx';
import { SiteFooter } from '#/components/SiteFooter.tsx';

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="site">
      <header className="masthead">
        <div className="container masthead-inner">
          <Link className="brand" to="/" viewTransition>
            <span aria-hidden="true" className="brand-mark">
              G
            </span>
            <span>{t('brand')}</span>
          </Link>
          <MainNav />
          <LanguageToggle />
        </div>
      </header>
      <main className="site-main">
        <CatalogProvider>
          <Outlet />
        </CatalogProvider>
      </main>
      <SiteFooter />
    </div>
  );
}
