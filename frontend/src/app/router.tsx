import { Suspense } from 'react';
import { createBrowserRouter, Link, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomePage } from '#/app/views/HomePage.js';
import { LanguageSelect } from '#/shared/LanguageSelect.js';
import { tools, vaults } from '#/app/registry.js';

function AppLayout() {
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
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>{t('brand')}</span>
      </footer>
    </div>
  );
}

function VaultPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const vault = vaults.find((item) => item.slug === slug);

  return (
    <section className="page-section">
      <p className="eyebrow">{t('nav.vaults')}</p>
      <h1 className="page-title">{vault ? t(vault.nameKey) : t('vault.title')}</h1>
      {vault && <p>{t(vault.descriptionKey)}</p>}
      <div className="tool-list">
        {!vaults.length && <p>{t('vault.empty')}</p>}
        {!slug &&
          vaults.map((item) => (
            <Link className="tool-row" key={item.slug} to={`/vaults/${item.slug}`}>
              {t(item.nameKey)}
            </Link>
          ))}
        {tools
          .filter((tool) => tool.vault === slug)
          .map((tool) => (
            <Link className="tool-row" key={tool.slug} to={`/tools/${tool.slug}`}>
              {t(tool.nameKey)}
            </Link>
          ))}
      </div>
    </section>
  );
}

function ToolPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const tool = tools.find((item) => item.slug === slug);

  return (
    <section className="page-section">
      <p className="eyebrow">{tool ? t(tool.nameKey) : t('home.collection')}</p>
      <h1 className="page-title">{tool ? t(tool.nameKey) : t('tool.unavailable')}</h1>
      {tool && <p>{t(tool.descriptionKey)}</p>}
      {tool && (
        <Suspense fallback={<p>{t('tool.loading')}</p>}>
          <tool.component />
        </Suspense>
      )}
    </section>
  );
}

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="page-section">
      <h1 className="page-title">{t('errors.notFound')}</h1>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/vaults', element: <VaultPage /> },
      { path: '/vaults/:slug', element: <VaultPage /> },
      { path: '/tools/:slug', element: <ToolPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
