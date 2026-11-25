import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DropOverlay() {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div aria-hidden="true" className="mdpdf-drop">
      <span className="mdpdf-drop-icon">
        <Upload size={26} />
      </span>
      <p className="mdpdf-drop-title">{t('dropTitle')}</p>
      <p className="mdpdf-drop-hint">{t('dropHint')}</p>
    </div>
  );
}
