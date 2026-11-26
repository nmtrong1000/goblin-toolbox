import { describe, expect, it } from 'vitest';
import { maxMarkdownCharacters } from '@goblin/tool-markdown-to-pdf-shared/options';
import { sampleDocument } from '#/lib/sampleDocument.ts';

describe('sampleDocument', () => {
  it('follows the current language and falls back to English', () => {
    expect(sampleDocument('vi')).toContain('# Markdown sang PDF');
    expect(sampleDocument('en')).toContain('# Markdown to PDF');
    expect(sampleDocument(undefined)).toBe(sampleDocument('en'));
  });

  it.each(['en', 'vi'])('shows every kind of content in %s', (language) => {
    const sample = sampleDocument(language);
    expect(sample.startsWith('---\ntitle:')).toBe(true);
    expect(sample).toMatch(/^\| :-/m);
    expect(sample).toMatch(/^- \[x\] /m);
    expect(sample).toContain('```typescript');
    expect(sample).toContain('$$');
    for (const diagram of ['flowchart', 'pie', 'xychart']) {
      expect(sample).toContain(`\`\`\`mermaid\n${diagram}`);
    }
    expect(sample.length).toBeLessThan(maxMarkdownCharacters);
  });
});
