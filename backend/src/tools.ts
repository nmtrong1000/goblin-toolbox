import type { Express, Router } from 'express';
import markdownToPdf, { cleanupRouter } from '@goblin/tool-markdown-to-pdf/api';

const toolRouters: Array<{ prefix: string; router: Router }> = [
  { prefix: '/api/tools/markdown-to-pdf', router: markdownToPdf },
  { prefix: '/api/cron/markdown-to-pdf-cleanup', router: cleanupRouter },
];

export function mountTools(app: Express) {
  for (const tool of toolRouters) {
    app.use(tool.prefix, tool.router);
  }
}
