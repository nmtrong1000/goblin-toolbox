import { describe, expect, it } from 'vitest';
import { stepZoom } from '#/lib/zoom.ts';

describe('stepZoom', () => {
  it('steps from fit to the next level around the fit scale', () => {
    expect(stepZoom('fit', 0.8, 1)).toBe(1);
    expect(stepZoom('fit', 0.8, -1)).toBe(0.75);
  });

  it('moves between fixed levels', () => {
    expect(stepZoom(1, 0.8, 1)).toBe(1.25);
    expect(stepZoom(1, 0.8, -1)).toBe(0.75);
  });

  it('stays at the ends of the range', () => {
    expect(stepZoom(1.5, 0.8, 1)).toBe(1.5);
    expect(stepZoom(0.5, 0.8, -1)).toBe(0.5);
  });
});
