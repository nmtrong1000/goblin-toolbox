import * as prettier from 'prettier/standalone';
import markdownPlugin from 'prettier/plugins/markdown';

export function formatMarkdown(markdown: string) {
  return prettier.format(markdown, { parser: 'markdown', plugins: [markdownPlugin] });
}
