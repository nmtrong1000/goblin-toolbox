import { useContext } from 'react';
import { CatalogContext } from '#/catalog/catalogContext.ts';

export function useCatalog() {
  return useContext(CatalogContext);
}
