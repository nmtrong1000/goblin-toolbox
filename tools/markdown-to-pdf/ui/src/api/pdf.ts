import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { postJson, readJson } from '@goblin/ui-kit/api/requestJson';

const baseUrl = '/api/tools/markdown-to-pdf';

export type PdfResult = { kind: 'file'; blob: Blob } | { kind: 'link'; url: string };

export async function requestPreview(markdown: string, signal: AbortSignal): Promise<string> {
  const response = await postJson(`${baseUrl}/preview`, { markdown }, { signal });
  const body = await readJson<{ markdown: string }>(response);
  return body.markdown;
}

export async function requestPdf(markdown: string, options: PdfOptions): Promise<PdfResult> {
  const response = await postJson(
    baseUrl,
    { markdown, options },
    { fallbackCode: 'RENDER_FAILED' },
  );
  if (response.headers.get('content-type')?.includes('application/pdf')) {
    return { kind: 'file', blob: await response.blob() };
  }
  const body = await readJson<{ url: string }>(response);
  return { kind: 'link', url: body.url };
}
