# Phase 3: Build tool Markdown to PDF

**Goal:** Add the tool to the blank source and complete its UI and API through slices 3.0–3.6. Each slice works end to end (UI + API + tests) and is reviewed before the next one starts.

Each slice defines the status codes and headers for the cases it implements, then updates `docs/design/api/markdown-to-pdf.openapi.yaml`.

## Slice overview

| Slice | Content | Depends on |
|---|---|---|
| 3.0 | Preparation: tool NFRs, vault/tool registration, Markdown Renderer, tool infrastructure | Phase 2 |
| 3.1 | Core pipeline: basic Markdown → PDF → Blob → URL; editor, `.md` upload, reformat, preview | 3.0 |
| 3.2 | Syntax: GFM, syntax highlighting, math, Mermaid, inline HTML | 3.1 |
| 3.3 | URL images and Request Guard | 3.1 |
| 3.4 | Options: page size, orientation, margins, page numbers, font, theme, colors, heading style | 3.1 |
| 3.5 | Limits and abuse protection | 3.1–3.4 |
| 3.6 | Finishing: i18n, responsive layout, accessibility, API docs | 3.1–3.5 |

## Slice 3.0: Preparation

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M0.1 | Tool NFRs | Set the tool's own non-functional requirements (API and preview performance, input limits, security, privacy) from the spike numbers, and record them in `docs/INIT_PLAN.md` section 6.5. | — | [ ] |
| M0.2 | Register the tool | The `Document Tools` vault, plus the Markdown to PDF manifest and an empty router, per the add-tool checklist. | — | [ ] |
| M0.3 | Markdown Renderer | Set up `packages/markdown-renderer/` with basic Markdown, one theme and the options schema. | — | [ ] |
| M0.4 | Tool infrastructure | Blob store, env, daily cleanup cron; function memory and `maxDuration`; packaging Chromium, the renderer and fonts into the function. | — | [ ] |
| M0.5 | Chromium locally and in CI | Locally, use the installed Chrome; CI on Linux uses the exact `@sparticuz/chromium` used in production. | M0.4 | [ ] |

**AC:** The tool's NFRs are reviewed; the tool appears on the home page and in its vault; Chromium starts locally, in CI and on a preview deployment.

## Slice 3.1: Core pipeline

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M1.1 | PDF Renderer | Chromium loads the `packages/markdown-renderer/` bundle and theme, renders basic Markdown, prints the PDF. | — | [ ] |
| M1.2 | File Storage | Upload the PDF to Vercel Blob under a random name, return the URL and `expiresAt`; delete files older than 1 hour on each new request; daily cron as a safety net. | — | [ ] |
| M1.3 | Md2Pdf API | `POST /api/tools/markdown-to-pdf`: validate, render, upload; errors as `code` + `message`. | M1.1, M1.2 | [ ] |
| M1.4 | Editor and preview | Editor, `.md` file upload, live preview with `packages/markdown-renderer/`, split side by side on desktop. | — | [ ] |
| M1.5 | Reformat | A button that reformats the Markdown without changing what is rendered. | M1.4 | [ ] |
| M1.6 | PDF download | Download button, loading state, errors shown by `code`. | M1.3, M1.4 | [ ] |
| M1.7 | Match test | Automated test comparing a Chrome screenshot of the preview with an image rendered from the PDF; runs in CI. | M1.1, M1.4 | [ ] |

**AC:** Type or upload Markdown, reformat it, see the preview, download the PDF by URL. The API can be called on its own. The match test passes.

## Slice 3.2: Syntax

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M2.1 | GFM | Tables, task lists, strikethrough, autolinks, code blocks. | — | [ ] |
| M2.2 | Syntax highlighting | Highlighting by the code block's language tag. | — | [ ] |
| M2.3 | Math | Inline and block formulas with KaTeX. | — | [ ] |
| M2.4 | Mermaid | Render `mermaid` code blocks; the preview is debounced (delay set by measurement); invalid syntax shows an error block; the PDF prints only after every diagram has rendered. | — | [ ] |
| M2.5 | Inline HTML | Sanitize through the allowlist; remove tags outside it; never run user-supplied scripts. | — | [ ] |

**AC:** Syntax fixtures render correctly and match between preview and PDF; fixtures with scripts or tags outside the allowlist are not executed.

## Slice 3.3: URL images

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M3.1 | Request Guard | Block every Chromium request to private, loopback and link-local IPs (checked after DNS resolution and after every redirect) and to schemes other than `http`/`https`; timeouts; size limits. | — | [ ] |
| M3.2 | Broken images | Blocked or failed images show a placeholder in both the preview and the PDF. | M3.1 | [ ] |

**AC:** Public images appear in the PDF; internal, oversized, timed-out or non-image URLs are blocked and show a placeholder.

## Slice 3.4: Options

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M4.1 | Page | Page size, orientation, margins and page numbers with the values set in Phase 1. | — | [ ] |
| M4.2 | Font and theme | The fonts and themes set in Phase 1; fonts are packaged with the function. | — | [ ] |
| M4.3 | Colors and heading style | Adjust text, heading and link colors and the H1–H3 style; required in the request, pre-filled by the UI from the selected theme. | M4.2 | [ ] |
| M4.4 | Options UI | Choose options; the preview updates immediately. | M4.1, M4.2, M4.3 | [ ] |
| M4.5 | Schema | Update the API contract for `options`. | M4.1, M4.2, M4.3 | [ ] |

**AC:** Every option combination in the fixtures matches between preview and PDF; Vietnamese renders correctly with every font.

## Slice 3.5: Limits and abuse protection

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M5.1 | Measure | Measure duration and memory by Markdown size, number of images and number of diagrams. | — | [ ] |
| M5.2 | Input limits | Set limits from the measurements; return a clear error when exceeded. | M5.1 | [ ] |
| M5.3 | Rate limit | Set the WAF threshold; tune function memory and `maxDuration`; the UI shows an error when rate-limited. | M5.1 | [ ] |

**AC:** Limits are based on measurements; exceeding a limit or being rate-limited returns a clear error.

## Slice 3.6: Finishing

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| M6.1 | Tool i18n content | Translate every UI string and error message of the tool into `en`/`vi`. The locale mechanism exists from Phase 2 (S6). | — | [ ] |
| M6.2 | Responsive | Side by side on desktop; switch between editor and preview on mobile. | — | [ ] |
| M6.3 | Accessibility | Per the non-functional requirements in `docs/INIT_PLAN.md` sections 5 and 6.5. | — | [ ] |
| M6.4 | API docs | Complete the OpenAPI spec and API call examples. | — | [ ] |

**AC:** No untranslated UI strings remain; the UI works on desktop and mobile; the API docs are complete.

## Test (applies to every slice)

- Unit tests: validation, sanitizing, Request Guard, options, storage.
- API integration tests with fixtures, valid PDFs and errors.
- UI tests: typing and uploading content, reformat, preview, options, locale switching, PDF download, error display.
- The preview-vs-PDF match test in CI.
- Open PDFs in a viewer and check multi-page fixtures with tables, code, diagrams, math and images.

## Review

- Review each slice: PDF quality, match with the preview, API contract, security (Request Guard, sanitizing), module boundaries.

## Phase AC

- Every slice meets its AC.
- The tool has the features in `docs/INIT_PLAN.md` section 6.1.
- Input limits and rate limits are set from measurements.

## Output

- Markdown to PDF (UI and API), complete OpenAPI spec, fixtures, test results, measured runtime numbers.
