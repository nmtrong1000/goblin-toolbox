import type { Ref } from 'react';
import { SlidersHorizontal, Sparkles, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CreatePdfButton } from '#/components/CreatePdfButton.tsx';
import type { PdfStatus } from '#/hooks/useCreatePdf.ts';

type ToolbarProps = {
  status: PdfStatus;
  styleName: string;
  settingsOpen: boolean;
  settingsButton: Ref<HTMLButtonElement>;
  onOpenFile: (file: File) => void;
  onReformat: () => void;
  onToggleSettings: () => void;
  onCreatePdf: () => void;
};

export function Toolbar({
  status,
  styleName,
  settingsOpen,
  settingsButton,
  onOpenFile,
  onReformat,
  onToggleSettings,
  onCreatePdf,
}: ToolbarProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div className="mdpdf-toolbar">
      <label className="mdpdf-button mdpdf-upload">
        <Upload aria-hidden="true" size={18} />
        {t('upload')}
        <input
          accept=".md,text/markdown"
          className="mdpdf-sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onOpenFile(file);
          }}
          type="file"
        />
      </label>
      <button className="mdpdf-button" onClick={onReformat} type="button">
        <Sparkles aria-hidden="true" size={18} />
        {t('reformat')}
      </button>
      <button
        aria-controls="mdpdf-settings"
        aria-expanded={settingsOpen}
        className="mdpdf-button mdpdf-settings-toggle"
        onClick={onToggleSettings}
        ref={settingsButton}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={18} />
        {t('settings')}
        <span className="mdpdf-style-badge">{styleName}</span>
      </button>
      <CreatePdfButton onCreatePdf={onCreatePdf} status={status} />
    </div>
  );
}
