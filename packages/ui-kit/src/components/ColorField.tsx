import { useRef, useState } from 'react';
import { ColorPopover } from '#/components/ColorPopover.tsx';
import { type DismissReason, useDismiss } from '#/hooks/useDismiss.ts';
import { isHexColor } from '#/lib/color.ts';

export type ColorFieldLabels = { choose: string; value: string; custom: string };

type ColorFieldProps = {
  label: string;
  labels: ColorFieldLabels;
  value: string;
  swatches: string[];
  onChange: (value: string) => void;
};

export function ColorField({ label, labels, value, swatches, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>();
  const area = useRef<HTMLDivElement>(null);
  const swatchButton = useRef<HTMLButtonElement>(null);

  function close(reason: DismissReason) {
    setOpen(false);
    if (reason === 'escape') swatchButton.current?.focus();
  }

  useDismiss(area, open, close, { outsideClick: true });

  return (
    <div className="common-color-field" ref={area}>
      <span className="common-color-label">{label}</span>
      <button
        aria-expanded={open}
        aria-label={labels.choose}
        className="common-color-swatch"
        onClick={() => setOpen(!open)}
        ref={swatchButton}
        style={{ background: value }}
        type="button"
      />
      <input
        aria-label={labels.value}
        className="common-color-hex"
        maxLength={7}
        onBlur={() => setDraft(undefined)}
        onChange={(event) => {
          const next = event.target.value.trim();
          setDraft(next);
          if (isHexColor(next)) onChange(next.toLowerCase());
        }}
        onFocus={() => setDraft(value.toUpperCase())}
        spellCheck={false}
        value={draft ?? value.toUpperCase()}
      />
      {open && (
        <ColorPopover
          customLabel={labels.custom}
          label={label}
          onChange={onChange}
          swatches={swatches}
          value={value}
        />
      )}
    </div>
  );
}
