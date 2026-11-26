import { TriangleAlert, X } from 'lucide-react';

type ToastProps = {
  title: string;
  message: string;
  dismissLabel: string;
  onDismiss: () => void;
};

export function Toast({ title, message, dismissLabel, onDismiss }: ToastProps) {
  return (
    <div className="common-toast" role="alert">
      <span aria-hidden="true" className="common-toast-icon">
        <TriangleAlert size={20} />
      </span>
      <div className="common-toast-body">
        <p className="common-toast-title">{title}</p>
        <p className="common-toast-message">{message}</p>
      </div>
      <button
        aria-label={dismissLabel}
        className="common-icon-button"
        onClick={onDismiss}
        type="button"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
