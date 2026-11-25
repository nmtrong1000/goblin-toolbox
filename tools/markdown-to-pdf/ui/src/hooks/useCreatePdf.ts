import { useState } from 'react';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { PdfRequestError, requestPdf } from '#/api/pdf.ts';
import { saveFile } from '#/lib/save-file.ts';

export function useCreatePdf() {
  const [busy, setBusy] = useState(false);

  async function createPdf(markdown: string, options: PdfOptions) {
    setBusy(true);
    try {
      const result = await requestPdf(markdown, options);
      if (result.kind === 'file') saveFile(result.blob, 'markdown-to-pdf.pdf');
      else window.location.assign(result.url);
      return undefined;
    } catch (error) {
      return error instanceof PdfRequestError ? error.code : 'NETWORK_ERROR';
    } finally {
      setBusy(false);
    }
  }

  return { busy, createPdf };
}
