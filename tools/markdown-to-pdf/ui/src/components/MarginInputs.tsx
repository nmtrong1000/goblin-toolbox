import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PageMargins,
  type PdfOptions,
  pageMarginsMm,
} from '@goblin/tool-markdown-to-pdf-shared/options';

const sides = [
  { side: 'top', label: 'marginTop' },
  { side: 'right', label: 'marginRight' },
  { side: 'bottom', label: 'marginBottom' },
  { side: 'left', label: 'marginLeft' },
] as const;

type Side = keyof PageMargins;

type MarginInputsProps = {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
};

export function MarginInputs({ options, onChange }: MarginInputsProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const [drafts, setDrafts] = useState<Partial<Record<Side, string>>>({});
  const margins = pageMarginsMm(options);

  function edit(side: Side, raw: string) {
    setDrafts({ ...drafts, [side]: raw });
    const value = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(value) || value < 0 || value > 50) return;
    onChange({ ...options, customMargins: { ...margins, [side]: value } });
  }

  return (
    <fieldset className="common-field">
      <legend className="common-field-label">{t('margins')}</legend>
      <div className="mdpdf-margin-grid">
        {sides.map(({ side, label }) => (
          <label className="mdpdf-margin-input" key={side}>
            <span>{t(label)}</span>
            <input
              inputMode="decimal"
              max={50}
              min={0}
              onBlur={() => setDrafts({ ...drafts, [side]: undefined })}
              onChange={(event) => edit(side, event.target.value)}
              step={1}
              type="number"
              value={drafts[side] ?? String(margins[side])}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
