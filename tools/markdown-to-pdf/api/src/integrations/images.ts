import dns from 'node:dns';
import { randomUUID } from 'node:crypto';
import ipaddr from 'ipaddr.js';
import { Agent, request } from 'undici';

const imagePattern = /!\[([^\]]*)\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/g;
const maxImageBytes = 5 * 1024 * 1024;
const maxTotalBytes = 3 * 1024 * 1024;
const maxImages = 10;
const maxDiagrams = 10;

export async function prepareImages(markdown: string) {
  const code: Array<[string, string]> = [];
  let source = markdown.replace(
    /(^|\n)( {0,3})(`{3,}|~{3,})[^\n]*(?:\n|$)[\s\S]*?(?:^|\n)\2(?:`{3,}|~{3,})[ \t]*(?:\n|$)/gm,
    (value) => maskCode(value, code),
  );
  source = source.replace(/(?:^|\n)(?: {4}|\t)[^\n]*(?=\n|$)/g, (value) => maskCode(value, code));
  source = source.replace(/(`+)[\s\S]*?\1/g, (value) => maskCode(value, code));
  const images = [...source.matchAll(imagePattern)];
  if (images.length > maxImages) throw new Error('TOO_MANY_ASSETS');
  if ([...source.matchAll(/```\s*mermaid\b/gi)].length > maxDiagrams)
    throw new Error('TOO_MANY_ASSETS');
  const deadline = Date.now() + 15_000;
  let totalBytes = 0;
  let prepared = source;
  for (const match of images.reverse()) {
    const url = match[2] ?? match[3];
    if (!url) continue;
    let replacement = `![${match[1]}](blocked-image:)`;
    try {
      const image = await fetchPublicImage(url, deadline);
      totalBytes += image.bytes.length;
      if (totalBytes > maxTotalBytes) throw new Error('TOO_MANY_ASSETS');
      replacement = `![${match[1]}](data:${image.type};base64,${image.bytes.toString('base64')})`;
    } catch (error) {
      if (error instanceof Error && error.message === 'TOO_MANY_ASSETS') throw error;
    }
    const start = match.index ?? 0;
    prepared = `${prepared.slice(0, start)}${replacement}${prepared.slice(start + match[0].length)}`;
  }
  for (const [placeholder, value] of code) prepared = prepared.replace(placeholder, value);
  return prepared;
}

function maskCode(value: string, code: Array<[string, string]>) {
  const placeholder = `MDPDFCODE${randomUUID()}TOKEN`;
  code.push([placeholder, value]);
  return placeholder;
}

async function fetchPublicImage(value: string, deadline: number) {
  let url = new URL(value);
  for (let redirect = 0; redirect <= 4; redirect += 1) {
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      !['', '80', '443'].includes(url.port)
    ) {
      throw new Error('Blocked image URL');
    }
    const dispatcher = new Agent({ connect: { lookup: publicLookup as never } });
    try {
      const result = await request(url, {
        dispatcher,
        headers: { 'user-agent': 'GoblinToolbox-ImageFetcher/1.0' },
        signal: AbortSignal.timeout(Math.max(1, Math.min(5000, deadline - Date.now()))),
      });
      if ([301, 302, 303, 307, 308].includes(result.statusCode)) {
        const location = result.headers.location;
        await result.body.dump();
        if (typeof location !== 'string' || redirect === 4)
          throw new Error('Redirect limit exceeded');
        url = new URL(location, url);
        continue;
      }
      if (result.statusCode !== 200) throw new Error('Image request failed');
      const typeHeader = result.headers['content-type'];
      const type =
        typeof typeHeader === 'string' ? typeHeader.split(';')[0].trim().toLowerCase() : '';
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'].includes(type)) {
        throw new Error('Response is not a supported image');
      }
      const length = Number(result.headers['content-length'] ?? 0);
      if (length > maxImageBytes) throw new Error('Image is too large');
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of result.body) {
        const buffer = Buffer.from(chunk);
        size += buffer.length;
        if (size > maxImageBytes) throw new Error('Image is too large');
        chunks.push(buffer);
      }
      return { bytes: Buffer.concat(chunks), type };
    } finally {
      await dispatcher.close();
    }
  }
  throw new Error('Redirect limit exceeded');
}

function publicLookup(
  hostname: string,
  options: { all?: boolean },
  callback: (
    error: NodeJS.ErrnoException | null,
    address: string | dns.LookupAddress[],
    family?: number,
  ) => void,
) {
  dns.lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
    if (error) {
      callback(error, '');
      return;
    }
    if (
      !addresses.length ||
      addresses.some((address) => ipaddr.parse(address.address).range() !== 'unicast')
    ) {
      callback(Object.assign(new Error('Blocked IP address'), { code: 'EACCES' }), '');
      return;
    }
    if (options.all) callback(null, addresses);
    else callback(null, addresses[0].address, addresses[0].family);
  });
}
