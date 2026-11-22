import { Router } from 'express';
import { del, list, put } from '@vercel/blob';
import { createPdfSchema, maxMarkdownCharacters } from '#/shared/options.js';
import { renderPdf } from '#/api/pdf.js';
import { prepareImages } from '#/api/images.js';

const router: Router = Router();
export const cleanupRouter: Router = Router();
const maxAge = 60 * 60 * 1000;
const localPdfOutput = process.env.LOCAL_PDF_OUTPUT === '1';

router.post('/preview', async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (typeof request.body?.markdown !== 'string') {
    response
      .status(400)
      .json({ code: 'INVALID_REQUEST', message: 'The Markdown document is invalid.' });
    return;
  }
  if (request.body.markdown.length > maxMarkdownCharacters) {
    response.status(413).json({
      code: 'MARKDOWN_TOO_LONG',
      message: 'The Markdown document is too long.',
    });
    return;
  }
  try {
    response.json({ markdown: await prepareImages(request.body.markdown) });
  } catch {
    response.status(413).json({
      code: 'TOO_MANY_ASSETS',
      message: 'The document contains too many or too-large images.',
    });
  }
});

router.post('/', async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  const startedAt = performance.now();
  const parsed = createPdfSchema.safeParse(request.body);
  if (!parsed.success) {
    const tooLong =
      typeof request.body?.markdown === 'string' &&
      request.body.markdown.length > maxMarkdownCharacters;
    response.status(tooLong ? 413 : 400).json({
      code: tooLong ? 'MARKDOWN_TOO_LONG' : 'INVALID_REQUEST',
      message: tooLong ? 'The Markdown document is too long.' : 'The request is invalid.',
    });
    return;
  }
  try {
    if (!localPdfOutput) await cleanupExpired();
    let safeMarkdown: string;
    try {
      safeMarkdown = await prepareImages(parsed.data.markdown);
    } catch {
      response.status(413).json({
        code: 'TOO_MANY_ASSETS',
        message: 'The document contains too many or too-large images.',
      });
      return;
    }
    let pdf: Uint8Array;
    try {
      pdf = await renderPdf(safeMarkdown, parsed.data.options);
    } catch (error) {
      if (error instanceof Error && error.message === 'RENDER_TIMEOUT') {
        response.status(504).json({ code: 'RENDER_TIMEOUT', message: 'PDF rendering timed out.' });
        return;
      }
      response
        .status(500)
        .json({ code: 'RENDER_FAILED', message: 'The PDF could not be created.' });
      return;
    }
    if (localPdfOutput) {
      response
        .status(200)
        .type('application/pdf')
        .setHeader('Content-Disposition', 'attachment; filename="markdown-to-pdf.pdf"');
      logRenderMetrics(
        String(request.get('x-request-id') ?? ''),
        parsed.data.markdown,
        startedAt,
        response.statusCode,
      );
      response.send(Buffer.from(pdf));
      return;
    }
    let blob;
    try {
      blob = await put(`markdown-to-pdf/${crypto.randomUUID()}.pdf`, Buffer.from(pdf), {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
      });
    } catch {
      response
        .status(500)
        .json({ code: 'STORAGE_FAILED', message: 'The PDF could not be stored.' });
      return;
    }
    logRenderMetrics(
      String(request.get('x-request-id') ?? ''),
      parsed.data.markdown,
      startedAt,
      response.statusCode,
    );
    response.json({ url: blob.url, expiresAt: new Date(Date.now() + maxAge).toISOString() });
  } catch {
    response
      .status(500)
      .json({ code: 'STORAGE_FAILED', message: 'Temporary file cleanup failed.' });
  }
});

cleanupRouter.get('/', async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (
    !process.env.CRON_SECRET ||
    request.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    response.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized.' });
    return;
  }
  await cleanupExpired();
  response.json({ status: 'ok' });
});

async function cleanupExpired() {
  const expired = [];
  let cursor: string | undefined;
  let hasMore = true;
  while (hasMore) {
    const page = await list({ prefix: 'markdown-to-pdf/', cursor });
    expired.push(
      ...page.blobs.filter((blob) => Date.now() - new Date(blob.uploadedAt).getTime() > maxAge),
    );
    cursor = page.cursor;
    hasMore = page.hasMore;
  }
  if (expired.length) await del(expired.map((blob) => blob.url));
}

function logRenderMetrics(requestId: string, markdown: string, startedAt: number, status: number) {
  process.stdout.write(
    `${JSON.stringify({
      level: 'info',
      event: 'markdown_to_pdf_render',
      requestId,
      markdownCharacters: markdown.length,
      imageCount: [...markdown.matchAll(/!\[[^\]]*\]\(/g)].length,
      diagramCount: [...markdown.matchAll(/```\s*mermaid\b/gi)].length,
      durationMs: Math.round(performance.now() - startedAt),
      rssBytes: process.memoryUsage().rss,
      status,
    })}\n`,
  );
}

export default router;
