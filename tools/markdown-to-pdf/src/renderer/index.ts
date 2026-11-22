import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import markdownItKatex from '@vscode/markdown-it-katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/700.css';
import '@fontsource/noto-serif/400.css';
import '@fontsource/noto-serif/700.css';
import '@fontsource/noto-sans-mono/400.css';
import '@fontsource/noto-sans-mono/700.css';

declare global {
  interface Window {
    renderMarkdown: (source: string) => string;
    renderDiagrams: () => Promise<void>;
  }
}

const escapeHtml = (code: string) =>
  code.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  );

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: (code: string, language: string): string => {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${hljs.highlight(code, { language }).value}</code></pre>`;
    }
    return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`;
  },
});
type MarkdownItPlugin = (md: InstanceType<typeof MarkdownIt>) => InstanceType<typeof MarkdownIt>;
const katexPluginModule = markdownItKatex as unknown as
  MarkdownItPlugin | { default: MarkdownItPlugin };
const katexPlugin =
  typeof katexPluginModule === 'function' ? katexPluginModule : katexPluginModule.default;
markdown.use(taskLists, { enabled: true, label: true }).use(katexPlugin);

const allowedHtml = [
  'abbr',
  'b',
  'br',
  'code',
  'del',
  'details',
  'div',
  'em',
  'i',
  'kbd',
  'input',
  'label',
  'li',
  'mark',
  'ol',
  'p',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'u',
  'ul',
];
const sanitizeUserHtml = (html: string) => {
  if (typeof window === 'undefined') return escapeHtml(html);
  return String(
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedHtml,
      ALLOWED_ATTR: ['checked', 'class', 'disabled', 'type'],
    }),
  ).replace(/<input\b(?![^>]*\btype=["']?checkbox\b)[^>]*>/gi, '');
};

markdown.renderer.rules.html_inline = (tokens, index) => sanitizeUserHtml(tokens[index].content);
markdown.renderer.rules.html_block = (tokens, index) => sanitizeUserHtml(tokens[index].content);

const renderFence = markdown.renderer.rules.fence;
let diagramSequence = 0;
const renderImage = markdown.renderer.rules.image;
markdown.renderer.rules.image = (tokens, index, options, environment, self) => {
  const source = String(tokens[index].attrGet('src') ?? '');
  if (!/^data:image\/(png|jpeg|gif|webp|avif);base64,/i.test(source)) {
    const alt = tokens[index].content || 'Image unavailable';
    return `<span class="mdpdf-image-placeholder">${escapeHtml(alt)}</span>`;
  }
  return renderImage
    ? renderImage(tokens, index, options, environment, self)
    : self.renderToken(tokens, index, options);
};
markdown.renderer.rules.fence = (tokens, index, options, environment, self) => {
  const token = tokens[index];
  if (token.info.trim().toLowerCase() === 'mermaid') {
    return `<div class="mdpdf-mermaid" data-source="${escapeHtml(token.content)}"></div>`;
  }
  return renderFence
    ? renderFence(tokens, index, options, environment, self)
    : self.renderToken(tokens, index, options);
};

export function renderMarkdown(source: string) {
  return markdown.render(source);
}

export async function renderDiagrams() {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
    fontFamily: 'Noto Sans, sans-serif',
  });
  const diagrams = document.querySelectorAll<HTMLElement>('.mdpdf-mermaid:not([data-rendered])');
  for (const element of diagrams) {
    element.dataset.rendered = 'true';
    try {
      const source = element.dataset.source ?? '';
      await mermaid.parse(source);
      diagramSequence += 1;
      const result = await mermaid.render(`goblin-diagram-${diagramSequence}`, source);
      element.innerHTML = result.svg;
      result.bindFunctions?.(element);
    } catch {
      element.textContent = 'Diagram could not be rendered.';
      element.classList.add('mdpdf-diagram-error');
    }
  }
}

if (typeof window !== 'undefined') {
  window.renderMarkdown = renderMarkdown;
  window.renderDiagrams = renderDiagrams;
}
