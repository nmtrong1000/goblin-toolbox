import { useState } from 'react';
import { formatMarkdown } from '#/lib/formatMarkdown.ts';

const initialMarkdown = '# Welcome\n\nWrite Markdown here to see a preview.';

export function useMarkdownDocument() {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  async function openFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.md')) return false;
    setMarkdown(await file.text());
    return true;
  }

  async function reformat() {
    setMarkdown(await formatMarkdown(markdown));
  }

  return { markdown, setMarkdown, openFile, reformat };
}
