import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { ColorField } from '@goblin/ui-kit/components/ColorField';
import { SegmentedControl } from '@goblin/ui-kit/components/SegmentedControl';
import { MarginInputs } from '#/components/MarginInputs.tsx';
import { presetColors } from '#/lib/presets.ts';

const colorRoles = [
  { role: 'text', label: 'colorText' },
  { role: 'heading', label: 'colorHeading' },
  { role: 'link', label: 'colorLink' },
] as const;

type AdvancedSettingsProps = {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
};

export function AdvancedSettings({ options, onChange }: AdvancedSettingsProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const [open, setOpen] = useState(false);

  function update<K extends keyof PdfOptions>(key: K, value: PdfOptions[K]) {
    onChange({ ...options, [key]: value });
  }

  return (
    <section className="mdpdf-settings-section mdpdf-advanced">
      <button
        aria-controls="mdpdf-advanced-body"
        aria-expanded={open}
        className="mdpdf-disclosure"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="mdpdf-section-title">{t('advanced')}</span>
        <span className="mdpdf-disclosure-hint">{t('advancedHint')}</span>
        <ChevronDown aria-hidden="true" className="mdpdf-disclosure-icon" size={16} />
      </button>
      {open && (
        <div className="mdpdf-advanced-body" id="mdpdf-advanced-body">
          <SegmentedControl
            choices={[
              { value: 'noto-sans', label: t('fontSans') },
              { value: 'noto-serif', label: t('fontSerif') },
            ]}
            legend={t('font')}
            name="mdpdf-font"
            onChange={(value) => update('font', value)}
            value={options.font}
          />
          <SegmentedControl
            choices={[
              { value: 'default', label: t('defaultStyle') },
              { value: 'underline', label: t('underlinedStyle') },
            ]}
            legend={t('headingStyle')}
            name="mdpdf-heading-style"
            onChange={(value) => update('headingStyle', value)}
            value={options.headingStyle}
          />
          <SegmentedControl
            choices={[
              { value: 'default', label: t('densityComfortable') },
              { value: 'classic', label: t('densityCompact') },
            ]}
            legend={t('density')}
            name="mdpdf-theme"
            onChange={(value) => update('theme', value)}
            value={options.theme}
          />
          <MarginInputs onChange={onChange} options={options} />
          <fieldset className="common-field">
            <legend className="common-field-label">{t('colors')}</legend>
            {colorRoles.map(({ role, label }) => (
              <ColorField
                key={role}
                label={t(label)}
                labels={{
                  choose: t('chooseColor', { role: t(label).toLowerCase() }),
                  value: t('colorValue', { role: t(label) }),
                  custom: t('customColor'),
                }}
                onChange={(value) => update('colors', { ...options.colors, [role]: value })}
                swatches={presetColors(role)}
                value={options.colors[role]}
              />
            ))}
          </fieldset>
        </div>
      )}
    </section>
  );
}
