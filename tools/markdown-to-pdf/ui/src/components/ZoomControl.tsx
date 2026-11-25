import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type Zoom, stepZoom } from '#/lib/zoom.ts';

type ZoomControlProps = {
  zoom: Zoom;
  fitScale: number;
  onChange: (zoom: Zoom) => void;
};

export function ZoomControl({ zoom, fitScale, onChange }: ZoomControlProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const fit = zoom === 'fit';

  return (
    <div aria-label={t('zoom')} className="mdpdf-zoom" role="group">
      <button
        aria-label={t('zoomOut')}
        className="mdpdf-zoom-step"
        onClick={() => onChange(stepZoom(zoom, fitScale, -1))}
        type="button"
      >
        <Minus aria-hidden="true" size={16} />
      </button>
      <button
        aria-label={fit ? t('zoomFitLabel') : `${Math.round(zoom * 100)}%, ${t('zoomFitLabel')}`}
        aria-pressed={fit}
        className="mdpdf-zoom-level"
        onClick={() => onChange('fit')}
        type="button"
      >
        {fit ? t('zoomFit') : `${Math.round(zoom * 100)}%`}
      </button>
      <button
        aria-label={t('zoomIn')}
        className="mdpdf-zoom-step"
        onClick={() => onChange(stepZoom(zoom, fitScale, 1))}
        type="button"
      >
        <Plus aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
