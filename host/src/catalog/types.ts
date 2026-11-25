export type Localized = { en: string; vi: string };

export type CatalogVault = { slug: string; name: Localized; description: Localized };

export type CatalogTool = {
  slug: string;
  vault: string;
  name: Localized;
  description: Localized;
  keywords: string[];
  remote: string;
};

export type Catalog = { vaults: CatalogVault[]; tools: CatalogTool[] };
