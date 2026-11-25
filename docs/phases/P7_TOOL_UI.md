# Phase 7: Markdown to PDF UI

**Goal:** Make the Markdown to PDF tool inviting to use: one-click document style presets with advanced settings behind them, visual page controls, a styled editor, drag and drop, and clear feedback while a PDF is made. The API, renderer, options schema, limits and error codes do not change.

**Complexity:** medium. Builds on [Phase 6](./P6_HOST_UI.md) (tokens, motion, icons).

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| T1 | Layout | Toolbar with icons (Upload, Reformat, Settings, Create PDF). Settings opens a 300 px "Document settings" drawer from the left over the editor, so the preview stays visible while styling; editor and preview use the full width when it is closed. A bottom sheet on mobile. | — | [x] |
| T2 | Style presets | Ten document styles, each setting font, theme, heading style and the text, heading and link colors, shown as cards with a mini page. The first preset matches today's defaults. Picking a card sets all six options at once. | T1 | [x] |
| T3 | Advanced settings | A collapsible "Advanced" section to change each preset field: font, heading style and theme as segmented controls, and a color picker per color (preset swatches, hex input, native picker). Any change marks the style as "Custom". | T2 | [x] |
| T4 | Page controls | Page size as cards with a to-scale paper thumbnail; orientation and margins as segmented controls with icons; page numbers as a toggle switch. Built on real radio and checkbox inputs inside `fieldset`/`legend`. | T1 | [x] |
| T5 | Feedback | Create PDF shows a spinner while rendering and a check when done; errors appear as an animated toast with `role="alert"`. | T1 | [x] |
| T6 | Drag and drop | Drop a `.md` file on the editor to open it, with a drop overlay; same validation as Upload. | T1 | [x] |
| T7 | Preview | A wider preview column (editor : preview = 5 : 7); Fit-to-width by default with zoom steps 50–150 % and a scrolling well; print-style paper shadow; the page resizes smoothly; a badge shows the size and orientation. | T4 | [x] |
| T8 | Editor | A CodeMirror theme in the Goblin palette (headings, emphasis, links, code, quotes), a clear active line, and an editor header with a character count against the 100,000 limit. | T1 | [x] |
| T9 | Tests and docs | Rewrite `tool.e2e.ts` for the new controls; unit tests for presets and color helpers; i18n parity; tool design in `docs/design/tools/markdown-to-pdf/UI.md`; tool README. | T1–T8 | [x] |
| T10 | Deploy | Preview deployment with the full test list; production after HUMAN REVIEW. | T9 | [ ] |

## Test

- Automated: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:ui`, `pnpm build`.
- Every preset and every advanced option reaches the API request; the PDF matches the preview.
- Presets: picking one sets all six fields; changing an advanced field shows "Custom".
- Keyboard: arrow keys move inside each radio group; the color picker, toggle, Advanced section and settings drawer work without a mouse; every control has an accessible name.
- Contrast: each preset's text, heading and link colors reach 4.5:1 on the page color.
- Drag and drop: a `.md` file opens; another file type shows the invalid-file error.
- Reduced motion follows the Phase 6 decision: small feedback stays on; the bottom sheet fades instead of sliding.
- Desktop and mobile, `en` and `vi`.

## Review

- [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), with extra attention to the React.js section and the Styles rule in [TOOL_CONTRACT.md](../design/TOOL_CONTRACT.md).

## AC

- No native `<select>` or bare color input is left in the tool; every option is reachable by keyboard.
- API and PDF output are unchanged for the same options.
- Docs match the code; production runs the new tool UI.

## Output

- New Markdown to PDF UI in production; tool UI design document.

## Decisions

- Settings layout (DESIGN): a 300 px drawer over the editor, opened from a Settings button next to Reformat, so the preview stays visible while styling; the first design's permanent side panel took too much room.
- Preview size (DESIGN): editor and preview at 5 : 7, Fit-to-width by default, zoom 50–150 %.
- Editor (HUMAN REVIEW round 1): long lines wrap instead of scrolling sideways.
- Preview scrolling (HUMAN REVIEW round 2): the paper itself scrolls, vertically and horizontally; the area around it does not.

## Deviations from the plan

- YAML frontmatter rendering was added to the shared renderer at the user's request (HUMAN REVIEW round 2), so it changes the PDF as well as the preview. It is the only change outside `tools/markdown-to-pdf/ui` besides the Host fix below.
- Host: page transitions now animate the root view-transition group instead of a named `<main>`, because a named `<main>` formed a stacking context that kept the tool's mobile sheet under the sticky masthead.
- Local development keeps a copy of the renderer bundle in `tools/markdown-to-pdf/api/assets/` that only `pnpm --filter @goblin/tool-markdown-to-pdf-api build` refreshes; after changing the shared renderer, run it before checking PDFs locally. Deployments always rebuild it.
- The CodeMirror Markdown mode still colors frontmatter lines as a heading in the editor; only the preview and PDF treat it as frontmatter.
- Moved to Phase 8 at the user's decision (HUMAN REVIEW, after round 2): page number position (left, center, right) and format (`current / total` or `current`); per-side margins (top, right, bottom, left) under Advanced; reworking or removing the Default / Classic theme option, which today only changes line height (1.7 vs 1.55). These change the API options schema, so they need their own plan.
