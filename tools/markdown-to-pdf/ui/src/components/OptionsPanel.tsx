import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { ColorOption } from '#/components/ColorOption.tsx';
import { OptionSelect } from '#/components/OptionSelect.tsx';

type OptionsPanelProps = {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
};

const pageSizes: PdfOptions['pageSize'][] = ['A4', 'A5', 'Letter', 'Legal'];

export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const { t } = useTranslation('markdown-to-pdf');

  function update<K extends keyof PdfOptions>(key: K, value: PdfOptions[K]) {
    onChange({ ...options, [key]: value });
  }

  function updateColor(key: keyof PdfOptions['colors'], value: string) {
    onChange({ ...options, colors: { ...options.colors, [key]: value } });
  }

  return (
    <div className="mdpdf-options">
      <OptionSelect
        label={t('pageSize')}
        value={options.pageSize}
        choices={pageSizes.map((size) => ({ value: size, label: size }))}
        onChange={(value) => update('pageSize', value)}
      />
      <OptionSelect
        label={t('orientation')}
        value={options.orientation}
        choices={[
          { value: 'portrait', label: t('portrait') },
          { value: 'landscape', label: t('landscape') },
        ]}
        onChange={(value) => update('orientation', value)}
      />
      <OptionSelect
        label={t('margin')}
        value={options.margin}
        choices={[
          { value: 'narrow', label: t('narrow') },
          { value: 'normal', label: t('normal') },
          { value: 'wide', label: t('wide') },
        ]}
        onChange={(value) => update('margin', value)}
      />
      <OptionSelect
        label={t('font')}
        value={options.font}
        choices={[
          { value: 'noto-sans', label: t('fontSans') },
          { value: 'noto-serif', label: t('fontSerif') },
        ]}
        onChange={(value) => update('font', value)}
      />
      <OptionSelect
        label={t('theme')}
        value={options.theme}
        choices={[
          { value: 'default', label: t('defaultTheme') },
          { value: 'classic', label: t('classicTheme') },
        ]}
        onChange={(value) => update('theme', value)}
      />
      <OptionSelect
        label={t('headingStyle')}
        value={options.headingStyle}
        choices={[
          { value: 'default', label: t('defaultStyle') },
          { value: 'underline', label: t('underlinedStyle') },
        ]}
        onChange={(value) => update('headingStyle', value)}
      />
      <ColorOption
        label={t('textColor')}
        value={options.colors.text}
        onChange={(value) => updateColor('text', value)}
      />
      <ColorOption
        label={t('headingColor')}
        value={options.colors.heading}
        onChange={(value) => updateColor('heading', value)}
      />
      <ColorOption
        label={t('linkColor')}
        value={options.colors.link}
        onChange={(value) => updateColor('link', value)}
      />
      <label className="mdpdf-checkbox">
        <input
          checked={options.pageNumbers}
          onChange={(event) => update('pageNumbers', event.target.checked)}
          type="checkbox"
        />
        {t('pageNumbers')}
      </label>
    </div>
  );
}
