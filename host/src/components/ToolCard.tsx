import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CatalogTool } from '#/catalog/types.ts';
import { useLocalize } from '#/catalog/useLocalize.ts';
import { ToolIcon } from '#/components/ToolIcon.tsx';

type ToolCardProps = { tool: CatalogTool; vaultName?: string; step: number };

export function ToolCard({ tool, vaultName, step }: ToolCardProps) {
  const { t } = useTranslation();
  const localize = useLocalize();

  return (
    <Link
      className={`tool-card rise rise-${Math.min(step, 6)}`}
      to={`/tools/${tool.slug}`}
      viewTransition
    >
      <span className="tool-card-top">
        <ToolIcon icon={tool.icon} />
        {vaultName && <span className="chip">{vaultName}</span>}
      </span>
      <span className="tool-card-body">
        <h2 className="tool-card-title">{localize(tool.name)}</h2>
        <span className="tool-card-description">{localize(tool.description)}</span>
      </span>
      <span className="card-action">
        {t('home.openTool')}
        <ArrowRight aria-hidden="true" className="card-action-arrow" size={16} />
      </span>
    </Link>
  );
}
