# Markdown to PDF ADR 0002: One Markdown Renderer for preview and PDF

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The PDF must match the preview. Two renderers (one in the browser, one on the server) would drift.

## Decision

`tools/markdown-to-pdf/src/renderer/` is the only Markdown → HTML implementation. It is built once into a browser bundle plus theme CSS and fonts in `tools/markdown-to-pdf/assets/`. The tool's UI imports it for the preview; the PDF Renderer loads the same bundle into Chromium from `file://`. The options schema lives in `src/shared/` of the same package so the UI and API validate the same way.

Rendering rules fixed by the spike: sanitize only user-written HTML tokens; Mermaid validated with `parse()` and rendered in strict mode with a pinned font; the render resolves only after fonts, images and diagrams are done.

## Alternatives

- **Client sends rendered HTML to the server:** rejected; the server would have to trust client HTML, and API clients would need their own renderer.
- **Server-side Markdown parser in Node.js plus browser preview:** rejected; two implementations drift.

## Consequences

- Preview and PDF matched within 0.2–2.5 % differing pixels on the spike fixtures, all anti-aliasing.
- The bundle is large (~6.5 MB minified, mostly Mermaid); the frontend should load it lazily on the tool page.
