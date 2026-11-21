# Markdown to PDF

Belongs to the **Document Tools** vault. The tool only outputs PDF.

## Functional requirements

- Editor and live preview, split side by side on desktop.
- Input by typing/pasting or uploading a `.md` file.
- A button to reformat the Markdown in the editor.
- Supports basic Markdown/GFM, syntax highlighting per language, Mermaid, math formulas and images from public URLs.
- Inline HTML through an allowlist (e.g. `<sup>`, `<sub>`, `<kbd>`, `<br>`); tags outside the allowlist and scripts are removed.
- Download PDF; choose page size, orientation, margins, page numbers (on/off), font and theme. Fonts must fully support Vietnamese.
- Adjust text, heading and link colors and the heading style (H1–H3).
- The PDF matches the preview.
- The API accepts JSON with Markdown and options, generates the PDF and returns a download URL; the file is deleted after 1 hour.
- The API needs no authentication; it has a basic rate limit.

## Non-functional requirements

Set during Phase 3, task M0.1, using the measurements in [the Vercel Chromium spike](docs/spikes/0001_CHROMIUM_ON_VERCEL.md) and the shared requirements in [docs/design/NFR.md](../../docs/design/NFR.md).

## Design

Design documents are in this package's `docs/` directory (Phase 1):

| Document | Content |
|---|---|
| [openapi.yaml](docs/openapi.yaml) | API contract |
| [TECH_STACK.md](docs/TECH_STACK.md) | libraries the tool adds |
| [decisions/](docs/decisions/) | tool decisions |
