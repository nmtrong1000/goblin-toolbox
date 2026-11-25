import { RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { PageSizePicker } from '#/components/PageSizePicker.tsx';
import { SegmentedControl } from '#/components/SegmentedControl.tsx';
import { ToggleSwitch } from '#/components/ToggleSwitch.tsx';

const margins: PdfOptions['margin'][] = ['narrow', 'normal', 'wide'];

type PageSettingsProps = {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
};

export function PageSettings({ options, onChange }: PageSettingsProps) {
  const { t } = useTranslation('markdown-to-pdf');

  function update<K extends keyof PdfOptions>(key: K, value: PdfOptions[K]) {
    onChange({ ...options, [key]: value });
  }

  return (
    <section className="mdpdf-settings-section" aria-labelledby="mdpdf-page-title">
      <h3 className="mdpdf-section-title" id="mdpdf-page-title">
        {t('pageSection')}
      </h3>
      <PageSizePicker options={options} onChange={(value) => update('pageSize', value)} />
      <div className="mdpdf-field-pair">
        <SegmentedControl
          choices={[
            {
              value: 'portrait',
              label: t('portrait'),
              icon: <RectangleVertical aria-hidden="true" size={16} />,
              iconOnly: true,
            },
            {
              value: 'landscape',
              label: t('landscape'),
              icon: <RectangleHorizontal aria-hidden="true" size={16} />,
              iconOnly: true,
            },
          ]}
          legend={t('orientation')}
          name="mdpdf-orientation"
          onChange={(value) => update('orientation', value)}
          value={options.orientation}
        />
        <SegmentedControl
          choices={margins.map((margin) => ({
            value: margin,
            label: t(margin),
            icon: (
              <span aria-hidden="true" className={`mdpdf-margin-icon mdpdf-margin-${margin}`} />
            ),
            iconOnly: true,
          }))}
          legend={t('margin')}
          name="mdpdf-margin"
          onChange={(value) => update('margin', value)}
          value={options.margin}
        />
      </div>
      <ToggleSwitch
        checked={options.pageNumbers}
        label={t('pageNumbers')}
        onChange={(value) => update('pageNumbers', value)}
      />
    </section>
  );
}
