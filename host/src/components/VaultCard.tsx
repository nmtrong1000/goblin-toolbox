import { Archive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CatalogVault } from '#/catalog/types.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';

type VaultCardProps = { vault: CatalogVault; toolCount: number; step: number };

export function VaultCard({ vault, toolCount, step }: VaultCardProps) {
  const { t } = useTranslation();
  const localize = useLocalize();

  return (
    <Link
      className={`tool-card rise rise-${Math.min(step, 6)}`}
      to={`/vaults/${vault.slug}`}
      viewTransition
    >
      <span className="tool-card-top">
        <span aria-hidden="true" className="tool-icon">
          <Archive strokeWidth={1.8} />
        </span>
        <span className="chip">{t('vault.toolCount', { count: toolCount })}</span>
      </span>
      <span className="tool-card-body">
        <h2 className="tool-card-title">{localize(vault.name)}</h2>
        <span className="tool-card-description">{localize(vault.description)}</span>
      </span>
      <span className="card-action">
        {t('vault.open')}
        <ArrowRight aria-hidden="true" className="card-action-arrow" size={16} />
      </span>
    </Link>
  );
}
