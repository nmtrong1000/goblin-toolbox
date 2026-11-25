import { Router } from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, requireCronSecret } from '#/index.ts';

const tool = Router();
tool.post('/echo', (request, response) => {
  response.json(request.body);
});
tool.get('/fail', () => {
  throw new Error('boom');
});
const cron = Router();
cron.get('/', requireCronSecret, (_request, response) => {
  response.json({ status: 'ok' });
});
const app = createApp({
  slug: 'sample',
  routes: [
    { path: '/api/tools/sample', router: tool },
    { path: '/api/cron/sample-job', router: cron },
  ],
});

describe('service app', () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('returns its own health and a request id', async () => {
    const response = await request(app).get('/api/tools/sample/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'sample' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('parses JSON bodies for tool routes', async () => {
    const response = await request(app).post('/api/tools/sample/echo').send({ value: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ value: 1 });
  });

  it('rejects a malformed JSON body as INVALID_REQUEST without logging the body', async () => {
    const log = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const response = await request(app)
      .post('/api/tools/sample/echo')
      .set('content-type', 'application/json')
      .send('{secret-text');
    const logged = log.mock.calls.map(([line]) => String(line)).join('');
    log.mockRestore();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ code: 'INVALID_REQUEST', message: 'The request is invalid.' });
    expect(logged).toContain('entity.parse.failed');
    expect(logged).not.toContain('secret-text');
  });

  it('returns the shared error format for unknown routes', async () => {
    const response = await request(app).get('/api/missing');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBeTruthy();
  });

  it('hides unexpected errors behind INTERNAL_ERROR', async () => {
    const response = await request(app).get('/api/tools/sample/fail');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    });
  });

  it('rejects cron calls without the secret', async () => {
    process.env.CRON_SECRET = 'secret';
    const missing = await request(app).get('/api/cron/sample-job');
    const wrong = await request(app)
      .get('/api/cron/sample-job')
      .set('authorization', 'Bearer nope');

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(missing.body.code).toBe('UNAUTHORIZED');
  });

  it('runs cron calls with the secret', async () => {
    process.env.CRON_SECRET = 'secret';
    const response = await request(app)
      .get('/api/cron/sample-job')
      .set('authorization', 'Bearer secret');

    expect(response.status).toBe(200);
  });
});
