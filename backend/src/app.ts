import express from 'express';
import { errorHandler, notFound } from '#/middleware/errors.js';
import { requestId } from '#/middleware/request-id.js';
import { requestLog } from '#/middleware/request-log.js';
import { mountTools } from '#/tools.js';

const app: express.Express = express();

app.use(requestId);
app.use(express.json({ limit: '4.49mb' }));
app.use(requestLog);
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});
mountTools(app);
app.use(notFound);
app.use(errorHandler);

export default app;
