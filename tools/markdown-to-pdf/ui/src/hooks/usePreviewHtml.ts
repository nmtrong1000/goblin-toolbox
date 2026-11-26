/*
 * Renders the raw Markdown at once, then swaps in the API's prepared Markdown (remote images
 * inlined) after a 300 ms pause in typing.
 */
import { useEffect, useMemo, useState } from 'react';
import { renderMarkdown } from '@goblin/tool-markdown-to-pdf-shared/renderer';
import { requestPreview } from '#/api/pdf.ts';

export function usePreviewHtml(markdown: string) {
  const [prepared, setPrepared] = useState<{ source: string; markdown: string }>();
  const previewMarkdown = prepared?.source === markdown ? prepared.markdown : markdown;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      requestPreview(markdown, controller.signal)
        .then((result) => setPrepared({ source: markdown, markdown: result }))
        .catch(() => undefined);
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [markdown]);

  return useMemo(() => renderMarkdown(previewMarkdown), [previewMarkdown]);
}
