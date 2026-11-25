import { createApp } from '@goblin/server-kit';
import cron from '#/routes/cron.ts';
import tool from '#/routes/tool.ts';

const app = createApp({
  slug: 'markdown-to-pdf',
  routes: [
    { path: '/api/tools/markdown-to-pdf', router: tool },
    { path: '/api/cron/markdown-to-pdf-cleanup', router: cron },
  ],
});

export default app;
