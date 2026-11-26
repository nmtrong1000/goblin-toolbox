import { describe, expect, it } from 'vitest';
import { defaultOptions } from '@goblin/tool-markdown-to-pdf-shared/options';
import { contrastRatio, isHexColor } from '@goblin/ui-kit/lib/color';
import { applyPreset, matchPreset, presetColors, stylePresets } from '#/lib/presets.ts';

describe('style presets', () => {
  it('has ten presets with unique ids', () => {
    expect(new Set(stylePresets.map((item) => item.id)).size).toBe(10);
  });

  it('starts on the Goblin preset with the default options', () => {
    expect(matchPreset(defaultOptions)?.id).toBe('goblin');
  });

  it('sets the six style fields and keeps the page fields', () => {
    const page = { ...defaultOptions, pageSize: 'A5' as const, pageNumbers: false };
    const ocean = stylePresets[2];
    const result = applyPreset(page, ocean);

    expect(result).toMatchObject({ pageSize: 'A5', pageNumbers: false, font: 'noto-sans' });
    expect(result.colors).toEqual(ocean.colors);
    expect(matchPreset(result)?.id).toBe('ocean');
  });

  it('reports a custom style when one field no longer matches', () => {
    const changed = { ...defaultOptions, colors: { ...defaultOptions.colors, link: '#000000' } };
    expect(matchPreset(changed)).toBeUndefined();
  });

  it.each(stylePresets.map((item) => [item.id, item] as const))(
    '%s keeps every color readable on the page',
    (_id, item) => {
      for (const color of Object.values(item.colors)) {
        expect(isHexColor(color)).toBe(true);
        expect(contrastRatio(color, '#fbf7f1')).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(color, '#ffffff')).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it('lists each color once per role', () => {
    expect(presetColors('heading')).toContain('#78351f');
    expect(new Set(presetColors('text')).size).toBe(presetColors('text').length);
  });
});

describe('isHexColor', () => {
  it.each([
    ['#a64f35', true],
    ['#A64F35', true],
    ['a64f35', false],
    ['#a64f3', false],
    ['#a64f35ff', false],
  ])('%s is %s', (value, expected) => {
    expect(isHexColor(value)).toBe(expected);
  });
});
