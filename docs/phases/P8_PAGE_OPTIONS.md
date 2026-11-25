# Phase 8: PDF page options

**Goal:** Give Markdown to PDF the page controls deferred from [Phase 7](./P7_TOOL_UI.md): page number position and format, per-side margins, and a Theme option with a visible effect. The options schema grows by optional fields with defaults, so existing requests stay valid.

**Complexity:** medium. Touches the shared options schema, the API renderer, the preview and the UI.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| P1 | Schema and contract | Add `pageNumberPosition` (`left`, `center`, `right`; default `center`), `pageNumberFormat` (`current-total`, `current`; default `current-total`) and optional `customMargins` (`top`, `right`, `bottom`, `left` in mm, 0–50) to `optionsSchema`; `customMargins` overrides `margin`. A shared `pageMarginsMm(options)` gives the four margins for the API and the preview. Update `openapi.yaml`. | — | [x] |
| P2 | API | Footer template from position and format, aligned to the page margins; per-side PDF margins; the `theme` values become densities (`default` = Comfortable, `classic` = Compact) with a visible difference in size and spacing. Page setup moves into a pure, tested module. | P1 | [x] |
| P3 | Preview | Per-side margins and the same density rules as the PDF. | P1 | [x] |
| P4 | UI | With "Show page numbers" on, a Position control (left, center, right) and a Format control (`1 / 7`, `1`), plus a note that numbers appear in the PDF. Advanced gains Margins with four mm inputs; editing them shows Custom in the Page margin control, and picking a margin preset clears them. Theme becomes "Density: Comfortable / Compact". | P1 | [x] |
| P5 | Tests and docs | Schema defaults and limits, page setup (footer, margins, density), i18n parity, Playwright for the new controls and the request body; tool README, `UI.md`. | P2–P4 | [x] |
| P6 | Deploy | Preview deployment; production after HUMAN REVIEW. | P5 | [ ] |

## Design

| Rule | Value |
|---|---|
| Margin presets | narrow 10 mm, normal 20 mm, wide 25 mm on every side (unchanged) |
| Custom margins | whole or decimal mm, 0–50 per side; page numbers need a bottom margin of about 10 mm to show |
| Footer | 8 px text, aligned left, center or right inside the left and right margins; `current-total` prints `n / total`, `current` prints `n` |
| Comfortable (`default`) | 12 pt text, line height 1.7, paragraph gap 1 em, heading gaps as today |
| Compact (`classic`) | 10.5 pt text, line height 1.4, paragraph and list gap 0.6 em, headings 0.9 em above and 0.4 em below, table cells 4 px, code 8 px padding |

The preview is one continuous page, so page numbers are not drawn there; the Page section says they appear in the PDF.

## Test

- Automated, once: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:ui`, `pnpm build`.
- A request without the new fields is still valid and gets the defaults; out-of-range margins return `400 INVALID_REQUEST`.
- The UI sends position, format and custom margins; picking a margin preset drops `customMargins`.
- Manual (user): PDFs with each position and format, custom margins, and Comfortable vs Compact.

## Review

- [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), with extra attention to the Node.js section and the OpenAPI contract.

## AC

- Page numbers can sit left, center or right, as `n / total` or `n`.
- Each margin can be set in mm and the preview matches the PDF.
- Comfortable and Compact look clearly different.
- Old requests keep working; docs and contract match the code.

## Deviations from the plan

- HUMAN REVIEW round 1: the user asked for a mobile menu in the Host masthead, outside this phase's page-option scope. On phones the brand now sits next to a menu button that opens a panel with the nav and the language toggle (see [DESIGN.md](../design/DESIGN.md), Navigation).
- The UI does not yet warn when the bottom margin is too small for page numbers (about 10 mm); the limit is documented in `openapi.yaml`.
