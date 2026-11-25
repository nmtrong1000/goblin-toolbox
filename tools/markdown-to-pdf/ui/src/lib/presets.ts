import type { PdfOptions } from '@goblin/tool-markdown-to-pdf-shared/options';

export type StyleFields = Pick<PdfOptions, 'font' | 'theme' | 'headingStyle' | 'colors'>;
export type StylePreset = StyleFields & { id: string };

export const stylePresets: StylePreset[] = [
  preset('goblin', 'noto-sans', 'default', 'default', '#1d1b18', '#78351f', '#a64f35'),
  preset('classic', 'noto-serif', 'classic', 'underline', '#222222', '#1d1b18', '#8b2e1f'),
  preset('ocean', 'noto-sans', 'default', 'default', '#14232e', '#0f4c75', '#1a6aa0'),
  preset('forest', 'noto-serif', 'default', 'underline', '#1c2419', '#2f5d34', '#38703a'),
  preset('plum', 'noto-serif', 'default', 'default', '#241a26', '#5b2a63', '#7e3a83'),
  preset('mono', 'noto-sans', 'classic', 'underline', '#111111', '#111111', '#4a4a4a'),
  preset('newsprint', 'noto-serif', 'classic', 'underline', '#1a1a1a', '#1a1a1a', '#8b1e1e'),
  preset('midnight', 'noto-sans', 'default', 'underline', '#10162a', '#1f3a8a', '#2f4bc0'),
  preset('terracotta', 'noto-serif', 'classic', 'default', '#2a1d17', '#8f3a1f', '#a8461f'),
  preset('slate', 'noto-sans', 'classic', 'default', '#1f2933', '#334e68', '#3e5c7a'),
];

function preset(
  id: string,
  font: PdfOptions['font'],
  theme: PdfOptions['theme'],
  headingStyle: PdfOptions['headingStyle'],
  text: string,
  heading: string,
  link: string,
): StylePreset {
  return { id, font, theme, headingStyle, colors: { text, heading, link } };
}

export function matchPreset(options: PdfOptions): StylePreset | undefined {
  return stylePresets.find(
    (item) =>
      item.font === options.font &&
      item.theme === options.theme &&
      item.headingStyle === options.headingStyle &&
      item.colors.text === options.colors.text.toLowerCase() &&
      item.colors.heading === options.colors.heading.toLowerCase() &&
      item.colors.link === options.colors.link.toLowerCase(),
  );
}

export function applyPreset(options: PdfOptions, item: StylePreset): PdfOptions {
  return {
    ...options,
    font: item.font,
    theme: item.theme,
    headingStyle: item.headingStyle,
    colors: { ...item.colors },
  };
}

export function presetColors(role: keyof PdfOptions['colors']) {
  return [...new Set(stylePresets.map((item) => item.colors[role]))];
}
