import { Pipette } from 'lucide-react';

type ColorPopoverProps = {
  label: string;
  customLabel: string;
  value: string;
  swatches: string[];
  onChange: (value: string) => void;
};

export function ColorPopover({ label, customLabel, value, swatches, onChange }: ColorPopoverProps) {
  return (
    <div aria-label={label} className="common-popover" role="dialog">
      <p className="common-popover-title">{label}</p>
      <div className="common-swatch-grid">
        {swatches.map((swatch) => (
          <button
            aria-label={swatch}
            aria-pressed={swatch === value.toLowerCase()}
            className="common-swatch"
            key={swatch}
            onClick={() => onChange(swatch)}
            style={{ background: swatch }}
            type="button"
          />
        ))}
        <label className="common-swatch common-swatch-custom" title={customLabel}>
          <Pipette aria-hidden="true" size={14} />
          <input
            aria-label={customLabel}
            className="common-sr-only"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={value}
          />
        </label>
      </div>
    </div>
  );
}
