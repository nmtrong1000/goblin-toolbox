import { TriangleAlert, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ToastProps = { title: string; message: string; onDismiss: () => void };

export function Toast({ title, message, onDismiss }: ToastProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div className="mdpdf-toast" role="alert">
      <span aria-hidden="true" className="mdpdf-toast-icon">
        <TriangleAlert size={20} />
      </span>
      <div className="mdpdf-toast-body">
        <p className="mdpdf-toast-title">{title}</p>
        <p className="mdpdf-toast-message">{message}</p>
      </div>
      <button
        aria-label={t('dismiss')}
        className="mdpdf-icon-button"
        onClick={onDismiss}
        type="button"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
