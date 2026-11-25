import type { Catalog } from '#/catalog/types.ts';

export async function loadCatalog(): Promise<Catalog> {
  const response = await fetch('/catalog.json');
  if (!response.ok) throw new Error(`catalog.json returned ${response.status}`);
  return response.json();
}
