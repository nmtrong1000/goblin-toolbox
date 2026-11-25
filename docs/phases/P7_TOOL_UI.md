# Phase 7: Markdown to PDF UI

**Goal:** Make the Markdown to PDF tool more inviting to use: a grouped settings panel, visual controls in place of native selects and color inputs, drag and drop, and clear feedback while a PDF is made. The API, renderer, options schema, limits and error codes do not change.

**Complexity:** medium. Depends on Phase 6 (tokens and motion).

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| T1 | Layout | Toolbar with icons (Upload, Reformat, Create PDF). Options move into a "Document settings" panel with four groups: Page, Typography, Colors, Extras. Desktop: a collapsible side panel next to the editor and preview; mobile: a bottom sheet. | — | [ ] |
| T2 | Visual choice controls | Page size as cards with a to-scale paper thumbnail; orientation, margin, font and heading style as segmented controls with icons; theme as cards with a mini preview. Built on real radio inputs inside `fieldset`/`legend`. | T1 | [ ] |
| T3 | Color picker | Preset swatches, a hex input and a custom button that opens the native picker; ready-made palettes that set text, heading and link colors in one click. | T1 | [ ] |
| T4 | Feedback | Page numbers as a toggle switch; Create PDF shows a spinner while rendering and a check when done; errors appear as an animated toast with `role="alert"`. | T1 | [ ] |
| T5 | Drag and drop | Drop a `.md` file on the editor to open it, with a drop overlay; same validation as Upload. | T1 | [ ] |
| T6 | Preview | Paper shadow, smooth change when options change, a badge with the current page size and orientation. | T2 | [ ] |
| T7 | Tests and docs | Rewrite `tool.e2e.ts` for the new controls; i18n parity; tool design in `docs/design/tools/markdown-to-pdf/`; tool README. | T1–T6 | [ ] |
| T8 | Deploy | Preview deployment with the full test list; production after HUMAN REVIEW. | T7 | [ ] |

## Test

- Automated: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:ui`, `pnpm build`.
- Every option still reaches the PDF: change each one, download, check the PDF.
- Keyboard: arrow keys move inside each radio group; the color picker, toggle and panel collapse work without a mouse; screen reader names for every control.
- Drag and drop: a `.md` file opens; another file type shows the invalid-file error.
- Reduced motion turns off panel, toast and preview animations.
- Desktop and mobile, `en` and `vi`.

## Review

- [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), with extra attention to the React.js section and the Styles rule in [TOOL_CONTRACT.md](../design/TOOL_CONTRACT.md).

## AC

- No native `<select>` or bare color input is left in the tool; every option is reachable by keyboard.
- API and PDF output are unchanged for the same options.
- Docs match the code; production runs the new tool UI.

## Output

- New Markdown to PDF UI in production; tool design document.
