import { z } from 'zod';

export const optionsSchema = z
  .object({
    pageSize: z.enum(['A4', 'A5', 'Letter', 'Legal']),
    orientation: z.enum(['portrait', 'landscape']),
    margin: z.enum(['narrow', 'normal', 'wide']),
    pageNumbers: z.boolean(),
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
export const maxMarkdownCharacters = 100_000;

export const defaultOptions: PdfOptions = {
  pageSize: 'A4',
  orientation: 'portrait',
  margin: 'normal',
  pageNumbers: true,
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
