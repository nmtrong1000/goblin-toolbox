# Phase 9: Shared UI kit

**Goal:** Move the generic components, hooks and helpers that Markdown to PDF built in Phases 7 and 8 into `@goblin/ui-kit`, so the next tools start from them instead of copying. Replace the rule "move to ui-kit only when the Host and two tools use it" with a rule that asks the user each time a tool builds something that looks reusable. The tool's behaviour, look and API do not change.

**Complexity:** medium. Touches `packages/ui-kit`, the Markdown to PDF UI and the design rules; no API or Host change.

## Scope

| Group | Moves to `@goblin/ui-kit` | Change needed on the way |
|---|---|---|
| Lib | `saveFile.ts`, `color.ts` | None |
| Hooks | `useDismiss.ts`, `useToast.ts`, `useFileDrop.ts`, `useContentHeight.ts` | None |
| Form controls | `ToggleSwitch.tsx`, `SegmentedControl.tsx`, `ColorField.tsx`, `ColorPopover.tsx` | Labels come in as props; classes and CSS move to the ui-kit prefix |
| Feedback | `Toast.tsx`, `DropOverlay.tsx` | Text comes in as props (`dismissLabel`, `title`, `hint`) instead of `t()` in the tool namespace |
| Drawer | New `Drawer.tsx`: backdrop, header with title and close button, focus on the first control, Escape via `useDismiss`; content as `children` | `SettingsDrawer.tsx` stays in the tool and renders its panels inside `Drawer` |
| API helper | `requestJson.ts`: an `ApiError` with a `code`, safe JSON reading, and 429, 413 and network failures mapped to `RATE_LIMITED`, `PAYLOAD_TOO_LARGE`, `NETWORK_ERROR` | `api/pdf.ts` keeps its endpoints and builds on the helper |

Stays in the tool: everything specific to PDF pages or Markdown (settings panels, presets, page layout, preview, editor, `useCreatePdf`, `useMarkdownDocument`, `usePreviewHtml`, `formatMarkdown`). The page-preview group (`usePreviewFit`, `zoom.ts`, `ZoomControl`) and the CodeMirror theme (`editorTheme.ts`) also stay until a second tool needs them (PLANNING decision).

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| K1 | Rule change | `UI_CONVENTIONS.md`, "Where code lives": when a tool builds a component, hook or helper that another tool could use, the agent asks the user whether it goes into `@goblin/ui-kit`, during PLANNING or as soon as it is spotted in IMPLEMENTATION; the answer is recorded under `## Decisions` in the phase file. Shared code never imports a tool, never calls `t()` and takes all text as props. Same rule in `AGENTS.md` ("Working through a phase"); `REVIEW_CHECKLIST.md` replaces the anti-pattern "moved before the Host and two tools use it" with "moved to ui-kit without the user's yes" and "a reusable piece kept in a tool without asking". | — | [x] |
| K2 | ui-kit package | Folders `components/`, `hooks/`, `lib/`, `api/`, `styles/` with `#/` imports; one subpath export per module (e.g. `@goblin/ui-kit/hooks/useDismiss`); `react` and `lucide-react` as peer dependencies; a `tests/` folder with Vitest; the React lint rules already cover `packages/*/src`. | K1 | [x] |
| K3 | Lib and hooks | Move `saveFile`, `color`, `useDismiss`, `useToast`, `useFileDrop`, `useContentHeight`; move their tests. | K2 | [x] |
| K4 | Components and CSS | Move the form controls and feedback components, add `Drawer`; their CSS moves to `styles/common.css` with the class prefix `common-` and uses only tokens. | K3 | [x] |
| K5 | API helper | Add `requestJson`/`ApiError`; `api/pdf.ts` uses it with the same error codes as today. | K2 | [x] |
| K6 | Switch the tool | Markdown to PDF imports from `@goblin/ui-kit` (now a runtime dependency), deletes its copies, passes translated labels as props, and drops the moved CSS. | K3–K5 | [x] |
| K7 | Tests and docs | Unit tests in ui-kit for the pure helpers (`color`, `requestJson`); hooks and components are covered by the tool's Playwright tests; the tool's Playwright tests pass unchanged; `PROJECT_STRUCTURE.md` and `TOOL_CONTRACT.md` (Styles: the `common-` prefix belongs to ui-kit) and `docs/design/tools/markdown-to-pdf/UI.md` updated. | K6 | [x] |
| K8 | Deploy | Preview deployment; production after HUMAN REVIEW. | K7 | [x] |

## Test

- Automated, once: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:ui`, `pnpm build`.
- The existing `tool.e2e.ts` passes without edits to its assertions: drawer, Escape order (color popover before drawer), toggle, segmented controls, color field, toast, drag and drop, PDF download.
- No `mdpdf-` class or tool i18n key is left in `packages/ui-kit`; no file in the tool duplicates a moved module.
- Manual (user): the tool looks and behaves the same on desktop and mobile, `en` and `vi`.

## Review

- [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), with extra attention to the React.js section, import rules and the Styles rule in [TOOL_CONTRACT.md](../design/TOOL_CONTRACT.md).

## AC

- The listed modules live in `@goblin/ui-kit` and Markdown to PDF uses them; behaviour and look are unchanged.
- The new rule is written in `UI_CONVENTIONS.md`, `AGENTS.md` and `REVIEW_CHECKLIST.md`.
- Docs match the code; production runs the refactored tool.

## Decisions

- Page preview and CodeMirror theme (PLANNING): `usePreviewFit`, `zoom.ts`, `ZoomControl` and `editorTheme.ts` stay in Markdown to PDF; the user is asked again when a tool with a page preview or a code editor arrives.
- Class prefix (PLANNING): ui-kit CSS classes use the `common-` prefix; no tool slug may be `common`.
- One stylesheet (DESIGN): ui-kit CSS is a single `styles/common.css` instead of several files, so shared keyframes never depend on import order.
- Tests (DESIGN): the repo has no DOM test library; ui-kit unit tests cover the pure helpers, and the moved hooks and components are covered by the tool's Playwright tests.

## Deviations from the plan

- `tool.e2e.ts` changes one selector, `.mdpdf-backdrop` to `.common-backdrop`; no assertion changed.
- HUMAN REVIEW round 1: the user asked for a longer starting document. The editor now opens with a sample guide in the current language (`en` or `vi`) that shows frontmatter, text formatting, nested and task lists, a table, code, math, a flowchart, a pie chart and a bar and line chart; a language switch after load does not replace the text.
- HUMAN REVIEW round 2: the sample has no made-up prices; its table lists real paper sizes, and the chart titles say the numbers are sample data.
