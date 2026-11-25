import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchTools } from '#/catalog/searchTools.ts';
import { useCatalog } from '#/catalog/useCatalog.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';
import { HeroHalftone } from '#/components/HeroHalftone.tsx';
import { HeroStamp } from '#/components/HeroStamp.tsx';
import { MoreToolsCard } from '#/components/MoreToolsCard.tsx';
import { SearchForm } from '#/components/SearchForm.tsx';
import { ToolCard } from '#/components/ToolCard.tsx';

export function HomePage() {
  const { t } = useTranslation();
  const localize = useLocalize();
  const { tools, vaults } = useCatalog();
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const matches = searchTools(tools, query, localize);
  const vaultName = (slug: string) => {
    const vault = vaults.find((item) => item.slug === slug);
    return vault && localize(vault.name);
  };

  return (
    <>
      <section className="hero">
        <HeroHalftone />
        <div className="container hero-inner">
          <div>
            <p className="eyebrow rise">{t('home.eyebrow')}</p>
            <h1 className="hero-title rise rise-1">{t('home.title')}</h1>
            <p className="hero-description rise rise-2">{t('home.description')}</p>
            <div className="rise rise-3">
              <SearchForm query={query} onQueryChange={setQuery} />
            </div>
          </div>
          <div className="hero-stamp-slot rise rise-4">
            <HeroStamp />
          </div>
        </div>
      </section>
      <section className="container collection-section">
        <div className="section-heading">
          <p className="eyebrow">{t('home.collection')}</p>
          <span className="metadata">{String(matches.length).padStart(2, '0')}</span>
        </div>
        {matches.length === 0 && (
          <div className="empty-state">
            <h2>{searching ? t('home.noResultsTitle') : t('home.emptyTitle')}</h2>
            <p>{searching ? t('home.noResultsDescription') : t('home.emptyDescription')}</p>
          </div>
        )}
        <div className="card-grid">
          {matches.map((tool, index) => (
            <ToolCard
              key={tool.slug}
              step={index + 2}
              tool={tool}
              vaultName={vaultName(tool.vault)}
            />
          ))}
          {tools.length > 0 && <MoreToolsCard step={matches.length + 2} />}
        </div>
      </section>
    </>
  );
}
