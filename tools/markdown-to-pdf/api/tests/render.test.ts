import { describe, expect, it } from 'vitest';
import { renderPdf } from '#/integrations/pdf-renderer.ts';
import { defaultOptions } from '@goblin/tool-markdown-to-pdf-shared/options';

const pixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=';

describe('PDF renderer', () => {
  it('prints valid PDFs and records runtime measurements for representative documents', async () => {
    const paragraph = 'A representative paragraph for measuring renderer cost.\n\n';
    const fixtures = [
      { name: 'small', markdown: `${'# Sample\n\n'.repeat(250)}A short document.` },
      {
        name: 'maximum-input',
        markdown: paragraph.repeat(Math.ceil(100_000 / paragraph.length)).slice(0, 100_000),
      },
      {
        name: 'maximum-images',
        markdown: Array.from({ length: 10 }, (_, index) => `![image ${index}](${pixel})`).join(
          '\n\n',
        ),
      },
      {
        name: 'maximum-diagrams',
        markdown: Array.from(
          { length: 10 },
          (_, index) => `\n\n\`\`\`mermaid\ngraph TD\nA${index}-->B${index}\n\`\`\``,
        ).join(''),
      },
    ];

    for (const fixture of fixtures) {
      const startedAt = performance.now();
      const pdf = await renderPdf(fixture.markdown, defaultOptions);
      expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe('%PDF-');
      process.stdout.write(
        `${JSON.stringify({
          event: 'markdown_to_pdf_benchmark',
          fixture: fixture.name,
          markdownCharacters: fixture.markdown.length,
          imageCount: [...fixture.markdown.matchAll(/!\[[^\]]*\]\(/g)].length,
          diagramCount: [...fixture.markdown.matchAll(/```\s*mermaid\b/gi)].length,
          durationMs: Math.round(performance.now() - startedAt),
          rssBytes: process.memoryUsage().rss,
        })}\n`,
      );
    }
  }, 180_000);
});
