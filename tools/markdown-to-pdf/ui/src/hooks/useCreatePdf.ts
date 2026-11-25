import { useEffect, useRef, useState } from 'react';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { PdfRequestError, requestPdf } from '#/api/pdf.ts';
import { saveFile } from '#/lib/saveFile.ts';

const doneFor = 2000;

export type PdfStatus = 'idle' | 'busy' | 'done';

export function useCreatePdf() {
  const [status, setStatus] = useState<PdfStatus>('idle');
  const doneTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(doneTimer.current), []);

  async function createPdf(markdown: string, options: PdfOptions) {
    window.clearTimeout(doneTimer.current);
    setStatus('busy');
    try {
      const result = await requestPdf(markdown, options);
      if (result.kind === 'file') saveFile(result.blob, 'markdown-to-pdf.pdf');
      else window.location.assign(result.url);
      setStatus('done');
      doneTimer.current = window.setTimeout(() => setStatus('idle'), doneFor);
      return undefined;
    } catch (error) {
      setStatus('idle');
      return error instanceof PdfRequestError ? error.code : 'NETWORK_ERROR';
    }
  }

  return { status, createPdf };
}
