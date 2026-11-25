/*
 * Module Federation shared singletons for the Host and every tool remote. Both sides must pass this
 * same object, or a remote loads its own copy of React or i18next and hooks break at runtime.
 * requiredVersion repeats the pnpm catalog in pnpm-workspace.yaml; change both together.
 */
export const sharedSingletons = {
  react: { singleton: true, requiredVersion: '^19.1.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.1.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.6.2' },
  i18next: { singleton: true, requiredVersion: '^25.2.1' },
  'react-i18next': { singleton: true, requiredVersion: '^15.5.2' },
};

export function federationName(slug: string) {
  return slug.replaceAll('-', '_');
}
