import { describe, expect, it } from 'vitest';
import en from '#/i18n/en.ts';
import vi from '#/i18n/vi.ts';

describe('locale resources', () => {
  it('provides every English key in Vietnamese', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });

  it('has no empty strings', () => {
    for (const value of [...Object.values(en), ...Object.values(vi)]) {
      expect(value.trim()).not.toBe('');
    }
  });
});
