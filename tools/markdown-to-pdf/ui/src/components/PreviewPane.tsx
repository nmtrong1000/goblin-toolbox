import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { renderDiagrams } from '@goblin/tool-markdown-to-pdf-shared/renderer';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { useContentHeight } from '@goblin/ui-kit/hooks/useContentHeight';
import { ZoomControl } from '#/components/ZoomControl.tsx';
import { usePreviewFit } from '#/hooks/usePreviewFit.ts';
import { pageLayout, previewCss } from '#/lib/pageLayout.ts';
import type { Zoom } from '#/lib/zoom.ts';

type PreviewPaneProps = {
  hidden: boolean;
  html: string;
  options: PdfOptions;
};

export function PreviewPane({ hidden, html, options }: PreviewPaneProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const well = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState<Zoom>('fit');
  const layout = pageLayout(options);
  const css = previewCss(options, layout);
  const fit = usePreviewFit(well, frame, layout.width);
  const scale = zoom === 'fit' ? fit.scale : zoom;
  const contentHeight = useContentHeight(page, layout.height);
  const width = layout.width * scale;
  const height = contentHeight * scale;

  useEffect(() => {
    void renderDiagrams();
  }, [html]);

  return (
    <section
      aria-labelledby="mdpdf-preview-title"
      className={`mdpdf-pane mdpdf-preview-wrap ${hidden ? 'mdpdf-mobile-hidden' : ''}`}
    >
      <div className="mdpdf-pane-header">
        <h2 className="mdpdf-pane-title" id="mdpdf-preview-title">
          {t('preview')}
        </h2>
        <span className="mdpdf-chip">
          {t('pageBadge', { size: options.pageSize, orientation: t(options.orientation) })}
        </span>
        <ZoomControl fitScale={fit.scale} onChange={setZoom} zoom={zoom} />
      </div>
      <div className="mdpdf-preview-well" ref={well}>
        <style>{css}</style>
        <div
          className="mdpdf-page-frame"
          ref={frame}
          style={{ width: width + fit.chrome, height: height + fit.chrome }}
        >
          <div className="mdpdf-page-sizer" style={{ width, height }}>
            <article
              className="mdpdf-preview"
              dangerouslySetInnerHTML={{ __html: html }}
              ref={page}
              style={{ minHeight: layout.height, transform: `scale(${scale})` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
