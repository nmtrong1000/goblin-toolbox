declare module '*.css';

declare module 'markdown-it-task-lists' {
  import type MarkdownIt from 'markdown-it';

  export default function taskLists(md: MarkdownIt, options?: Record<string, unknown>): void;
}
