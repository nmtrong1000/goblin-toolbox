import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';

const baseUrl = '/api/tools/markdown-to-pdf';
const jsonHeaders = { 'content-type': 'application/json' };

export type PdfResult = { kind: 'file'; blob: Blob } | { kind: 'link'; url: string };

export class PdfRequestError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new PdfRequestError('NETWORK_ERROR');
  }
}

export async function requestPreview(
  markdown: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  const response = await fetch(`${baseUrl}/preview`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ markdown }),
    signal,
  });
  if (!response.ok) return undefined;
  const body = await readJson<{ markdown: string }>(response);
  return body.markdown;
}

export async function requestPdf(markdown: string, options: PdfOptions): Promise<PdfResult> {
  let response: Response;
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ markdown, options }),
    });
  } catch {
    throw new PdfRequestError('NETWORK_ERROR');
  }
  if (response.status === 429) throw new PdfRequestError('RATE_LIMITED');
  if (response.status === 413) throw new PdfRequestError('PAYLOAD_TOO_LARGE');
  if (!response.ok) {
    const body = await readJson<{ code?: string }>(response);
    throw new PdfRequestError(body.code ?? 'RENDER_FAILED');
  }
  if (response.headers.get('content-type')?.includes('application/pdf')) {
    return { kind: 'file', blob: await response.blob() };
  }
  const body = await readJson<{ url: string }>(response);
  return { kind: 'link', url: body.url };
}
