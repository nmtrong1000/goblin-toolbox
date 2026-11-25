import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type MoreToolsCardProps = { step: number };

export function MoreToolsCard({ step }: MoreToolsCardProps) {
  const { t } = useTranslation();

  return (
    <div className={`more-card rise rise-${Math.min(step, 6)}`}>
      <span aria-hidden="true" className="more-card-icon">
        <Plus size={22} />
      </span>
      <p>{t('home.moreTools')}</p>
    </div>
  );
}
