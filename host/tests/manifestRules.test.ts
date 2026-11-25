import { describe, expect, it } from 'vitest';
import { manifestIconError } from '#/catalog/manifestRules.ts';

describe('manifestIconError', () => {
  it('accepts a manifest without an icon', () => {
    expect(manifestIconError({ slug: 'demo' })).toBeUndefined();
  });

  it("accepts an svg served by the tool's own remote", () => {
    expect(manifestIconError({ slug: 'demo', icon: '/remotes/demo/icon.svg' })).toBeUndefined();
  });

  it.each([
    ['another tool', '/remotes/other/icon.svg'],
    ['an external URL', 'https://example.com/icon.svg'],
    ['a raster image', '/remotes/demo/icon.png'],
    ['a parent path', '/remotes/demo/../other/icon.svg'],
    ['a non-string', 42],
  ])('rejects %s', (_case, icon) => {
    expect(manifestIconError({ slug: 'demo', icon })).toMatch(/\/remotes\/demo\//);
  });
});
