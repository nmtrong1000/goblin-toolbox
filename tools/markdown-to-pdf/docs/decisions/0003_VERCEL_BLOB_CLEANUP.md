---
id: markdown-to-pdf-adr-0003
status: accepted
date: 2026-11-21
---

# Markdown to PDF ADR 0003: PDFs on Vercel Blob with our own 1-hour cleanup

## Context

The API returns a download URL instead of the PDF bytes, and files must disappear after 1 hour. Vercel Blob has no built-in expiry, and Hobby cron jobs run at most daily.

## Decision

Upload each PDF to a public Blob store under a random name and return `{ url, expiresAt }`. Every PDF request also starts a cleanup that lists the store and deletes files older than 1 hour. A daily Vercel Cron calls the same cleanup as a safety net, protected by `CRON_SECRET`.

## Alternatives

- **Return the PDF bytes directly:** rejected by requirement; also bound by the ~4.5 MB response limit.
- **Private Blob store:** possible (the CLI offers `--access private`) but needs signed or proxied downloads; not needed while names are random and files short-lived.
- **Upstash or a database to track expiry:** rejected; Blob's `uploadedAt` is enough.

## Consequences

- A file can live longer than 1 hour when no requests arrive; the daily cron caps that at about 25 hours.
- Spike 0001: upload 55–140 ms; cron registered and triggered on Hobby.
