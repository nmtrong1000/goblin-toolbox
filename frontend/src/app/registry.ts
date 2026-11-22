import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

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

export const tools: ToolDefinition[] = [
  {
    component: lazy(() => import('@goblin/tool-markdown-to-pdf/ui')),
    slug: 'markdown-to-pdf',
    vault: 'document-tools',
    nameKey: 'tool.markdownToPdf.name',
    descriptionKey: 'tool.markdownToPdf.description',
    keywords: ['markdown', 'pdf', 'document', 'convert'],
  },
];
export const vaults: VaultDefinition[] = [
  {
    slug: 'document-tools',
    nameKey: 'vault.documentTools.name',
    descriptionKey: 'vault.documentTools.description',
  },
];
