/*
 * Pixel sizes are at 96 DPI and must stay in step with the UI preview (ui/src/lib/pageLayout.ts),
 * which mirrors this page so the preview matches the PDF.
 */
import { type PdfOptions, pageMarginsMm } from '@goblin/tool-markdown-to-pdf-shared/options';

const pixelsPerMm = 96 / 25.4;
const pageSizes = {
  A4: [794, 1123],
  A5: [559, 794],
  Letter: [816, 1056],
  Legal: [816, 1344],
} as const;
const pageNumberMarkup = {
  'current-total': '<span class="pageNumber"></span> / <span class="totalPages"></span>',
  current: '<span class="pageNumber"></span>',
} as const;

export function pdfMargins(options: PdfOptions) {
  const margins = pageMarginsMm(options);
  return {
    top: `${margins.top}mm`,
    right: `${margins.right}mm`,
    bottom: `${margins.bottom}mm`,
    left: `${margins.left}mm`,
  };
}

export function footerTemplate(options: PdfOptions) {
  if (!options.pageNumbers) return '<span></span>';
  const margins = pageMarginsMm(options);
  return `<div style="font-size:8px;width:100%;box-sizing:border-box;padding:0 ${margins.right}mm 0 ${margins.left}mm;text-align:${options.pageNumberPosition}">${pageNumberMarkup[options.pageNumberFormat]}</div>`;
}

export function pageDimensions(options: PdfOptions) {
  const [portraitWidth, portraitHeight] = pageSizes[options.pageSize];
  const margins = pageMarginsMm(options);
  const landscape = options.orientation === 'landscape';
  return {
    width: landscape ? portraitHeight : portraitWidth,
    height: landscape ? portraitWidth : portraitHeight,
    padding: [margins.top, margins.right, margins.bottom, margins.left]
      .map((side) => `${side * pixelsPerMm}px`)
      .join(' '),
  };
}

export function documentCss(options: PdfOptions) {
  const family = options.font === 'noto-serif' ? 'Noto Serif, serif' : 'Noto Sans, sans-serif';
  const heading = options.colors.heading;
  const underline =
    options.headingStyle === 'underline'
      ? 'h1,h2{border-bottom:1px solid currentColor;padding-bottom:.25em}'
      : '';
  const density =
    options.theme === 'classic'
      ? 'body{font-size:10.5pt;line-height:1.4}p,ul,ol,table,pre,blockquote{margin:0 0 .6em}h1,h2,h3,h4{margin:.9em 0 .4em}td,th{padding:4px}pre{padding:8px}'
      : 'body{font-size:12pt;line-height:1.7}';
  return `body{display:flow-root;margin:0;font-family:${family};color:${options.colors.text}}h1,h2,h3{color:${heading}}a{color:${options.colors.link}}pre{white-space:pre-wrap;background:#f3f0eb;padding:12px}pre,code{font-family:'Noto Sans Mono',monospace}table{border-collapse:collapse;width:100%}td,th{border:1px solid #b8aa98;padding:6px}.mdpdf-frontmatter{margin-bottom:1.5em;font-size:.9em}.mdpdf-frontmatter th{width:30%;color:${heading};background:color-mix(in srgb,${heading} 12%,#fff);text-align:left}img{max-width:100%}${density}${underline}`;
}
