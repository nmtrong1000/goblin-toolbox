/*
 * Usage: pnpm new-tool <slug>
 * Creates tools/<slug>/ per docs/design/TOOL_CONTRACT.md and docs/design/UI_CONVENTIONS.md
 * (manifest, ui/ remote, api/ service, i18n, tests, README, openapi.yaml), adds the tool's two
 * services and routes to vercel.json and its own lint override to .oxlintrc.json. Putting the tool in a vault stays a manual choice in
 * host/catalog.config.json; until then the catalog leaves the tool out.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const slug = process.argv[2];

if (!slug || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
  process.stderr.write('Usage: pnpm new-tool <slug>  (lowercase kebab-case, e.g. image-resizer)\n');
  process.exit(1);
}
const toolDir = path.join(root, 'tools', slug);
if (existsSync(toolDir)) {
  process.stderr.write(`tools/${slug} already exists\n`);
  process.exit(1);
}

const title = slug
  .split('-')
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join(' ');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const federationName = slug.replaceAll('-', '_');

const files = {
  'README.md': `# ${title}\n\nBelongs to the **<vault>** vault.\n\n## Functional requirements\n\n- \n\n## Non-functional requirements\n\n- \n\n### Runtime configuration\n\n- Function settings: default \`maxDuration\`; no bundled files.\n- Environment variables: none.\n- Cron jobs: none.\n`,
  'manifest.json': json({
    slug,
    name: { en: title, vi: title },
    description: { en: `${title} tool.`, vi: `Công cụ ${title}.` },
    keywords: slug.split('-'),
    remote: `/remotes/${slug}/remoteEntry.js`,
    icon: `/remotes/${slug}/icon.svg`,
  }),
  'ui/public/icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>\n`,
  'docs/openapi.yaml': `openapi: 3.1.0\ninfo:\n  title: ${title} API\n  version: 0.1.0\npaths:\n  /api/tools/${slug}/health:\n    get:\n      summary: Service health\n      responses:\n        '200':\n          description: The service is running.\n`,
  'ui/package.json': json({
    name: `@goblin/tool-${slug}-ui`,
    private: true,
    type: 'module',
    imports: { '#/*': './src/*' },
    scripts: { build: 'vite build', dev: 'vite', typecheck: 'tsc --noEmit' },
    dependencies: {
      i18next: 'catalog:',
      react: 'catalog:',
      'react-dom': 'catalog:',
      'react-i18next': 'catalog:',
      'react-router-dom': 'catalog:',
    },
    devDependencies: {
      '@goblin/ui-kit': 'workspace:*',
      '@module-federation/vite': 'catalog:',
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@vitejs/plugin-react': 'catalog:',
      vite: 'catalog:',
    },
  }),
  'ui/tsconfig.json': json({
    extends: '../../../tsconfig.json',
    compilerOptions: {
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      jsx: 'react-jsx',
      types: ['vite/client'],
    },
    include: ['src', 'tests', 'vite.config.ts'],
  }),
  'ui/vite.config.ts': `import { federation } from '@module-federation/vite';\nimport { federationName, sharedSingletons } from '@goblin/ui-kit/federation';\nimport react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\nconst slug = '${slug}';\n\nexport default defineConfig({\n  base: \`/remotes/\${slug}/\`,\n  plugins: [\n    react(),\n    federation({\n      name: federationName(slug),\n      filename: 'remoteEntry.js',\n      exposes: { './Tool': './src/Tool.tsx' },\n      shared: sharedSingletons,\n      dts: false,\n    }),\n  ],\n  build: { target: 'esnext', outDir: \`dist/remotes/\${slug}\`, emptyOutDir: true },\n});\n`,
  'ui/index.html': `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>${title} remote</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/Tool.tsx"></script>\n  </body>\n</html>\n`,
  'ui/src/Tool.tsx': `import i18n from 'i18next';\nimport en from '#/i18n/en.ts';\nimport vi from '#/i18n/vi.ts';\nimport { ToolPage } from '#/pages/ToolPage.tsx';\n\ni18n.addResourceBundle('en', '${slug}', en, true, true);\ni18n.addResourceBundle('vi', '${slug}', vi, true, true);\n\nexport default function Tool() {\n  return <ToolPage />;\n}\n`,
  'ui/src/pages/ToolPage.tsx': `import { useTranslation } from 'react-i18next';\n\nexport function ToolPage() {\n  const { t } = useTranslation('${slug}');\n  return <p className="${slug}-intro">{t('intro')}</p>;\n}\n`,
  'ui/src/i18n/en.ts': `export default {\n  intro: '${title} is ready to build.',\n};\n`,
  'ui/src/i18n/vi.ts': `export default {\n  intro: '${title} đã sẵn sàng để xây dựng.',\n};\n`,
  'ui/tests/i18n.test.ts': `import { describe, expect, it } from 'vitest';\nimport en from '#/i18n/en.ts';\nimport vi from '#/i18n/vi.ts';\n\ndescribe('locale resources', () => {\n  it('provides every English key in Vietnamese', () => {\n    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());\n  });\n\n  it('has no empty strings', () => {\n    for (const value of [...Object.values(en), ...Object.values(vi)]) {\n      expect(value.trim()).not.toBe('');\n    }\n  });\n});\n`,
  'api/package.json': json({
    name: `@goblin/tool-${slug}-api`,
    private: true,
    type: 'module',
    imports: { '#/*': './src/*' },
    scripts: { dev: 'tsx watch src/devServer.ts', typecheck: 'tsc --noEmit' },
    dependencies: { '@goblin/server-kit': 'workspace:*', express: 'catalog:' },
    devDependencies: {
      '@types/express': 'catalog:',
      '@types/supertest': 'catalog:',
      supertest: 'catalog:',
      tsx: 'catalog:',
    },
  }),
  'api/tsconfig.json': json({
    extends: '../../../tsconfig.json',
    compilerOptions: { types: ['node'] },
    include: ['src', 'tests'],
  }),
  'api/src/index.ts': `import { createApp } from '@goblin/server-kit';\nimport tool from '#/routes/tool.ts';\n\nconst app = createApp({\n  slug: '${slug}',\n  routes: [{ path: '/api/tools/${slug}', router: tool }],\n});\n\nexport default app;\n`,
  'api/src/devServer.ts': `import app from '#/index.ts';\n\nconst port = Number(process.env.PORT ?? 3000);\n\napp.listen(port, '0.0.0.0', () => {\n  process.stdout.write(\`API listening on http://localhost:\${port}\\n\`);\n});\n`,
  'api/src/routes/tool.ts': `import { Router } from 'express';\n\nconst router: Router = Router();\n\nexport default router;\n`,
  'api/tests/app.test.ts': `import request from 'supertest';\nimport { describe, expect, it } from 'vitest';\nimport app from '#/index.ts';\n\ndescribe('${title} API', () => {\n  it('returns its health', async () => {\n    const response = await request(app).get('/api/tools/${slug}/health');\n\n    expect(response.status).toBe(200);\n    expect(response.body).toEqual({ status: 'ok', service: '${slug}' });\n  });\n});\n`,
};

for (const [file, content] of Object.entries(files)) {
  const target = path.join(toolDir, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

const vercelPath = path.join(root, 'vercel.json');
const vercel = JSON.parse(await readFile(vercelPath, 'utf8'));
vercel.services[`${slug}-ui`] = {
  root: `tools/${slug}/ui`,
  framework: 'vite',
  buildCommand: 'pnpm build',
  outputDirectory: 'dist',
  headers: [
    {
      source: `/remotes/${slug}/assets/(.*)`,
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
};
vercel.services[`${slug}-api`] = {
  root: `tools/${slug}/api`,
  framework: 'express',
  entrypoint: 'src/index.ts',
  devCommand: 'pnpm dev',
};
const catchAll = vercel.rewrites.findIndex((rule) => rule.source === '/(.*)');
vercel.rewrites.splice(
  catchAll,
  0,
  { source: `/api/tools/${slug}`, destination: { service: `${slug}-api` } },
  { source: `/api/tools/${slug}/(.*)`, destination: { service: `${slug}-api` } },
  { source: `/remotes/${slug}/(.*)`, destination: { service: `${slug}-ui` } },
);
await writeFile(vercelPath, json(vercel));

const lintPath = path.join(root, '.oxlintrc.json');
const lint = JSON.parse(await readFile(lintPath, 'utf8'));
const relative = {
  regex: '^\\.\\.?/',
  message: 'Use a #/ subpath import inside a package, or the package name across packages.',
};
lint.overrides.push({
  files: [`tools/${slug}/**`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          relative,
          {
            group: [
              '@goblin/tool-*',
              '@goblin/tool-*/**',
              `!@goblin/tool-${slug}-*`,
              `!@goblin/tool-${slug}-*/**`,
            ],
            message: 'A tool never imports another tool; move shared code to packages/.',
          },
        ],
      },
    ],
  },
});
await writeFile(lintPath, json(lint));

execFileSync(
  path.join(root, 'node_modules/.bin/prettier'),
  ['--write', '--log-level', 'warn', toolDir, vercelPath, lintPath],
  { stdio: 'inherit' },
);

process.stdout.write(
  [
    `Created tools/${slug} (federation name ${federationName}).`,
    'Updated vercel.json (services and routes) and .oxlintrc.json (lint override).',
    'Next:',
    '  1. pnpm install',
    `  2. Add "${slug}" to a vault in host/catalog.config.json`,
    '  3. Fill in the README, manifest texts and openapi.yaml',
    '  4. pnpm start, then open /tools/' + slug,
    '',
  ].join('\n'),
);
