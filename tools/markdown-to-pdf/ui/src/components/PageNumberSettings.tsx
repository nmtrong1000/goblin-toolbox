import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { SegmentedControl } from '@goblin/ui-kit/components/SegmentedControl';

type PageNumberSettingsProps = {
  options: PdfOptions;
  onChange: (options: PdfOptions) => void;
};

export function PageNumberSettings({ options, onChange }: PageNumberSettingsProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <div className="mdpdf-page-numbers">
      <div className="mdpdf-field-pair">
        <SegmentedControl
          choices={[
            {
              value: 'left',
              label: t('positionLeft'),
              icon: <AlignLeft aria-hidden="true" size={16} />,
              iconOnly: true,
            },
            {
              value: 'center',
              label: t('positionCenter'),
              icon: <AlignCenter aria-hidden="true" size={16} />,
              iconOnly: true,
            },
            {
              value: 'right',
              label: t('positionRight'),
              icon: <AlignRight aria-hidden="true" size={16} />,
              iconOnly: true,
            },
          ]}
          legend={t('pageNumberPosition')}
          name="mdpdf-page-number-position"
          onChange={(value) => onChange({ ...options, pageNumberPosition: value })}
          value={options.pageNumberPosition}
        />
        <SegmentedControl
          choices={[
            { value: 'current-total', label: t('formatCurrentTotal') },
            { value: 'current', label: t('formatCurrent') },
          ]}
          legend={t('pageNumberFormat')}
          name="mdpdf-page-number-format"
          onChange={(value) => onChange({ ...options, pageNumberFormat: value })}
          value={options.pageNumberFormat}
        />
      </div>
      <p className="mdpdf-field-hint">{t('pageNumbersHint')}</p>
    </div>
  );
}
