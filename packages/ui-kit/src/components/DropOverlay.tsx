import { Upload } from 'lucide-react';

type DropOverlayProps = { title: string; hint: string };

export function DropOverlay({ title, hint }: DropOverlayProps) {
  return (
    <div aria-hidden="true" className="common-drop">
      <span className="common-drop-icon">
        <Upload size={26} />
      </span>
      <p className="common-drop-title">{title}</p>
      <p className="common-drop-hint">{hint}</p>
    </div>
  );
}
