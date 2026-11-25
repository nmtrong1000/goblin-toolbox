import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { renderDiagrams } from '@goblin/tool-markdown-to-pdf-shared/renderer';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { useContentHeight } from '#/hooks/useContentHeight.ts';
import { usePreviewScale } from '#/hooks/usePreviewScale.ts';
import { pageLayout, previewCss } from '#/lib/pageLayout.ts';

type PreviewPaneProps = {
  hidden: boolean;
  html: string;
  options: PdfOptions;
};

export function PreviewPane({ hidden, html, options }: PreviewPaneProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const container = useRef<HTMLElement>(null);
  const page = useRef<HTMLElement>(null);
  const layout = pageLayout(options);
  const css = previewCss(options, layout);
  const scale = usePreviewScale(container, layout.width);
  const contentHeight = useContentHeight(page, layout.height, html, css);

  useEffect(() => {
    void renderDiagrams();
  }, [html]);

  return (
    <section
      ref={container}
      className={`mdpdf-preview-wrap ${hidden ? 'mdpdf-mobile-hidden' : ''}`}
      aria-label={t('preview')}
    >
      <h2 className="mdpdf-panel-title">{t('preview')}</h2>
      <style>{css}</style>
      <div
        className="mdpdf-page-frame"
        style={{ width: layout.width * scale, height: contentHeight * scale }}
      >
        <article
          className="mdpdf-preview"
          ref={page}
          style={{
            minHeight: layout.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
