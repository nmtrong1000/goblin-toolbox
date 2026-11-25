import { describe, expect, it } from 'vitest';
import { searchTools } from '#/catalog/search-tools.ts';
import type { CatalogTool, Localized } from '#/catalog/types.ts';

const tool: CatalogTool = {
  slug: 'markdown-to-pdf',
  vault: 'document-tools',
  name: { en: 'Markdown to PDF', vi: 'Markdown sang PDF' },
  description: { en: 'Turn Markdown into a PDF.', vi: 'Chuyển Markdown thành PDF.' },
  keywords: ['export'],
  remote: '/remotes/markdown-to-pdf/remoteEntry.js',
};
const english = (text: Localized) => text.en;

describe('searchTools', () => {
  it('returns every tool for an empty query', () => {
    expect(searchTools([tool], '  ', english)).toEqual([tool]);
  });

  it('matches name, description and keywords without case', () => {
    expect(searchTools([tool], 'PDF', english)).toEqual([tool]);
    expect(searchTools([tool], 'turn', english)).toEqual([tool]);
    expect(searchTools([tool], 'Export', english)).toEqual([tool]);
  });

  it('searches the current locale only', () => {
    expect(searchTools([tool], 'chuyển', english)).toEqual([]);
    expect(searchTools([tool], 'chuyển', (text) => text.vi)).toEqual([tool]);
  });
});
