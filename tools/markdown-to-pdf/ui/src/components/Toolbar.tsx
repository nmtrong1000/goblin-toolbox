import { useTranslation } from 'react-i18next';

type ToolbarProps = {
  busy: boolean;
  onOpenFile: (file: File) => void;
  onReformat: () => void;
  onCreatePdf: () => void;
};

export function Toolbar({ busy, onOpenFile, onReformat, onCreatePdf }: ToolbarProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div className="mdpdf-toolbar">
      <label className="button-secondary mdpdf-upload">
        {t('upload')}
        <input
          accept=".md,text/markdown"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onOpenFile(file);
          }}
        />
      </label>
      <button className="button-secondary" onClick={onReformat} type="button">
        {t('reformat')}
      </button>
      <button className="button-primary" disabled={busy} onClick={onCreatePdf} type="button">
        {busy ? t('rendering') : t('download')}
      </button>
    </div>
  );
}
