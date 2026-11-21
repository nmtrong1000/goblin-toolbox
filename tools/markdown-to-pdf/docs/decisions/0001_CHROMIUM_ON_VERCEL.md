# Markdown to PDF ADR 0001: Chromium on Vercel with `@sparticuz/chromium`

- **Status:** accepted
- **Date:** 2026-11-21

## Context

PDFs must match the preview, which is HTML rendered by a browser, and must support Mermaid and KaTeX, which need a JavaScript-capable browser engine. The target is Vercel Hobby.

## Decision

Generate PDFs with `puppeteer-core` driving `@sparticuz/chromium` inside the API's Vercel Function (2048 MB, `maxDuration` 60 s). Reuse one browser per instance, relaunch it when disconnected, and use one page per request. Locally, drive the installed Chrome (same major version as far as possible); CI on Linux uses the exact production `@sparticuz/chromium`.

## Alternatives

- **Typst (server + WASM preview) with Kroki for Mermaid:** rejected; too many moving parts and an external service for diagrams.
- **WeasyPrint:** rejected; no JavaScript, so Mermaid and KaTeX need pre-rendering, and preview fidelity is approximate.
- **External rendering service:** rejected; cost and dependency for a core feature.

## Consequences

- Spike 0001: bundle 72.51 MB, cold request ~4.5 s, warm ~1–2.4 s, 320–480 MB system memory.
- Cold starts are slow (Chromium launch ~2.6–2.9 s); acceptable for the MVP and to be reflected in the tool's NFRs.
- Local (macOS Chrome) and production (Linux Chromium) differ slightly; the preview-vs-PDF match test runs in CI on Linux.
