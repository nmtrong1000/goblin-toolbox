import { useTranslation } from 'react-i18next';

const lineWidths = ['30%', '85%', '70%', '78%', '55%', '64%'];

export function ToolSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="tool-skeleton" role="status">
      <div aria-hidden="true">
        <div className="tool-skeleton-bar">
          <span className="skeleton skeleton-button" />
          <span className="skeleton skeleton-button" />
          <span className="skeleton skeleton-button skeleton-button-end" />
        </div>
        <div className="tool-skeleton-panes">
          <div className="tool-skeleton-lines">
            {lineWidths.map((width) => (
              <span className="skeleton skeleton-line" key={width} style={{ width }} />
            ))}
          </div>
          <div className="tool-skeleton-paper-wrap">
            <span className="skeleton skeleton-paper" />
          </div>
        </div>
      </div>
      <p className="tool-skeleton-label">{t('tool.loading')}</p>
    </div>
  );
}
