import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { renderPdf, renderPreviewScreenshot } from '#/integrations/pdf-renderer.ts';
import { defaultOptions } from '@goblin/tool-markdown-to-pdf-shared/options';

const run = promisify(execFile);
const hasPoppler = await run('pdftoppm', ['-v']).then(
  () => true,
  () => false,
);

describe('preview and PDF match', () => {
  it.skipIf(!hasPoppler)(
    'keeps the first page layout aligned',
    async () => {
      const markdown =
        '# Goblin Gazette\n\nTiếng Việt renders in Noto Sans.\n\n| Column | Value |\n| --- | --- |\n| One | Two |\n\n```ts\nconst answer = 42;\n```\n\nThe formula $e^{i\\pi}+1=0$ is balanced.';
      const options = { ...defaultOptions, pageNumbers: false };
      const preview = PNG.sync.read(Buffer.from(await renderPreviewScreenshot(markdown, options)));
      const pdf = await renderPdf(markdown, options);
      const directory = await mkdtemp(path.join(tmpdir(), 'markdown-to-pdf-match-'));
      try {
        const pdfPath = path.join(directory, 'fixture.pdf');
        const prefix = path.join(directory, 'page');
        await writeFile(pdfPath, pdf);
        await run('pdftoppm', ['-f', '1', '-l', '1', '-png', '-r', '96', pdfPath, prefix]);
        const printed = PNG.sync.read(await readFile(`${prefix}-1.png`));
        expect(Math.abs(printed.width - preview.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(printed.height - preview.height)).toBeLessThanOrEqual(1);
        const printedData = new Uint8Array(preview.data.length);
        const overlapWidth = Math.min(printed.width, preview.width);
        const overlapHeight = Math.min(printed.height, preview.height);
        for (let row = 0; row < overlapHeight; row += 1) {
          const sourceStart = row * printed.width * 4;
          const targetStart = row * preview.width * 4;
          printedData.set(
            printed.data.subarray(sourceStart, sourceStart + overlapWidth * 4),
            targetStart,
          );
        }
        const diff = new PNG({ width: preview.width, height: preview.height });
        const differingPixels = pixelmatch(
          preview.data,
          printedData,
          diff.data,
          preview.width,
          preview.height,
          {
            threshold: 0.1,
            includeAA: false,
          },
        );
        expect(differingPixels / (preview.width * preview.height)).toBeLessThan(0.05);
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
    60_000,
  );
});
