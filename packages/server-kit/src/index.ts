import express, { type Express, type RequestHandler, type Router } from 'express';
import { errorHandler, notFound } from '#/middleware/errors.ts';
import { requestId } from '#/middleware/request-id.ts';
import { requestLog } from '#/middleware/request-log.ts';

export type ServiceRoute = { path: string; router: Router };

export function createApp({ slug, routes }: { slug: string; routes: ServiceRoute[] }): Express {
  const app = express();

  app.use(requestId);
  app.use(express.json({ limit: '4.49mb' }));
  app.use(requestLog);
  app.get(`/api/tools/${slug}/health`, (_request, response) => {
    response.json({ status: 'ok', service: slug });
  });
  for (const route of routes) {
    app.use(route.path, route.router);
  }
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const requireCronSecret: RequestHandler = (request, response, next) => {
  if (
    !process.env.CRON_SECRET ||
    request.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    response.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized.' });
    return;
  }
  next();
};
