import { describe, expect, it } from 'vitest';
import { contrastRatio, isHexColor } from '#/lib/color.ts';

describe('isHexColor', () => {
  it('accepts six-digit hex colors in any case', () => {
    expect(isHexColor('#1d1b18')).toBe(true);
    expect(isHexColor('#ABCDEF')).toBe(true);
  });

  it('rejects short, unprefixed and invalid values', () => {
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor('1d1b18')).toBe(false);
    expect(isHexColor('#12345g')).toBe(false);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
  });

  it('is 1 for the same color', () => {
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });
});
