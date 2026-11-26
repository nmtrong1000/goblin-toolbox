import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, postJson } from '#/api/requestJson.ts';

function respondWith(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

async function codeOf(promise: Promise<unknown>) {
  const error = await promise.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiError);
  return (error as ApiError).code;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('postJson', () => {
  it('sends the body as JSON and returns a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await postJson('/api/tools/demo', { text: 'hi' });
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith('/api/tools/demo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"text":"hi"}',
      signal: undefined,
    });
  });

  it('maps a failed fetch to NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await codeOf(postJson('/api', {}))).toBe('NETWORK_ERROR');
  });

  it('maps 429 and 413 without a body', async () => {
    respondWith(new Response('', { status: 429 }));
    expect(await codeOf(postJson('/api', {}))).toBe('RATE_LIMITED');
    respondWith(new Response('', { status: 413 }));
    expect(await codeOf(postJson('/api', {}))).toBe('PAYLOAD_TOO_LARGE');
  });

  it('uses the code from a JSON error body', async () => {
    respondWith(Response.json({ code: 'INVALID_REQUEST' }, { status: 400 }));
    expect(await codeOf(postJson('/api', {}))).toBe('INVALID_REQUEST');
  });

  it('falls back to the given code when the body has none', async () => {
    respondWith(Response.json({}, { status: 500 }));
    expect(await codeOf(postJson('/api', {}, { fallbackCode: 'RENDER_FAILED' }))).toBe(
      'RENDER_FAILED',
    );
  });

  it('maps an unreadable error body to NETWORK_ERROR', async () => {
    respondWith(new Response('<html>', { status: 502 }));
    expect(await codeOf(postJson('/api', {}))).toBe('NETWORK_ERROR');
  });
});
