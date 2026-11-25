import { useTranslation } from 'react-i18next';

export function ToolLoadError() {
  const { t } = useTranslation();
  return (
    <p className="empty-state" role="alert">
      {t('tool.loadFailed')}
    </p>
  );
}
