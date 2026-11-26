/*
 * Every failure leaves as an ApiError carrying a code from the tool API contract, so the UI only
 * translates codes. 429 and 413 are mapped by status because Vercel sends them without the JSON body
 * (TOOL_CONTRACT.md, Platform answers).
 */
const jsonHeaders = { 'content-type': 'application/json' };

export class ApiError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

type PostJsonOptions = { signal?: AbortSignal; fallbackCode?: string };

export async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('NETWORK_ERROR');
  }
}

export async function postJson(
  url: string,
  body: unknown,
  { signal, fallbackCode = 'INTERNAL_ERROR' }: PostJsonOptions = {},
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError('NETWORK_ERROR');
  }
  if (response.ok) return response;
  if (response.status === 429) throw new ApiError('RATE_LIMITED');
  if (response.status === 413) throw new ApiError('PAYLOAD_TOO_LARGE');
  const error = await readJson<{ code?: string }>(response);
  throw new ApiError(error.code ?? fallbackCode);
}
