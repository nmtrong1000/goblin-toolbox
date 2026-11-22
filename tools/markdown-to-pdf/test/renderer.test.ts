import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '#/renderer/index.js';
import { createPdfSchema, defaultOptions } from '#/shared/options.js';
import { prepareImages } from '#/api/images.js';

describe('Markdown to PDF shared renderer', () => {
  it('renders GFM tables, task lists, math and Mermaid blocks', () => {
    const html = renderMarkdown(
      '| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n\n$e^{i\\pi}+1=0$\n\n```mermaid\ngraph TD\nA-->B\n```',
    );

    expect(html).toContain('<table>');
    expect(html).toContain('task-list-item');
    expect(html).toContain('katex');
    expect(html).toContain('class="mdpdf-mermaid"');
  });

  it('escapes raw HTML and replaces remote images with placeholders', () => {
    const html = renderMarkdown(
      '<script>alert(1)</script>\n\n![private](http://127.0.0.1/secret.png)',
    );

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('private');
    expect(html).not.toContain('127.0.0.1');
  });

  it('validates the required PDF options and rejects invalid colors', () => {
    expect(createPdfSchema.safeParse({ markdown: '# Test', options: defaultOptions }).success).toBe(
      true,
    );
    expect(
      createPdfSchema.safeParse({
        markdown: '# Test',
        options: { ...defaultOptions, colors: { ...defaultOptions.colors, link: 'red' } },
      }).success,
    ).toBe(false);
  });

  it('does not fetch image syntax inside code and blocks loopback image URLs', async () => {
    const code = '`![example](https://example.com/image.png)`';
    expect(await prepareImages(code)).toBe(code);
    const fencedCode = '```md\n![example](http://127.0.0.1/image.png)\n```';
    expect(await prepareImages(fencedCode)).toBe(fencedCode);
    expect(await prepareImages('![private](http://127.0.0.1/secret.png)')).toContain(
      'blocked-image:',
    );
  });

  it('enforces the measured input and asset-count limits', async () => {
    expect(
      createPdfSchema.safeParse({ markdown: 'x'.repeat(100_001), options: defaultOptions }).success,
    ).toBe(false);
    await expect(
      prepareImages(Array.from({ length: 11 }, () => '![a](http://127.0.0.1/a.png)').join('\n')),
    ).rejects.toThrow('TOO_MANY_ASSETS');
  });
});
