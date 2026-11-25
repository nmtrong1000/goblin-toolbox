import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { maxMarkdownCharacters } from '@goblin/tool-markdown-to-pdf-shared/options';

const warnAt = 0.9;

type EditorHeaderProps = { characters: number };

export function EditorHeader({ characters }: EditorHeaderProps) {
  const { t, i18n } = useTranslation('markdown-to-pdf');
  const format = new Intl.NumberFormat(i18n.resolvedLanguage);
  const values = { count: format.format(characters), max: format.format(maxMarkdownCharacters) };
  const near = characters >= maxMarkdownCharacters * warnAt;

  return (
    <div className="mdpdf-pane-header">
      <FileText aria-hidden="true" className="mdpdf-accent-icon" size={16} />
      <h2 className="mdpdf-pane-title" id="mdpdf-editor-title">
        {t('editorTitle')}
      </h2>
      <span
        aria-label={t('characterCountLabel', values)}
        className={near ? 'mdpdf-count mdpdf-count-near' : 'mdpdf-count'}
      >
        {t('characterCount', values)}
      </span>
    </div>
  );
}
