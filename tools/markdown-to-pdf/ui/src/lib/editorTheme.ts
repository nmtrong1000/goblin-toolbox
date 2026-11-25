/*
 * Colors come from the ui-kit CSS variables, so the editor follows the Goblin palette. The highlight
 * style must be added before basicSetup's default one, which only acts as a fallback.
 * CodeMirror draws the selection in a layer behind the text, so the active line background must stay
 * translucent or it hides the selection on that line.
 */
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const highlight = HighlightStyle.define([
  { tag: tags.heading, color: 'var(--color-accent-dark)', fontWeight: '600' },
  {
    tag: tags.processingInstruction,
    color: 'color-mix(in srgb, var(--color-accent) 60%, var(--color-paper))',
  },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.link, color: 'var(--color-olive)', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--color-ink-soft)' },
  { tag: tags.quote, color: 'var(--color-ink-soft)', fontStyle: 'italic' },
  { tag: tags.monospace, backgroundColor: 'var(--color-paper-deep)', borderRadius: '2px' },
  { tag: tags.keyword, color: 'var(--color-accent-dark)' },
  { tag: [tags.number, tags.string], color: 'var(--color-olive)' },
  { tag: tags.comment, color: 'var(--color-ink-soft)', fontStyle: 'italic' },
]);

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--color-paper-raised)', color: 'var(--color-ink)' },
  '.cm-content': { caretColor: 'var(--color-accent)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-accent)' },
  '.cm-gutters': {
    backgroundColor: 'var(--color-paper-raised)',
    color: 'var(--color-rule)',
    borderRight: '1px solid var(--color-paper-deep)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--color-paper-deep) 40%, transparent)',
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'var(--color-paper)', color: 'var(--color-ink-mid)' },
  '& > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--color-accent-pale)',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
  },
});

export const goblinEditorTheme = [theme, syntaxHighlighting(highlight)];
