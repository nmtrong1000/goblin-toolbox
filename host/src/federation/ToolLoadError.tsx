import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ToolLoadError() {
  const { t } = useTranslation();

  return (
    <div className="state-card" role="alert">
      <span aria-hidden="true" className="tool-icon">
        <TriangleAlert strokeWidth={1.8} />
      </span>
      <p>{t('tool.loadFailed')}</p>
    </div>
  );
}
