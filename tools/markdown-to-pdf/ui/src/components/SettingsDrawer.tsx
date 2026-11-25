import { useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { AdvancedSettings } from '#/components/AdvancedSettings.tsx';
import { CreatePdfButton } from '#/components/CreatePdfButton.tsx';
import { PageSettings } from '#/components/PageSettings.tsx';
import { PresetPicker } from '#/components/PresetPicker.tsx';
import { useDismiss } from '#/hooks/useDismiss.ts';
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
  const drawer = useRef<HTMLElement>(null);

  useDismiss(drawer, true, onClose);

  useEffect(() => {
    const area = drawer.current;
    const first =
      area?.querySelector<HTMLElement>('input:checked') ??
      area?.querySelector<HTMLElement>('input, button');
    first?.focus();
  }, []);

  return (
    <>
      <button
        aria-label={t('closeSettings')}
        className="mdpdf-backdrop"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-labelledby="mdpdf-settings-title"
        className="mdpdf-drawer"
        id="mdpdf-settings"
        ref={drawer}
      >
        <header className="mdpdf-drawer-header">
          <SlidersHorizontal aria-hidden="true" className="mdpdf-accent-icon" size={18} />
          <h2 className="mdpdf-drawer-title" id="mdpdf-settings-title">
            {t('settingsTitle')}
          </h2>
          <button
            aria-label={t('closeSettings')}
            className="mdpdf-icon-button"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </header>
        <PresetPicker onChange={onChange} options={options} styleName={styleName} />
        <PageSettings onChange={onChange} options={options} />
        <AdvancedSettings onChange={onChange} options={options} />
        <div className="mdpdf-drawer-footer">
          <CreatePdfButton onCreatePdf={onCreatePdf} status={status} />
        </div>
      </aside>
    </>
  );
}
