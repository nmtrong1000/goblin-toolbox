import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { deleteFilesOlderThan, storePdf } from '#/integrations/blob-storage.ts';
import { prepareImages } from '#/integrations/images.ts';
import { renderPdf } from '#/integrations/pdf-renderer.ts';

export const fileLifetimeMs = 60 * 60 * 1000;

export type PdfErrorCode =
  'TOO_MANY_ASSETS' | 'RENDER_TIMEOUT' | 'RENDER_FAILED' | 'STORAGE_FAILED';

export class PdfError extends Error {
  constructor(
    readonly code: PdfErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export type CreatedPdf =
  { kind: 'file'; pdf: Uint8Array } | { kind: 'stored'; url: string; expiresAt: string };

export async function preparePreview(markdown: string) {
  try {
    return await prepareImages(markdown);
  } catch {
    throw new PdfError('TOO_MANY_ASSETS', 'The document contains too many or too-large images.');
  }
}

export async function createPdf(
  markdown: string,
  options: PdfOptions,
  { keepLocal }: { keepLocal: boolean },
): Promise<CreatedPdf> {
  if (!keepLocal) await deleteExpiredFiles();
  const safeMarkdown = await preparePreview(markdown);
  const pdf = await render(safeMarkdown, options);
  if (keepLocal) return { kind: 'file', pdf };
  let url: string;
  try {
    url = await storePdf(pdf);
  } catch {
    throw new PdfError('STORAGE_FAILED', 'The PDF could not be stored.');
  }
  return { kind: 'stored', url, expiresAt: new Date(Date.now() + fileLifetimeMs).toISOString() };
}

export async function deleteExpiredFiles() {
  try {
    await deleteFilesOlderThan(fileLifetimeMs);
  } catch {
    throw new PdfError('STORAGE_FAILED', 'Temporary file cleanup failed.');
  }
}

async function render(markdown: string, options: PdfOptions) {
  try {
    return await renderPdf(markdown, options);
  } catch (error) {
    if (error instanceof Error && error.message === 'RENDER_TIMEOUT') {
      throw new PdfError('RENDER_TIMEOUT', 'PDF rendering timed out.');
    }
    throw new PdfError('RENDER_FAILED', 'The PDF could not be created.');
  }
}
