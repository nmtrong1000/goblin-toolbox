import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultOptions, type PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { EditorPanel } from '#/components/EditorPanel.tsx';
import { type MobileView, MobileViewSwitch } from '#/components/MobileViewSwitch.tsx';
import { OptionsPanel } from '#/components/OptionsPanel.tsx';
import { PreviewPane } from '#/components/PreviewPane.tsx';
import { Toolbar } from '#/components/Toolbar.tsx';
import { useCreatePdf } from '#/hooks/useCreatePdf.ts';
import { useMarkdownDocument } from '#/hooks/useMarkdownDocument.ts';
import { usePreviewHtml } from '#/hooks/usePreviewHtml.ts';

export function ToolPage() {
  const { t } = useTranslation('markdown-to-pdf');
  const { markdown, setMarkdown, openFile, reformat } = useMarkdownDocument();
  const html = usePreviewHtml(markdown);
  const { busy, createPdf } = useCreatePdf();
  const [options, setOptions] = useState<PdfOptions>(defaultOptions);
  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const [error, setError] = useState('');

  async function handleOpenFile(file: File) {
    const opened = await openFile(file);
    setError(opened ? '' : t('invalidFile'));
  }

  async function handleCreatePdf() {
    setError('');
    const code = await createPdf(markdown, options);
    if (code) setError(t(`errors.${code}`, { defaultValue: t('downloadError') }));
  }

  return (
    <section className="mdpdf-tool" aria-label={t('title')}>
      <Toolbar
        busy={busy}
        onOpenFile={(file) => void handleOpenFile(file)}
        onReformat={() => void reformat()}
        onCreatePdf={() => void handleCreatePdf()}
      />
      <OptionsPanel options={options} onChange={setOptions} />
      {error && (
        <p className="mdpdf-error" role="alert">
          {error}
        </p>
      )}
      <MobileViewSwitch view={mobileView} onChange={setMobileView} />
      <div className="mdpdf-workspace">
        <EditorPanel hidden={mobileView === 'preview'} value={markdown} onChange={setMarkdown} />
        <PreviewPane hidden={mobileView === 'editor'} html={html} options={options} />
      </div>
    </section>
  );
}
