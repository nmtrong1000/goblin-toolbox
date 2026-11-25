/*
 * Usage: pnpm generate-contracts (also run by the Host's dev and build scripts)
 * Renders every tools/<slug>/docs/openapi.yaml into host/public/contracts/<slug>.html with Redocly,
 * served at /contracts/<slug>.html. The output is generated and gitignored. --inlineBundle embeds
 * the Redoc script so the page loads nothing from Redocly's CDN. Tools without an openapi.yaml are
 * skipped.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

const hostDir = path.resolve(import.meta.dirname, '..');
const toolsDir = path.resolve(hostDir, '../tools');
const outputDir = path.join(hostDir, 'public/contracts');
const redocly = path.join(hostDir, 'node_modules/.bin/redocly');

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const generated = [];
for (const entry of await readdir(toolsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const spec = path.join(toolsDir, entry.name, 'docs/openapi.yaml');
  if (!existsSync(spec)) continue;
  const manifest = JSON.parse(
    await readFile(path.join(toolsDir, entry.name, 'manifest.json'), 'utf8'),
  );
  execFileSync(
    redocly,
    [
      'build-docs',
      spec,
      '--output',
      path.join(outputDir, `${entry.name}.html`),
      '--title',
      `${manifest.name.en} API contract`,
      '--inlineBundle',
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
  generated.push(entry.name);
}

process.stdout.write(`Generated ${generated.length} API contract(s): ${generated.join(', ')}\n`);
