/*
 * Pixel sizes at 96 DPI. The preview mirrors the PDF page so users see the same layout the API
 * renders; keep sizes, margins and density rules in step with api/src/integrations/pdfPageSetup.ts.
 */
import { type PdfOptions, pageMarginsMm } from '@goblin/tool-markdown-to-pdf-shared/options';

const pixelsPerMm = 96 / 25.4;
const pageSizes: Record<PdfOptions['pageSize'], [number, number]> = {
  A4: [794, 1123],
  A5: [559, 794],
  Letter: [816, 1056],
  Legal: [816, 1344],
};

export type PageLayout = { width: number; height: number; padding: string };

export function pageLayout(options: PdfOptions): PageLayout {
  const [shortSide, longSide] = pageSizes[options.pageSize];
  const landscape = options.orientation === 'landscape';
  const margins = pageMarginsMm(options);
  return {
    width: landscape ? longSide : shortSide,
    height: landscape ? shortSide : longSide,
    padding: [margins.top, margins.right, margins.bottom, margins.left]
      .map((side) => `${side * pixelsPerMm}px`)
      .join(' '),
  };
}

export function previewCss(options: PdfOptions, layout: PageLayout) {
  const font = options.font === 'noto-serif' ? 'Noto Serif,serif' : 'Noto Sans,sans-serif';
  const heading = options.colors.heading;
  const underline =
    options.headingStyle === 'underline'
      ? '.mdpdf-preview h1,.mdpdf-preview h2{border-bottom:1px solid currentColor;padding-bottom:.25em}'
      : '';
  const density =
    options.theme === 'classic'
      ? '.mdpdf-preview{font-size:14px;line-height:1.4}.mdpdf-preview :is(p,ul,ol,table,pre,blockquote){margin:0 0 .6em}.mdpdf-preview :is(h1,h2,h3,h4){margin:.9em 0 .4em}.mdpdf-preview :is(td,th){padding:4px}.mdpdf-preview pre{padding:8px}'
      : '.mdpdf-preview{font-size:16px;line-height:1.7}';
  return `.mdpdf-preview{box-sizing:border-box;width:${layout.width}px;min-height:${layout.height}px;margin:0;padding:${layout.padding};background:var(--color-paper-raised);color:${options.colors.text};font-family:${font}}.mdpdf-preview h1,.mdpdf-preview h2,.mdpdf-preview h3{color:${heading}}.mdpdf-preview a{color:${options.colors.link}}.mdpdf-preview .mdpdf-frontmatter th{color:${heading};background:color-mix(in srgb,${heading} 12%,#fff)}${density}${underline}`;
}
