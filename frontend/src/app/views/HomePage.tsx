import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tools } from '#/app/registry.js';

export function HomePage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = tools.filter((tool) => {
    const searchable = `${t(tool.nameKey)} ${t(tool.descriptionKey)} ${tool.keywords.join(' ')}`;
    return searchable.toLocaleLowerCase().includes(normalizedQuery);
  });

  return (
    <>
      <section className="lead-section">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="lead-title">{t('home.title')}</h1>
        <p className="lead-description">{t('home.description')}</p>
        <form className="search-form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="tool-search">{t('home.searchLabel')}</label>
          <div className="search-control">
            <input
              autoComplete="off"
              id="tool-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('home.searchPlaceholder')}
              type="search"
              value={query}
            />
            <button className="button-primary" type="submit">
              {t('home.searchAction')}
            </button>
          </div>
        </form>
      </section>
      <section className="collection-section">
        <div className="section-heading">
          <p className="eyebrow">{t('home.collection')}</p>
          <span className="metadata">{String(matches.length).padStart(2, '0')}</span>
        </div>
        {matches.length === 0 ? (
          <div className="empty-state">
            <h2>{normalizedQuery ? t('home.noResultsTitle') : t('home.emptyTitle')}</h2>
            <p>{normalizedQuery ? t('home.noResultsDescription') : t('home.emptyDescription')}</p>
          </div>
        ) : (
          <div className="tool-list">
            {matches.map((tool) => (
              <Link className="tool-row" key={tool.slug} to={`/tools/${tool.slug}`}>
                <span>
                  <strong>{t(tool.nameKey)}</strong>
                  <small>{t(tool.descriptionKey)}</small>
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
