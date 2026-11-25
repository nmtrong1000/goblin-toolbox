import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { del, list, put } from '@vercel/blob';
import markdownToPdfRouter from '#/routes/tool.ts';
import { renderPdf } from '#/integrations/pdf-renderer.ts';
import { defaultOptions } from '@goblin/tool-markdown-to-pdf-shared/options';

vi.mock('@vercel/blob', () => ({
  del: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}));

vi.mock('#/integrations/pdf-renderer.ts', () => ({ renderPdf: vi.fn() }));

const app = express();
app.use(express.json());
app.use('/', markdownToPdfRouter);

describe('Markdown to PDF API pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(renderPdf).mockResolvedValue(Uint8Array.from([37, 80, 68, 70]));
    vi.mocked(list).mockResolvedValue({ blobs: [], hasMore: false } as never);
    vi.mocked(put).mockResolvedValue({ url: 'https://blob.example/random.pdf' } as never);
  });

  it('renders, stores, and returns an expiring URL', async () => {
    const response = await request(app)
      .post('/')
      .send({ markdown: '# Hello', options: defaultOptions });

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.url).toBe('https://blob.example/random.pdf');
    expect(response.body.expiresAt).toBeTruthy();
    expect(renderPdf).toHaveBeenCalledWith('# Hello', defaultOptions);
    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^markdown-to-pdf\/.+\.pdf$/),
      expect.any(Buffer),
      {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
      },
    );
  });

  it('paginates cleanup and deletes only files older than one hour', async () => {
    const oldBlob = {
      url: 'https://blob.example/old.pdf',
      uploadedAt: new Date(Date.now() - 3_600_001),
    };
    vi.mocked(list)
      .mockResolvedValueOnce({ blobs: [oldBlob], hasMore: true, cursor: 'next' } as never)
      .mockResolvedValueOnce({
        blobs: [{ url: 'https://blob.example/new.pdf', uploadedAt: new Date() }],
        hasMore: false,
      } as never);

    const response = await request(app)
      .post('/')
      .send({ markdown: '# Hello', options: defaultOptions });

    expect(response.status).toBe(200);
    expect(list).toHaveBeenCalledTimes(2);
    expect(del).toHaveBeenCalledWith([oldBlob.url]);
  });
});
