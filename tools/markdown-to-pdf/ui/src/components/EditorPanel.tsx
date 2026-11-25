import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '#/components/MarkdownEditor.tsx';

type EditorPanelProps = {
  hidden: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function EditorPanel({ hidden, value, onChange }: EditorPanelProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <section
      className={`mdpdf-editor ${hidden ? 'mdpdf-mobile-hidden' : ''}`}
      aria-labelledby="mdpdf-editor-title"
    >
      <h2 className="mdpdf-panel-title" id="mdpdf-editor-title">
        {t('editor')}
      </h2>
      <MarkdownEditor label={t('editor')} onChange={onChange} value={value} />
    </section>
  );
}
