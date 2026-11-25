import { Check, Download, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PdfStatus } from '#/hooks/useCreatePdf.ts';

type CreatePdfButtonProps = { status: PdfStatus; onCreatePdf: () => void };

export function CreatePdfButton({ status, onCreatePdf }: CreatePdfButtonProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const busy = status === 'busy';

  return (
    <button
      aria-busy={busy}
      className={`button-primary mdpdf-create mdpdf-create-${status}`}
      disabled={busy}
      onClick={onCreatePdf}
      type="button"
    >
      {status === 'busy' && <LoaderCircle aria-hidden="true" className="mdpdf-spin" size={18} />}
      {status === 'done' && (
        <span aria-hidden="true" className="mdpdf-done-mark">
          <Check size={13} strokeWidth={3.2} />
        </span>
      )}
      {status === 'idle' && <Download aria-hidden="true" size={18} />}
      <span aria-live="polite">
        {status === 'busy' ? t('rendering') : status === 'done' ? t('done') : t('download')}
      </span>
    </button>
  );
}
