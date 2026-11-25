import { useTranslation } from 'react-i18next';
import { DropOverlay } from '#/components/DropOverlay.tsx';
import { EditorHeader } from '#/components/EditorHeader.tsx';
import { MarkdownEditor } from '#/components/MarkdownEditor.tsx';
import { useFileDrop } from '#/hooks/useFileDrop.ts';

type EditorPanelProps = {
  hidden: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpenFile: (file: File) => void;
};

export function EditorPanel({ hidden, value, onChange, onOpenFile }: EditorPanelProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const { dragging, dropProps } = useFileDrop(onOpenFile);

  return (
    <section
      aria-labelledby="mdpdf-editor-title"
      className={`mdpdf-pane mdpdf-editor ${hidden ? 'mdpdf-mobile-hidden' : ''}`}
      {...dropProps}
    >
      <EditorHeader characters={value.length} />
      <MarkdownEditor label={t('editor')} onChange={onChange} value={value} />
      {dragging && <DropOverlay />}
    </section>
  );
}
