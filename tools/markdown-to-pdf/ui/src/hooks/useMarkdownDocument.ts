import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMarkdown } from '#/lib/formatMarkdown.ts';
import { sampleDocument } from '#/lib/sampleDocument.ts';

export function useMarkdownDocument() {
  const { i18n } = useTranslation('markdown-to-pdf');
  const [markdown, setMarkdown] = useState(() => sampleDocument(i18n.resolvedLanguage));

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
