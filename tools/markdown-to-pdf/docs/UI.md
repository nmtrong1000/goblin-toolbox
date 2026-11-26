# Markdown to PDF: UI design

How the tool's UI remote looks and behaves. Shared visual rules are in [DESIGN.md](../../../docs/design/DESIGN.md); code layout follows [UI_CONVENTIONS.md](../../../docs/design/UI_CONVENTIONS.md). Requirements, the options schema and limits are in the tool's [README](../README.md).

Mockup (desktop interactive, mobile settings sheet, states): https://claude.ai/artifact/4Yt6bryqfPQxJ3JURqwNA7

## Layout

| Area | Desktop (> 900 px) | Mobile |
|---|---|---|
| Toolbar | Upload .md, Reformat and **Settings** (secondary, with icons) on the left; Create PDF (primary) on the right. Settings shows the active preset name (or Custom) and is pressed while the drawer is open | Upload and a settings button; Create PDF sits at the bottom of the settings sheet and in the toolbar |
| Settings | "Document settings" drawer, 300 px, slides in from the left **over the editor** and spans the workspace height; the preview stays visible so every change shows at once. Closed by default; closed with X, Escape or the Settings button | Bottom sheet over a dimmed page, opened from the settings button, closed with X, Escape or the backdrop |
| Editor and preview | Side by side at 5 : 7 so the page reads at a useful size, always using the full width | Editor / Preview switch, as today |

## Document settings

Three sections, top to bottom.

1. **Style**: ten preset cards in two columns. A card shows a mini page drawn with the preset's heading, text and link colors, an "Aa" sample in its font, and an underline under the heading bar when the preset underlines headings. A badge shows the active preset's name, or **Custom**.
2. **Page**: page size cards with a to-scale paper thumbnail (swaps with orientation); orientation and margins as segmented controls with icons; page numbers as a switch. With page numbers on, a Position control (left, center, right) and a Format control (`1 / 7`, `1`) appear, with a note that numbers show in the PDF only (the preview is one continuous page). When custom margins are set, no margin preset is selected; picking one clears them.
3. **Advanced** (collapsed by default, "Fine-tune the style"): font (Sans / Serif), headings (Plain / Underline), density (Comfortable / Compact, the `theme` option), margins in mm for top, right, bottom and left (0–50), and one color row each for text, heading and link: a swatch button, the hex value, and a popover with the ten presets' colors for that role plus a custom button that opens the native color picker. The hex field accepts `#rrggbb` only.

### Presets

A preset sets the six style fields of `PdfOptions`: `font`, `theme`, `headingStyle` and `colors.text`, `colors.heading`, `colors.link`. Page fields are never touched by a preset.

| Preset | Font | Theme | Headings | Text | Heading | Link |
|---|---|---|---|---|---|---|
| Goblin (default) | Sans | Default | Plain | `#1d1b18` | `#78351f` | `#a64f35` |
| Classic | Serif | Classic | Underline | `#222222` | `#1d1b18` | `#8b2e1f` |
| Ocean | Sans | Default | Plain | `#14232e` | `#0f4c75` | `#1a6aa0` |
| Forest | Serif | Default | Underline | `#1c2419` | `#2f5d34` | `#38703a` |
| Plum | Serif | Default | Plain | `#241a26` | `#5b2a63` | `#7e3a83` |
| Mono | Sans | Classic | Underline | `#111111` | `#111111` | `#4a4a4a` |
| Newsprint | Serif | Classic | Underline | `#1a1a1a` | `#1a1a1a` | `#8b1e1e` |
| Midnight | Sans | Default | Underline | `#10162a` | `#1f3a8a` | `#2f4bc0` |
| Terracotta | Serif | Classic | Plain | `#2a1d17` | `#8f3a1f` | `#a8461f` |
| Slate | Sans | Classic | Plain | `#1f2933` | `#334e68` | `#3e5c7a` |

- Goblin equals `defaultOptions`, so a fresh tool shows Goblin selected.
- Every color reaches at least 5.1:1 on both the preview page (`#fbf7f1`) and white; a unit test keeps it at 4.5:1 or more.
- The active preset is **derived**, not stored: it is the preset whose six fields equal the current options, or none (Custom). Changing any Advanced field to a value that matches no preset shows Custom; changing it back re-selects the preset.

## Editor

- Header bar: file icon, "Markdown", and `count / 100,000` characters; the count turns accent at 90 % of the limit.
- Long lines wrap; the editor never scrolls sideways.
- The active line background is translucent so a selection on that line stays visible; the focused selection is clay at 30 %.
- A CodeMirror theme in the Goblin palette: heading marks soft clay, heading text `accent-dark` and semibold, list markers `accent`, links `olive`, URLs `ink-soft`, quotes italic `ink-soft`, inline and fenced code on `paper-deep`; line numbers in `rule`; the active line on `paper` with a 2 px accent bar.
- Dropping a file on the editor shows an overlay ("Drop your .md file to open it") with a dashed accent border. A non-`.md` file shows the invalid-file toast.

## Preview

- The page keeps today's exact layout math (`lib/pageLayout.ts`) and gets a 1 px ink border and a `5px 5px 0` ink shadow on a `paper-deep` well.
- The page is laid out at its real size and scaled. **Fit** (default) scales it to the preview width; zoom buttons in the preview header (`−`, the current level, `+`) step through 50, 75, 100, 125 and 150 %, and pressing the level returns to Fit. The chosen zoom is kept while editing.
- The **paper itself scrolls**, vertically and horizontally, inside the preview area; the area around it never scrolls. The paper reserves its scrollbar gutter so the fit size does not jump when a scrollbar appears.
- The page height follows its content as it changes, including Mermaid diagrams, images, math and fonts that finish after the HTML is set, so long documents are never cut off.
- YAML frontmatter at the top of the document shows as a two-column table (key, value), in the preview and the PDF. Frontmatter that is not plain `key: value` lines shows as raw text.
- When size, orientation, margins or zoom change, the page frame animates its width and height (280 ms).
- A chip in the preview header shows the page, e.g. `A4 · PORTRAIT`.

## Feedback

- Create PDF while rendering: a spinner and "Creating PDF…", `aria-busy`, disabled. On success: "PDF ready" with a check that pops in, for 2 s.
- Errors: a toast at the bottom right (bottom on mobile) with an alert icon, a title, the translated message for the error `code`, and a dismiss button; `role="alert"`; it closes after 6 s or on dismiss. The invalid-file message uses the same toast.

## Motion

Per [DESIGN.md](../../../docs/design/DESIGN.md), Motion, and the Phase 6 reduced-motion decision: preset and toolbar buttons lift on hover and press into their shadow; the drawer slides in from the left (240 ms) and Advanced opens with a short ease; the toast rises in; the preview resizes smoothly. Under `prefers-reduced-motion: reduce` only the drawer's and the bottom sheet's slides become fades.

## Accessibility

- Preset cards, page sizes, orientation, margins, font, headings and theme are radio groups (`fieldset` with `legend`, real `input type="radio"` styled by their labels); arrow keys move the selection.
- Page numbers is a checkbox with `role="switch"`. Advanced and the Settings toolbar button are buttons with `aria-expanded` (the latter with `aria-controls` on the drawer). Opening the drawer moves focus to its first control; closing it returns focus to the Settings button. The color popover is a dialog that returns focus to its swatch; Escape closes the popover, the drawer and the bottom sheet, innermost first.
- Icon-only buttons have accessible names; the toast and the busy state are announced.

## Code layout

| Layer | Files |
|---|---|
| Page | `pages/ToolPage.tsx` (owns options, mobile view, toast) |
| Components | `Toolbar`, `CreatePdfButton`, `SettingsDrawer` (the settings panels inside the ui-kit `Drawer`), `PresetPicker`, `PresetCard`, `PageSettings`, `PageNumberSettings`, `PageSizePicker`, `MarginInputs`, `AdvancedSettings`, `EditorPanel`, `EditorHeader`, `MarkdownEditor`, `PreviewPane`, `ZoomControl`, `MobileViewSwitch` |
| Hooks | `useCreatePdf` (adds the done state), `usePreviewFit` (the Fit scale), `usePreviewHtml`, `useMarkdownDocument` |
| API client | `api/pdf.ts`, built on `postJson` from `@goblin/ui-kit/api/requestJson` |
| Lib | `presets.ts` (the table above, `matchPreset`, `applyPreset`, `presetColors`), `pageLayout.ts`, `zoom.ts` (zoom steps), `formatMarkdown.ts`, `sampleDocument.ts` (the starting document from `SAMPLE_EN.md` or `SAMPLE_VI.md`, by the current language), `editorTheme.ts` (CodeMirror theme and highlight style) |
| From `@goblin/ui-kit` | `Drawer`, `SegmentedControl`, `ToggleSwitch`, `ColorField` with `ColorPopover`, `DropOverlay`, `Toast`; `useDismiss` (Escape and outside click), `useToast`, `useFileDrop`, `useContentHeight`; `saveFile`, `color.ts` (hex check, contrast). Text reaches them as props from this tool's namespace |
| Styles | `@goblin/ui-kit/styles/common.css` first, then `toolbar.css`, `settings.css`, `advanced.css`, `editor.css`, `preview.css`, `feedback.css` (mobile), imported by `Tool.tsx`; the tool's classes and keyframes are prefixed `mdpdf-`, ui-kit's `common-` |

`lucide-react` is a dependency of the tool's UI package; it is not shared through Module Federation.

## i18n

New keys in the `markdown-to-pdf` namespace, `en` and `vi`: settings panel and section titles, Advanced and its hint, Custom, the ten preset names, Plain / Underline, color roles, custom color, drop overlay texts, character count, "PDF ready", toast dismiss, open and close settings. Preset names are translated (e.g. Ocean / Đại dương).
