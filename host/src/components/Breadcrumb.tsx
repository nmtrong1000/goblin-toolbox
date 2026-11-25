import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export type Crumb = { label: string; to?: string };

type BreadcrumbProps = { items: Crumb[] };

export function Breadcrumb({ items }: BreadcrumbProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('breadcrumb.label')} className="breadcrumb rise">
      <ol>
        {items.map((item, index) => (
          <li key={item.to ?? item.label}>
            {index > 0 && <ChevronRight aria-hidden="true" size={14} />}
            {item.to ? (
              <Link to={item.to} viewTransition>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
