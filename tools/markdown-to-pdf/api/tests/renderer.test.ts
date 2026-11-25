import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@goblin/tool-markdown-to-pdf-shared/renderer';
import { createPdfSchema, defaultOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { prepareImages } from '#/integrations/images.ts';

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

  it('renders simple frontmatter as a table and keeps the body', () => {
    const html = renderMarkdown('---\nid: mkp\ntitle: "Thai <b>market</b>"\n---\n\n# Body');

    expect(html).toContain('<table class="mdpdf-frontmatter">');
    expect(html).toContain('<tr><th>id</th><td>mkp</td></tr>');
    expect(html).toContain('<td>Thai &lt;b&gt;market&lt;/b&gt;</td>');
    expect(html).toContain('<h1>Body</h1>');
    expect(html).not.toContain('<h2>');
  });

  it('shows nested frontmatter as raw text and leaves a lone rule alone', () => {
    expect(renderMarkdown('---\ntags:\n  - a\n---\nText')).toContain(
      '<pre class="mdpdf-frontmatter-raw"><code>tags:\n  - a</code></pre>',
    );
    expect(renderMarkdown('---\n\nText')).toContain('<hr>');
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
