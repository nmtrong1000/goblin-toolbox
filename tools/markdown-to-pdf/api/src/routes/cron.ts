import { Router } from 'express';
import { requireCronSecret } from '@goblin/server-kit';
import { deleteExpiredFiles } from '#/services/pdf.ts';

const router: Router = Router();

router.get(
  '/',
  (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  },
  requireCronSecret,
  async (_request, response) => {
    await deleteExpiredFiles();
    response.json({ status: 'ok' });
  },
);

export default router;
