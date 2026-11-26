import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultOptions, type PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { Toast } from '@goblin/ui-kit/components/Toast';
import { useToast } from '@goblin/ui-kit/hooks/useToast';
import { EditorPanel } from '#/components/EditorPanel.tsx';
import { type MobileView, MobileViewSwitch } from '#/components/MobileViewSwitch.tsx';
import { PreviewPane } from '#/components/PreviewPane.tsx';
import { SettingsDrawer } from '#/components/SettingsDrawer.tsx';
import { Toolbar } from '#/components/Toolbar.tsx';
import { useCreatePdf } from '#/hooks/useCreatePdf.ts';
import { useMarkdownDocument } from '#/hooks/useMarkdownDocument.ts';
import { usePreviewHtml } from '#/hooks/usePreviewHtml.ts';
import { matchPreset } from '#/lib/presets.ts';

export function ToolPage() {
  const { t } = useTranslation('markdown-to-pdf');
  const { markdown, setMarkdown, openFile, reformat } = useMarkdownDocument();
  const html = usePreviewHtml(markdown);
  const { status, createPdf } = useCreatePdf();
  const { toast, show, dismiss } = useToast();
  const [options, setOptions] = useState<PdfOptions>(defaultOptions);
  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const preset = matchPreset(options);
  const styleName = preset ? t(`preset.${preset.id}`) : t('custom');

  async function handleOpenFile(file: File) {
    if (!(await openFile(file))) show(t('fileRejectedTitle'), t('invalidFile'));
  }

  async function handleCreatePdf() {
    dismiss();
    const code = await createPdf(markdown, options);
    if (code) {
      show(t('pdfFailedTitle'), t(`errors.${code}`, { defaultValue: t('downloadError') }));
    }
  }

  function closeSettings() {
    setSettingsOpen(false);
    settingsButton.current?.focus();
  }

  return (
    <section className="mdpdf-tool" aria-label={t('title')}>
      <Toolbar
        onCreatePdf={() => void handleCreatePdf()}
        onOpenFile={(file) => void handleOpenFile(file)}
        onReformat={() => void reformat()}
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
        settingsButton={settingsButton}
        settingsOpen={settingsOpen}
        status={status}
        styleName={styleName}
      />
      <MobileViewSwitch view={mobileView} onChange={setMobileView} />
      <div className="mdpdf-workspace">
        {settingsOpen && (
          <SettingsDrawer
            onChange={setOptions}
            onClose={closeSettings}
            onCreatePdf={() => void handleCreatePdf()}
            options={options}
            status={status}
            styleName={styleName}
          />
        )}
        <EditorPanel
          hidden={mobileView === 'preview'}
          onChange={setMarkdown}
          onOpenFile={(file) => void handleOpenFile(file)}
          value={markdown}
        />
        <PreviewPane hidden={mobileView === 'editor'} html={html} options={options} />
      </div>
      {toast && (
        <Toast
          dismissLabel={t('dismiss')}
          key={toast.id}
          message={toast.message}
          onDismiss={dismiss}
          title={toast.title}
        />
      )}
    </section>
  );
}
