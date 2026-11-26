import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { Drawer } from '@goblin/ui-kit/components/Drawer';
import { AdvancedSettings } from '#/components/AdvancedSettings.tsx';
import { CreatePdfButton } from '#/components/CreatePdfButton.tsx';
import { PageSettings } from '#/components/PageSettings.tsx';
import { PresetPicker } from '#/components/PresetPicker.tsx';
import type { PdfStatus } from '#/hooks/useCreatePdf.ts';

type SettingsDrawerProps = {
  options: PdfOptions;
  styleName: string;
  status: PdfStatus;
  onChange: (options: PdfOptions) => void;
  onCreatePdf: () => void;
  onClose: () => void;
};

export function SettingsDrawer({
  options,
  styleName,
  status,
  onChange,
  onCreatePdf,
  onClose,
}: SettingsDrawerProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <Drawer
      closeLabel={t('closeSettings')}
      footer={<CreatePdfButton onCreatePdf={onCreatePdf} status={status} />}
      icon={<SlidersHorizontal aria-hidden="true" className="common-accent-icon" size={18} />}
      id="mdpdf-settings"
      onClose={onClose}
      title={t('settingsTitle')}
    >
      <PresetPicker onChange={onChange} options={options} styleName={styleName} />
      <PageSettings onChange={onChange} options={options} />
      <AdvancedSettings onChange={onChange} options={options} />
    </Drawer>
  );
}
