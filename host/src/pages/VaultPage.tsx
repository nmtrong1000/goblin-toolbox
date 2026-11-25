import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '#/catalog/useCatalog.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';
import { Breadcrumb } from '#/components/Breadcrumb.tsx';
import { ToolCard } from '#/components/ToolCard.tsx';
import { VaultCard } from '#/components/VaultCard.tsx';

export function VaultPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const localize = useLocalize();
  const { tools, vaults } = useCatalog();

  if (!slug) {
    return (
      <section className="container page-section">
        <p className="eyebrow rise">{t('nav.vaults')}</p>
        <h1 className="page-title rise rise-1">{t('vault.title')}</h1>
        {vaults.length === 0 && <p className="page-lead">{t('vault.empty')}</p>}
        <div className="card-grid">
          {vaults.map((vault, index) => (
            <VaultCard
              key={vault.slug}
              step={index + 2}
              toolCount={tools.filter((tool) => tool.vault === vault.slug).length}
              vault={vault}
            />
          ))}
        </div>
      </section>
    );
  }

  const vault = vaults.find((item) => item.slug === slug);
  const vaultTools = tools.filter((tool) => tool.vault === slug);
  const title = vault ? localize(vault.name) : t('vault.title');

  return (
    <section className="container page-section">
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.vaults'), to: '/vaults' },
          { label: title },
        ]}
      />
      <h1 className="page-title rise rise-1">{title}</h1>
      {vault && <p className="page-lead rise rise-2">{localize(vault.description)}</p>}
      {vaultTools.length === 0 && <p className="page-lead">{t('vault.empty')}</p>}
      <div className="card-grid">
        {vaultTools.map((tool, index) => (
          <ToolCard key={tool.slug} step={index + 3} tool={tool} />
        ))}
      </div>
    </section>
  );
}
