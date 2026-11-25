import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '#/catalog/useCatalog.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';

export function VaultPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const localize = useLocalize();
  const { tools, vaults } = useCatalog();
  const vault = vaults.find((item) => item.slug === slug);

  return (
    <section className="page-section">
      <p className="eyebrow">{t('nav.vaults')}</p>
      <h1 className="page-title">{vault ? localize(vault.name) : t('vault.title')}</h1>
      {vault && <p>{localize(vault.description)}</p>}
      <div className="tool-list">
        {!vaults.length && <p>{t('vault.empty')}</p>}
        {!slug &&
          vaults.map((item) => (
            <Link className="tool-row" key={item.slug} to={`/vaults/${item.slug}`}>
              {localize(item.name)}
            </Link>
          ))}
        {tools
          .filter((tool) => tool.vault === slug)
          .map((tool) => (
            <Link className="tool-row" key={tool.slug} to={`/tools/${tool.slug}`}>
              {localize(tool.name)}
            </Link>
          ))}
      </div>
    </section>
  );
}
