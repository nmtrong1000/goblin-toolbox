import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { PresetCard } from '#/components/PresetCard.tsx';
import { applyPreset, matchPreset, stylePresets } from '#/lib/presets.ts';

type PresetPickerProps = {
  options: PdfOptions;
  styleName: string;
  onChange: (options: PdfOptions) => void;
};

export function PresetPicker({ options, styleName, onChange }: PresetPickerProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const active = matchPreset(options);

  return (
    <section className="mdpdf-settings-section">
      <fieldset className="common-field">
        <legend className="mdpdf-section-heading">
          <span className="mdpdf-section-title">{t('styleSection')}</span>
          <span className="mdpdf-chip">{styleName}</span>
        </legend>
        <div className="mdpdf-preset-grid">
          {stylePresets.map((preset) => (
            <label className="mdpdf-preset" key={preset.id}>
              <input
                checked={active?.id === preset.id}
                className="common-choice-input"
                name="mdpdf-preset"
                onChange={() => onChange(applyPreset(options, preset))}
                type="radio"
                value={preset.id}
              />
              <PresetCard name={t(`preset.${preset.id}`)} preset={preset} />
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
