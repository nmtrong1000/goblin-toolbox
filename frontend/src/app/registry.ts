import type { ComponentType, LazyExoticComponent } from 'react';

export type ToolDefinition = {
  component: LazyExoticComponent<ComponentType>;
  slug: string;
  vault: string;
  nameKey: string;
  descriptionKey: string;
  keywords: string[];
};

export type VaultDefinition = {
  slug: string;
  nameKey: string;
  descriptionKey: string;
};

export const tools: ToolDefinition[] = [];
export const vaults: VaultDefinition[] = [];
