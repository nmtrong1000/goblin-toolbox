import { useEffect, useMemo, useRef, useState } from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import * as prettier from 'prettier/standalone';
import markdownPlugin from 'prettier/plugins/markdown';
import en from '#/i18n/en.js';
import vi from '#/i18n/vi.js';
import { renderDiagrams, renderMarkdown } from '#/renderer/index.js';
import { defaultOptions, type PdfOptions } from '#/shared/options.js';
import '#/ui/styles.css';

i18n.addResourceBundle('en', 'markdownToPdf', en, true, true);
i18n.addResourceBundle('vi', 'markdownToPdf', vi, true, true);

export function MarkdownToPdf() {
  const { t } = useTranslation('markdownToPdf');
  const [markdown, setMarkdown] = useState('# Welcome\n\nWrite Markdown here to see a preview.');
  const [previewMarkdown, setPreviewMarkdown] = useState(markdown);
  const [options, setOptions] = useState<PdfOptions>(defaultOptions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [previewScale, setPreviewScale] = useState(1);
  const [previewContentHeight, setPreviewContentHeight] = useState(0);
  const previewSection = useRef<HTMLElement>(null);
  const previewPage = useRef<HTMLElement>(null);
  const rendered = useMemo(() => renderMarkdown(previewMarkdown), [previewMarkdown]);

  useEffect(() => {
    const controller = new AbortController();
    setPreviewMarkdown(markdown);
    const timer = window.setTimeout(() => {
      void fetch('/api/tools/markdown-to-pdf/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ markdown }),
        signal: controller.signal,
      })
        .then(async (result) => {
          if (result.ok) {
            const body = await result.json();
            setPreviewMarkdown(body.markdown);
          }
        })
        .catch(() => undefined);
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [markdown]);

  useEffect(() => {
    void renderDiagrams();
  }, [rendered]);

  async function createPdf() {
    setBusy(true);
    setError('');
    try {
      const result = await fetch('/api/tools/markdown-to-pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ markdown, options }),
      });
      if (result.status === 429) throw new Error('RATE_LIMITED');
      if (result.status === 413) throw new Error('PAYLOAD_TOO_LARGE');
      if (!result.ok) {
        const body = await result.json();
        throw new Error(body.code ?? 'RENDER_FAILED');
      }
      if (result.headers.get('content-type')?.includes('application/pdf')) {
        const url = URL.createObjectURL(await result.blob());
        const link = document.createElement('a');
        link.href = url;
        link.download = 'markdown-to-pdf.pdf';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
      const body = await result.json();
      window.location.assign(body.url);
    } catch (error) {
      const code =
        error instanceof TypeError || error instanceof SyntaxError
          ? 'NETWORK_ERROR'
          : error instanceof Error
            ? error.message
            : 'NETWORK_ERROR';
      const key = `errors.${code}`;
      setError(t(key, { defaultValue: t('downloadError') }));
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError(t('invalidFile', { ns: 'markdownToPdf' }));
      return;
    }
    setMarkdown(await file.text());
    setError('');
  }

  function update<K extends keyof PdfOptions>(key: K, value: PdfOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }));
  }

  function updateColor(key: keyof PdfOptions['colors'], value: string) {
    setOptions((current) => ({ ...current, colors: { ...current.colors, [key]: value } }));
  }

  async function reformat() {
    setMarkdown(await prettier.format(markdown, { parser: 'markdown', plugins: [markdownPlugin] }));
  }

  const text = (key: string) => t(key);
  const pageDimensions = {
    A4: [794, 1123],
    A5: [559, 794],
    Letter: [816, 1056],
    Legal: [816, 1344],
  }[options.pageSize];
  const [pageWidth, pageHeight] =
    options.orientation === 'landscape' ? [pageDimensions[1], pageDimensions[0]] : pageDimensions;
  const pageMargin = options.margin === 'narrow' ? 38 : options.margin === 'wide' ? 95 : 76;

  useEffect(() => {
    const section = previewSection.current;
    if (!section) return;
    const updateScale = () => {
      const style = window.getComputedStyle(section);
      const padding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
      setPreviewScale(Math.min(1, Math.max(0, section.clientWidth - padding) / pageWidth));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(section);
    updateScale();
    return () => observer.disconnect();
  }, [pageWidth]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPreviewContentHeight(previewPage.current?.scrollHeight ?? pageHeight);
    });
    return () => cancelAnimationFrame(frame);
  }, [rendered, pageHeight, options]);

  return (
    <section className="mdpdf-tool" aria-label={text('title')}>
      <div className="mdpdf-toolbar">
        <label className="button-secondary mdpdf-upload">
          {text('upload')}
          <input
            accept=".md,text/markdown"
            type="file"
            onChange={(event) => void uploadFile(event.target.files?.[0])}
          />
        </label>
        <button className="button-secondary" onClick={() => void reformat()} type="button">
          {text('reformat')}
        </button>
        <button
          className="button-primary"
          disabled={busy}
          onClick={() => void createPdf()}
          type="button"
        >
          {busy ? text('rendering') : text('download')}
        </button>
      </div>
      <div className="mdpdf-options">
        <label>
          {text('pageSize')}
          <select
            value={options.pageSize}
            onChange={(event) => update('pageSize', event.target.value as PdfOptions['pageSize'])}
          >
            {['A4', 'A5', 'Letter', 'Legal'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          {text('orientation')}
          <select
            value={options.orientation}
            onChange={(event) =>
              update('orientation', event.target.value as PdfOptions['orientation'])
            }
          >
            <option value="portrait">{text('portrait')}</option>
            <option value="landscape">{text('landscape')}</option>
          </select>
        </label>
        <label>
          {text('margin')}
          <select
            value={options.margin}
            onChange={(event) => update('margin', event.target.value as PdfOptions['margin'])}
          >
            <option value="narrow">{text('narrow')}</option>
            <option value="normal">{text('normal')}</option>
            <option value="wide">{text('wide')}</option>
          </select>
        </label>
        <label>
          {text('font')}
          <select
            value={options.font}
            onChange={(event) => update('font', event.target.value as PdfOptions['font'])}
          >
            <option value="noto-sans">{text('fontSans')}</option>
            <option value="noto-serif">{text('fontSerif')}</option>
          </select>
        </label>
        <label>
          {text('theme')}
          <select
            value={options.theme}
            onChange={(event) => update('theme', event.target.value as PdfOptions['theme'])}
          >
            <option value="default">{text('defaultTheme')}</option>
            <option value="classic">{text('classicTheme')}</option>
          </select>
        </label>
        <label>
          {text('headingStyle')}
          <select
            value={options.headingStyle}
            onChange={(event) =>
              update('headingStyle', event.target.value as PdfOptions['headingStyle'])
            }
          >
            <option value="default">{text('defaultStyle')}</option>
            <option value="underline">{text('underlinedStyle')}</option>
          </select>
        </label>
        <label>
          {text('textColor')}
          <input
            aria-label={text('textColor')}
            type="color"
            value={options.colors.text}
            onChange={(event) => updateColor('text', event.target.value)}
          />
        </label>
        <label>
          {text('headingColor')}
          <input
            aria-label={text('headingColor')}
            type="color"
            value={options.colors.heading}
            onChange={(event) => updateColor('heading', event.target.value)}
          />
        </label>
        <label>
          {text('linkColor')}
          <input
            aria-label={text('linkColor')}
            type="color"
            value={options.colors.link}
            onChange={(event) => updateColor('link', event.target.value)}
          />
        </label>
        <label className="mdpdf-checkbox">
          <input
            checked={options.pageNumbers}
            onChange={(event) => update('pageNumbers', event.target.checked)}
            type="checkbox"
          />
          {text('pageNumbers')}
        </label>
      </div>
      {error && (
        <p className="mdpdf-error" role="alert">
          {error}
        </p>
      )}
      <div className="mdpdf-mobile-tabs">
        <button
          aria-pressed={mobileView === 'editor'}
          onClick={() => setMobileView('editor')}
          type="button"
        >
          {text('mobileEditor')}
        </button>
        <button
          aria-pressed={mobileView === 'preview'}
          onClick={() => setMobileView('preview')}
          type="button"
        >
          {text('mobilePreview')}
        </button>
      </div>
      <div className="mdpdf-workspace">
        <section
          className={`mdpdf-editor ${mobileView === 'preview' ? 'mdpdf-mobile-hidden' : ''}`}
          aria-labelledby="mdpdf-editor-title"
        >
          <h2 className="mdpdf-panel-title" id="mdpdf-editor-title">
            {text('editor')}
          </h2>
          <MarkdownEditor label={text('editor')} onChange={setMarkdown} value={markdown} />
        </section>
        <section
          ref={previewSection}
          className={`mdpdf-preview-wrap ${mobileView === 'editor' ? 'mdpdf-mobile-hidden' : ''}`}
          aria-label={text('preview')}
        >
          <h2 className="mdpdf-panel-title">{text('preview')}</h2>
          <style>{`.mdpdf-preview{box-sizing:border-box;width:${pageWidth}px;min-height:${pageHeight}px;margin:0;padding:${pageMargin}px;background:var(--color-paper-raised);color:${options.colors.text};font-family:${options.font === 'noto-serif' ? 'Noto Serif,serif' : 'Noto Sans,sans-serif'};line-height:${options.theme === 'classic' ? 1.55 : 1.7}}.mdpdf-preview h1,.mdpdf-preview h2,.mdpdf-preview h3{color:${options.colors.heading}}.mdpdf-preview a{color:${options.colors.link}}${options.headingStyle === 'underline' ? '.mdpdf-preview h1,.mdpdf-preview h2{border-bottom:1px solid currentColor;padding-bottom:.25em}' : ''}`}</style>
          <div
            className="mdpdf-page-frame"
            style={{
              width: pageWidth * previewScale,
              height: Math.max(pageHeight, previewContentHeight) * previewScale,
            }}
          >
            <article
              className="mdpdf-preview"
              ref={previewPage}
              style={{
                minHeight: pageHeight,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

function MarkdownEditor({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const parent = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!parent.current) return;
    editor.current = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.contentAttributes.of({ 'aria-label': label }),
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

export default MarkdownToPdf;
