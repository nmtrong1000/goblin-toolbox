import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '#/app.js';

describe('API app', () => {
  it('returns health and a request id', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('returns the shared error format for unknown routes', async () => {
    const response = await request(app).get('/api/missing');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.message).toBeTruthy();
  });
});
