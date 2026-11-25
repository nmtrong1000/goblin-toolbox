import { describe, expect, it } from 'vitest';
import {
  type PdfOptions,
  createPdfSchema,
  defaultOptions,
} from '@goblin/tool-markdown-to-pdf-shared/options';
import {
  documentCss,
  footerTemplate,
  pageDimensions,
  pdfMargins,
} from '#/integrations/pdfPageSetup.ts';

const custom = { top: 30, right: 12, bottom: 15, left: 18 };
const olderRequestOptions = {
  pageSize: 'A4',
  orientation: 'portrait',
  margin: 'normal',
  pageNumbers: true,
  font: 'noto-sans',
  theme: 'default',
  colors: defaultOptions.colors,
  headingStyle: 'default',
};

describe('page options schema', () => {
  it('fills the new fields for a request made before they existed', () => {
    const parsed = createPdfSchema.parse({ markdown: '# A', options: olderRequestOptions });

    expect(parsed.options).toMatchObject({
      pageNumberPosition: 'center',
      pageNumberFormat: 'current-total',
    });
    expect(parsed.options.customMargins).toBeUndefined();
  });

  it.each([-1, 51])('rejects a %s mm margin', (bottom) => {
    const options = { ...defaultOptions, customMargins: { ...custom, bottom } };
    expect(createPdfSchema.safeParse({ markdown: '# A', options }).success).toBe(false);
  });
});

describe('page setup', () => {
  it('uses the margin preset unless custom margins are set', () => {
    expect(pdfMargins(defaultOptions)).toEqual({
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm',
    });
    expect(pdfMargins({ ...defaultOptions, customMargins: custom })).toEqual({
      top: '30mm',
      right: '12mm',
      bottom: '15mm',
      left: '18mm',
    });
  });

  it('places the page number by position and format inside the side margins', () => {
    const options: PdfOptions = {
      ...defaultOptions,
      customMargins: custom,
      pageNumberPosition: 'right',
      pageNumberFormat: 'current',
    };
    const footer = footerTemplate(options);

    expect(footer).toContain('text-align:right');
    expect(footer).toContain('padding:0 12mm 0 18mm');
    expect(footer).toContain('class="pageNumber"');
    expect(footer).not.toContain('totalPages');
    expect(footerTemplate(defaultOptions)).toContain('class="totalPages"');
    expect(footerTemplate({ ...defaultOptions, pageNumbers: false })).toBe('<span></span>');
  });

  it('pads the preview page with each margin in pixels', () => {
    const { padding } = pageDimensions({ ...defaultOptions, customMargins: custom });
    expect(padding.split(' ').map((side) => Math.round(Number.parseFloat(side)))).toEqual([
      113, 45, 57, 68,
    ]);
  });

  it('makes Compact clearly denser than Comfortable', () => {
    expect(documentCss(defaultOptions)).toContain('font-size:12pt;line-height:1.7');
    const compact = documentCss({ ...defaultOptions, theme: 'classic' });
    expect(compact).toContain('font-size:10.5pt;line-height:1.4');
    expect(compact).toContain('margin:0 0 .6em');
  });
});
