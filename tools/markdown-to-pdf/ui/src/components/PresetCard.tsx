import { useTranslation } from 'react-i18next';
import type { StylePreset } from '#/lib/presets.ts';

type PresetCardProps = { preset: StylePreset; name: string };

export function PresetCard({ preset, name }: PresetCardProps) {
  const { t } = useTranslation('markdown-to-pdf');
  const { text, heading, link } = preset.colors;
  const serif = preset.font === 'noto-serif';

  return (
    <span className="mdpdf-preset-face">
      <span aria-hidden="true" className="mdpdf-preset-page">
        <span
          className={serif ? 'mdpdf-preset-sample mdpdf-preset-serif' : 'mdpdf-preset-sample'}
          style={{ color: heading }}
        >
          {t('fontSample')}
        </span>
        <span className="mdpdf-preset-heading" style={{ background: heading }} />
        {preset.headingStyle === 'underline' && (
          <span className="mdpdf-preset-rule" style={{ background: heading }} />
        )}
        <span className="mdpdf-preset-line" style={{ background: text }} />
        <span className="mdpdf-preset-line mdpdf-preset-line-short" style={{ background: text }} />
        <span className="mdpdf-preset-link" style={{ background: link }} />
      </span>
      <span className="mdpdf-preset-name">{name}</span>
    </span>
  );
}
