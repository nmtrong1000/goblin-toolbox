import i18n from 'i18next';
import en from '#/i18n/en.ts';
import vi from '#/i18n/vi.ts';
import { ToolPage } from '#/pages/ToolPage.tsx';
import '#/styles/toolbar.css';
import '#/styles/settings.css';
import '#/styles/advanced.css';
import '#/styles/editor.css';
import '#/styles/preview.css';
import '#/styles/feedback.css';

i18n.addResourceBundle('en', 'markdown-to-pdf', en, true, true);
i18n.addResourceBundle('vi', 'markdown-to-pdf', vi, true, true);

export default function Tool() {
  return <ToolPage />;
}
