import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CatalogProvider } from '#/catalog/CatalogProvider.tsx';
import { LanguageToggle } from '#/components/LanguageToggle.tsx';
import { MainNav } from '#/components/MainNav.tsx';
import { SiteFooter } from '#/components/SiteFooter.tsx';

export function AppLayout() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site">
      <header className="masthead">
        <div className="container masthead-inner">
          <Link className="brand" onClick={() => setMenuOpen(false)} to="/" viewTransition>
            <span aria-hidden="true" className="brand-mark">
              G
            </span>
            <span>{t('brand')}</span>
          </Link>
          <button
            aria-controls="site-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('menu.close') : t('menu.open')}
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
          <div
            className="masthead-menu"
            data-open={menuOpen}
            id="site-menu"
            onKeyDown={(event) => event.key === 'Escape' && setMenuOpen(false)}
          >
            <div className="masthead-menu-inner">
              <MainNav onNavigate={() => setMenuOpen(false)} />
              <LanguageToggle />
            </div>
          </div>
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
