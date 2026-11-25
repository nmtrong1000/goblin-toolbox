import { useTranslation } from 'react-i18next';

export type MobileView = 'editor' | 'preview';

type MobileViewSwitchProps = {
  view: MobileView;
  onChange: (view: MobileView) => void;
};

export function MobileViewSwitch({ view, onChange }: MobileViewSwitchProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div className="mdpdf-mobile-tabs">
      <button aria-pressed={view === 'editor'} onClick={() => onChange('editor')} type="button">
        {t('mobileEditor')}
      </button>
      <button aria-pressed={view === 'preview'} onClick={() => onChange('preview')} type="button">
        {t('mobilePreview')}
      </button>
    </div>
  );
}
