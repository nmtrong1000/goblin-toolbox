import { Pipette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ColorPopoverProps = {
  label: string;
  value: string;
  swatches: string[];
  onChange: (value: string) => void;
};

export function ColorPopover({ label, value, swatches, onChange }: ColorPopoverProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div aria-label={label} className="mdpdf-popover" role="dialog">
      <p className="mdpdf-popover-title">{label}</p>
      <div className="mdpdf-swatch-grid">
        {swatches.map((swatch) => (
          <button
            aria-label={swatch}
            aria-pressed={swatch === value.toLowerCase()}
            className="mdpdf-swatch"
            key={swatch}
            onClick={() => onChange(swatch)}
            style={{ background: swatch }}
            type="button"
          />
        ))}
        <label className="mdpdf-swatch mdpdf-swatch-custom" title={t('customColor')}>
          <Pipette aria-hidden="true" size={14} />
          <input
            aria-label={t('customColor')}
            className="mdpdf-sr-only"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={value}
          />
        </label>
      </div>
    </div>
  );
}
