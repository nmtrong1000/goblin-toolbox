import { useTranslation } from 'react-i18next';
import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { pageLayout } from '#/lib/pageLayout.ts';

const pageSizes: PdfOptions['pageSize'][] = ['A4', 'A5', 'Letter', 'Legal'];
const thumbScale = 1 / 36;

type PageSizePickerProps = {
  options: PdfOptions;
  onChange: (pageSize: PdfOptions['pageSize']) => void;
};

export function PageSizePicker({ options, onChange }: PageSizePickerProps) {
  const { t } = useTranslation('markdown-to-pdf');

  return (
    <fieldset className="mdpdf-field">
      <legend className="mdpdf-field-label">{t('pageSize')}</legend>
      <div className="mdpdf-size-grid">
        {pageSizes.map((size) => {
          const layout = pageLayout({ ...options, pageSize: size });
          return (
            <label className="mdpdf-size" key={size}>
              <input
                checked={options.pageSize === size}
                className="mdpdf-choice-input"
                name="mdpdf-page-size"
                onChange={() => onChange(size)}
                type="radio"
                value={size}
              />
              <span className="mdpdf-size-face">
                <span className="mdpdf-size-well">
                  <span
                    className="mdpdf-size-thumb"
                    style={{
                      width: Math.round(layout.width * thumbScale),
                      height: Math.round(layout.height * thumbScale),
                    }}
                  />
                </span>
                {size}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
