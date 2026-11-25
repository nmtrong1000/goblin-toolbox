/*
 * CodeMirror owns the document while the user types. The editor is created once with the first
 * value and label; later value changes (file upload, reformat) are pushed in only when they differ
 * from the editor's text, so typing never resets the cursor.
 */
import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

type MarkdownEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ label, value, onChange }: MarkdownEditorProps) {
  const parent = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const initial = useRef({ value, label });
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!parent.current) return;
    editor.current = new EditorView({
      doc: initial.current.value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.contentAttributes.of({ 'aria-label': initial.current.label }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
      parent: parent.current,
    });
    return () => {
      editor.current?.destroy();
      editor.current = null;
    };
  }, []);

  useEffect(() => {
    const current = editor.current;
    if (current && current.state.doc.toString() !== value) {
      current.dispatch({ changes: { from: 0, to: current.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    editor.current?.contentDOM.setAttribute('aria-label', label);
  }, [label]);

  return <div className="mdpdf-codemirror" ref={parent} />;
}
