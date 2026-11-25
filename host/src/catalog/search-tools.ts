import type { CatalogTool, Localized } from '#/catalog/types.ts';

export function searchTools(
  tools: CatalogTool[],
  query: string,
  localize: (text: Localized) => string,
) {
  const normalized = query.trim().toLocaleLowerCase();
  return tools.filter((tool) => {
    const searchable = `${localize(tool.name)} ${localize(tool.description)} ${tool.keywords.join(' ')}`;
    return searchable.toLocaleLowerCase().includes(normalized);
  });
}
