import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorPopover } from '#/components/ColorPopover.tsx';
import { type DismissReason, useDismiss } from '#/hooks/useDismiss.ts';
import { isHexColor } from '#/lib/color.ts';

type ColorFieldProps = {
  label: string;
  value: string;
  swatches: string[];
  onChange: (value: string) => void;
};

export function ColorField({ label, value, swatches, onChange }: ColorFieldProps) {
  const { t } = useTranslation('markdown-to-pdf');
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
    <div className="mdpdf-color-field" ref={area}>
      <span className="mdpdf-color-label">{label}</span>
      <button
        aria-expanded={open}
        aria-label={t('chooseColor', { role: label.toLowerCase() })}
        className="mdpdf-color-swatch"
        onClick={() => setOpen(!open)}
        ref={swatchButton}
        style={{ background: value }}
        type="button"
      />
      <input
        aria-label={t('colorValue', { role: label })}
        className="mdpdf-color-hex"
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
      {open && <ColorPopover label={label} onChange={onChange} swatches={swatches} value={value} />}
    </div>
  );
}
