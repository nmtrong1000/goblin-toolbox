import { performance } from 'node:perf_hooks';
import type { NextFunction, Request, Response } from 'express';

export function requestLog(request: Request, response: Response, next: NextFunction) {
  const startedAt = performance.now();
  response.on('finish', () => {
    process.stdout.write(
      `${JSON.stringify({
        level: 'info',
        requestId: request.requestId,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      })}\n`,
    );
  });
  next();
}
