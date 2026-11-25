import { Router, type Response } from 'express';
import {
  createPdfSchema,
  maxMarkdownCharacters,
} from '@goblin/tool-markdown-to-pdf-shared/options';
import { createPdf, PdfError, preparePreview, type PdfErrorCode } from '#/services/pdf.ts';

const router: Router = Router();
const keepLocal = process.env.LOCAL_PDF_OUTPUT === '1';
const errorStatus: Record<PdfErrorCode, number> = {
  TOO_MANY_ASSETS: 413,
  RENDER_TIMEOUT: 504,
  RENDER_FAILED: 500,
  STORAGE_FAILED: 500,
};

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
    response.json({ markdown: await preparePreview(request.body.markdown) });
  } catch (error) {
    sendPdfError(response, error);
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
    const result = await createPdf(parsed.data.markdown, parsed.data.options, { keepLocal });
    logRenderMetrics(String(request.get('x-request-id') ?? ''), parsed.data.markdown, startedAt);
    if (result.kind === 'file') {
      response
        .status(200)
        .type('application/pdf')
        .setHeader('Content-Disposition', 'attachment; filename="markdown-to-pdf.pdf"');
      response.send(Buffer.from(result.pdf));
      return;
    }
    response.json({ url: result.url, expiresAt: result.expiresAt });
  } catch (error) {
    sendPdfError(response, error);
  }
});

function sendPdfError(response: Response, error: unknown) {
  if (!(error instanceof PdfError)) throw error;
  response.status(errorStatus[error.code]).json({ code: error.code, message: error.message });
}

function logRenderMetrics(requestId: string, markdown: string, startedAt: number) {
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
      status: 200,
    })}\n`,
  );
}

export default router;
