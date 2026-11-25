import { del, list, put } from '@vercel/blob';

const prefix = 'markdown-to-pdf/';

export async function storePdf(pdf: Uint8Array) {
  const blob = await put(`${prefix}${crypto.randomUUID()}.pdf`, Buffer.from(pdf), {
    access: 'public',
    contentType: 'application/pdf',
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deleteFilesOlderThan(maxAgeMs: number) {
  const expired = [];
  let cursor: string | undefined;
  let hasMore = true;
  while (hasMore) {
    const page = await list({ prefix, cursor });
    expired.push(
      ...page.blobs.filter((blob) => Date.now() - new Date(blob.uploadedAt).getTime() > maxAgeMs),
    );
    cursor = page.cursor;
    hasMore = page.hasMore;
  }
  if (expired.length) await del(expired.map((blob) => blob.url));
}
