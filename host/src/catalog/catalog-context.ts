import { createContext } from 'react';
import type { Catalog } from '#/catalog/types.ts';

export const CatalogContext = createContext<Catalog>({ vaults: [], tools: [] });
