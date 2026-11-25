/*
 * Pixel sizes at 96 DPI. The preview mirrors the PDF page so users see the same layout the API
 * renders; keep these in step with the page options in the shared package.
 */
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';

const pageSizes: Record<PdfOptions['pageSize'], [number, number]> = {
  A4: [794, 1123],
  A5: [559, 794],
  Letter: [816, 1056],
  Legal: [816, 1344],
};

const margins: Record<PdfOptions['margin'], number> = { narrow: 38, normal: 76, wide: 95 };

export type PageLayout = { width: number; height: number; margin: number };

export function pageLayout(options: PdfOptions): PageLayout {
  const [shortSide, longSide] = pageSizes[options.pageSize];
  const landscape = options.orientation === 'landscape';
  return {
    width: landscape ? longSide : shortSide,
    height: landscape ? shortSide : longSide,
    margin: margins[options.margin],
  };
}

export function previewCss(options: PdfOptions, layout: PageLayout) {
  const font = options.font === 'noto-serif' ? 'Noto Serif,serif' : 'Noto Sans,sans-serif';
  const lineHeight = options.theme === 'classic' ? 1.55 : 1.7;
  const underline =
    options.headingStyle === 'underline'
      ? '.mdpdf-preview h1,.mdpdf-preview h2{border-bottom:1px solid currentColor;padding-bottom:.25em}'
      : '';
  const heading = options.colors.heading;
  return `.mdpdf-preview{box-sizing:border-box;width:${layout.width}px;min-height:${layout.height}px;margin:0;padding:${layout.margin}px;background:var(--color-paper-raised);color:${options.colors.text};font-family:${font};line-height:${lineHeight}}.mdpdf-preview h1,.mdpdf-preview h2,.mdpdf-preview h3{color:${heading}}.mdpdf-preview a{color:${options.colors.link}}.mdpdf-preview .mdpdf-frontmatter th{color:${heading};background:color-mix(in srgb,${heading} 12%,#fff)}${underline}`;
}
