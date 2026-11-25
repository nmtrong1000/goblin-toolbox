import { useContext } from 'react';
import { CatalogContext } from '#/catalog/catalog-context.ts';

export function useCatalog() {
  return useContext(CatalogContext);
}
