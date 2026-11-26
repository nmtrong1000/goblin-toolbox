declare module '*.css';

declare module '*.md?raw' {
  const content: string;
  export default content;
}

declare module 'markdown-it-task-lists' {
  import type MarkdownIt from 'markdown-it';

  export default function taskLists(md: MarkdownIt, options?: Record<string, unknown>): void;
}
