/*
 * Also imported by scripts/buildCatalog.mjs through Node's type stripping, so this file must keep to
 * erasable TypeScript syntax (no enums, namespaces or parameter properties).
 */
type ManifestIconFields = { slug: string; icon?: unknown };

export function manifestIconError(manifest: ManifestIconFields): string | undefined {
  if (manifest.icon === undefined) return undefined;
  const prefix = `/remotes/${manifest.slug}/`;
  if (
    typeof manifest.icon !== 'string' ||
    !manifest.icon.startsWith(prefix) ||
    !manifest.icon.endsWith('.svg') ||
    manifest.icon.includes('..')
  ) {
    return `icon must be an .svg path under ${prefix}`;
  }
  return undefined;
}
