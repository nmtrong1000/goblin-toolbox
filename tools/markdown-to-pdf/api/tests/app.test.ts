import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '#/index.ts';

describe('Markdown to PDF API', () => {
  it('rejects invalid options before starting Chromium', async () => {
    const response = await request(app)
      .post('/api/tools/markdown-to-pdf')
      .send({ markdown: '# Test', options: { pageSize: 'tabloid' } });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_REQUEST');
  });

  it('returns a stable error for Markdown over the measured limit', async () => {
    const response = await request(app)
      .post('/api/tools/markdown-to-pdf')
      .send({ markdown: 'x'.repeat(100_001), options: {} });

    expect(response.status).toBe(413);
    expect(response.body.code).toBe('MARKDOWN_TOO_LONG');
  });

  it('protects the cleanup cron when the secret is missing or invalid', async () => {
    const originalSecret = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    const response = await request(app).get('/api/cron/markdown-to-pdf-cleanup');
    if (originalSecret !== undefined) process.env.CRON_SECRET = originalSecret;

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('uses the Request Guard for preview images and returns a placeholder for loopback hosts', async () => {
    const response = await request(app)
      .post('/api/tools/markdown-to-pdf/preview')
      .send({ markdown: '![private](http://127.0.0.1/secret.png)' });

    expect(response.status).toBe(200);
    expect(response.body.markdown).toContain('blocked-image:');
  });
});
