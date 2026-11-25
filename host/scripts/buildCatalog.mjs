/*
 * Builds host/public/catalog.json from every tools/<slug>/manifest.json and host/catalog.config.json.
 * Run by the Host's dev and build scripts; the output is generated and gitignored.
 * A tool missing from every vault is left out of the catalog on purpose, so removing its vault entry
 * hides it without a Host code change. A vault entry naming an unknown tool fails the build.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { manifestIconError } from '#/catalog/manifestRules.ts';

const hostDir = path.resolve(import.meta.dirname, '..');
const toolsDir = path.resolve(hostDir, '../tools');
const config = JSON.parse(await readFile(path.join(hostDir, 'catalog.config.json'), 'utf8'));

const manifests = new Map();
for (const entry of await readdir(toolsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(toolsDir, entry.name, 'manifest.json');
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  if (manifest.slug !== entry.name) {
    throw new Error(`${file}: slug "${manifest.slug}" does not match folder "${entry.name}"`);
  }
  const iconError = manifestIconError(manifest);
  if (iconError) throw new Error(`${file}: ${iconError}`);
  manifests.set(manifest.slug, manifest);
}

const tools = [];
const placed = new Set();
for (const vault of config.vaults) {
  for (const slug of vault.tools) {
    const manifest = manifests.get(slug);
    if (!manifest) throw new Error(`Vault "${vault.slug}" lists unknown tool "${slug}"`);
    if (placed.has(slug)) throw new Error(`Tool "${slug}" is listed in more than one vault`);
    placed.add(slug);
    tools.push({ ...manifest, vault: vault.slug });
  }
}

const vaults = config.vaults.map(({ slug, name, description }) => ({ slug, name, description }));
await mkdir(path.join(hostDir, 'public'), { recursive: true });
await writeFile(
  path.join(hostDir, 'public/catalog.json'),
  `${JSON.stringify({ vaults, tools }, null, 2)}\n`,
);

const hidden = [...manifests.keys()].filter((slug) => !placed.has(slug));
process.stdout.write(
  `catalog.json: ${tools.length} tool(s) in ${vaults.length} vault(s)` +
    (hidden.length ? `; not in any vault: ${hidden.join(', ')}` : '') +
    '\n',
);
