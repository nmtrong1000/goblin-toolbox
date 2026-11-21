import { describe, expect, it } from 'vitest';
import en from '#/i18n/locales/en/common.json';
import vi from '#/i18n/locales/vi/common.json';

describe('locale resources', () => {
  it('provides every English key in Vietnamese', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });
});
