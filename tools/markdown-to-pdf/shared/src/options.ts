import { z } from 'zod';

const marginMm = z.number().min(0).max(50);

export const optionsSchema = z
  .object({
    pageSize: z.enum(['A4', 'A5', 'Letter', 'Legal']),
    orientation: z.enum(['portrait', 'landscape']),
    margin: z.enum(['narrow', 'normal', 'wide']),
    customMargins: z
      .object({ top: marginMm, right: marginMm, bottom: marginMm, left: marginMm })
      .strict()
      .optional(),
    pageNumbers: z.boolean(),
    pageNumberPosition: z.enum(['left', 'center', 'right']).default('center'),
    pageNumberFormat: z.enum(['current-total', 'current']).default('current-total'),
    font: z.enum(['noto-sans', 'noto-serif']),
    theme: z.enum(['default', 'classic']),
    colors: z
      .object({
        text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        heading: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        link: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
      .strict(),
    headingStyle: z.enum(['default', 'underline']),
  })
  .strict();

export type PdfOptions = z.infer<typeof optionsSchema>;
export type PageMargins = NonNullable<PdfOptions['customMargins']>;
export const maxMarkdownCharacters = 100_000;

export const marginPresetsMm: Record<PdfOptions['margin'], number> = {
  narrow: 10,
  normal: 20,
  wide: 25,
};

export function pageMarginsMm(options: PdfOptions): PageMargins {
  if (options.customMargins) return options.customMargins;
  const side = marginPresetsMm[options.margin];
  return { top: side, right: side, bottom: side, left: side };
}

export const defaultOptions: PdfOptions = {
  pageSize: 'A4',
  orientation: 'portrait',
  margin: 'normal',
  pageNumbers: true,
  pageNumberPosition: 'center',
  pageNumberFormat: 'current-total',
  font: 'noto-sans',
  theme: 'default',
  colors: { text: '#1d1b18', heading: '#78351f', link: '#a64f35' },
  headingStyle: 'default',
};

export const createPdfSchema = z
  .object({
    markdown: z.string().max(maxMarkdownCharacters),
    options: optionsSchema,
  })
  .strict();
