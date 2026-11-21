import type { Express, Router } from 'express';

const toolRouters: Array<{ prefix: string; router: Router }> = [];

export function mountTools(app: Express) {
  for (const tool of toolRouters) {
    app.use(tool.prefix, tool.router);
  }
}
