import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchTools } from '#/catalog/search-tools.ts';
import { useCatalog } from '#/catalog/useCatalog.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';
import { SearchForm } from '#/components/SearchForm.tsx';

export function HomePage() {
  const { t } = useTranslation();
  const localize = useLocalize();
  const { tools } = useCatalog();
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const matches = searchTools(tools, query, localize);

  return (
    <>
      <section className="lead-section">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="lead-title">{t('home.title')}</h1>
        <p className="lead-description">{t('home.description')}</p>
        <SearchForm query={query} onQueryChange={setQuery} />
      </section>
      <section className="collection-section">
        <div className="section-heading">
          <p className="eyebrow">{t('home.collection')}</p>
          <span className="metadata">{String(matches.length).padStart(2, '0')}</span>
        </div>
        {matches.length === 0 ? (
          <div className="empty-state">
            <h2>{searching ? t('home.noResultsTitle') : t('home.emptyTitle')}</h2>
            <p>{searching ? t('home.noResultsDescription') : t('home.emptyDescription')}</p>
          </div>
        ) : (
          <div className="tool-list">
            {matches.map((tool) => (
              <Link className="tool-row" key={tool.slug} to={`/tools/${tool.slug}`}>
                <span>
                  <strong>{localize(tool.name)}</strong>
                  <small>{localize(tool.description)}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
