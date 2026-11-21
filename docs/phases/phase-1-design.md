# Phase 1: Design

**Goal:** Verify that Express + Chromium runs in a Vercel Function (Hobby), then finalize the design before scaffolding.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| D1 | Runtime feasibility spike | Deploy a throwaway build to Vercel Hobby and measure against the go/no-go criteria below. | — | [ ] |
| D2 | HLD and C4 | Complete C1–C3, the project/vault/tool model, and the UI and API flows based on the D1 results. | D1 | [ ] |
| D3 | ADR | Record the key decisions with rationale, alternatives and consequences. | D1 | [ ] |
| D4 | Tech stack | Pin versions: Node.js, TypeScript, React, Vite, Express, oxlint, Prettier, `puppeteer-core`, `@sparticuz/chromium`, markdown-it and plugins, highlighting, KaTeX, Mermaid, sanitizer and HTML allowlist, Markdown formatter, schema library, editor, i18n, test tools; the font and theme list (fonts fully support Vietnamese). | D1 | [ ] |
| D5 | API contract | Finalize request/response, the error format (`code` + `message`), and valid option values (page size, orientation, margins, page numbers, font, theme, colors, heading style). Status codes and headers are left to Phase 3. | D1, D4 | [ ] |
| D6 | UX/UI design | Home and search, vault page, editor/preview, `.md` upload, reformat, options (including colors and heading style), PDF download, loading, errors, responsive layout. | — | [ ] |
| D7 | i18n design | `en`/`vi` locale structure for the UI, how to add a locale, search matching every locale. | — | [ ] |
| D8 | Repo/runtime design | Directory structure, npm workspaces, `vercel.json` (rewrite, memory, `maxDuration`, cron), packaging `packages/markdown-renderer/` and fonts into the function, local workflow with the installed Chrome, internal import style for `backend` (`docs/WORKFLOW.md` section 6). | D1, D4 | [ ] |
| D9 | Test plan | Scope, test layers, fixtures, the preview-vs-PDF match test, pass criteria. | D2–D8 | [ ] |

## D1: Go/no-go criteria

| # | Check | Pass criterion |
|---|---|---|
| G1 | Function bundle | Express, `puppeteer-core`, `@sparticuz/chromium`, the `packages/markdown-renderer/` bundle and fonts fit within the Vercel Function size limit; build and deploy succeed. |
| G2 | Print a 10-page fixture | Finishes within Hobby's memory and duration limits; record warm time, cold start and memory for setting the tool's NFRs in Phase 3. |
| G3 | Renderer in Chromium | GFM, syntax highlighting, KaTeX, Mermaid, inline HTML and URL images render correctly; page numbers and orientation print correctly; the PDF is printed only after Mermaid and KaTeX finish rendering. |
| G4 | Vietnamese | Diacritics render correctly with every font on the list. |
| G5 | Match | Screenshots of the preview in Chrome and images rendered from the PDF match in layout for the fixtures. |
| G6 | Routing and rate limit | The CDN serves static files and the SPA fallback; `/api/*` reaches Express; WAF rate limiting works on Hobby; record the request body limit. |
| G7 | Blob | Upload under a random name and return a URL; delete files older than 1 hour on a new request; a daily Vercel Cron runs on Hobby. |
| G8 | Request Guard | Blocks Chromium requests to internal IPs, including through redirects. |

**Fallbacks:**

- G1 or G2 fails: **stop and discuss** with the spike numbers before continuing.
- G6 (WAF) fails: stop and discuss; the option to consider is Upstash Redis (has a free tier).
- G7 (cron) fails: clean up files only on new requests.

## Test / validation

- Run D1 with fixtures: Markdown/GFM, code, math, Mermaid, inline HTML, URL images, Vietnamese, a 10-page document.
- Record duration, memory, bundle size, cold start.
- Walk through the UX and API contract with success and error examples.

## Review

- Review the D1 results against each criterion G1–G8, and the fallback if any criterion fails.
- Review D2–D9.

## AC

- Every criterion G1–G8 passes, or a fallback has been chosen and the plan updated.
- Documents D2–D9 are complete and reviewed.
- Syntax scope, options and API contract are finalized.

## Output

```text
docs/
└── design/
    ├── hld.md                          # D2
    ├── decisions/                      # D3, one file per decision
    │   ├── 0001-node-express-backend.md
    │   ├── 0002-chromium-on-vercel.md
    │   ├── 0003-shared-renderer.md
    │   ├── 0004-vercel-blob-cleanup.md
    │   └── 0005-rate-limit-vercel-waf.md
    ├── tech-stack.md                   # D4
    ├── api/
    │   └── markdown-to-pdf.openapi.yaml  # D5
    ├── ux/
    │   └── flows.md                    # D6
    ├── i18n.md                         # D7
    ├── repo-runtime.md                 # D8
    ├── test-plan.md                    # D9
    └── spikes/
        └── 0001-chromium-on-vercel.md  # D1: measurements, G1–G8 results
```

- All of `docs/design/` is committed to the repo once the phase's AC is accepted.
- Spike code is not kept as the scaffold and is not committed to `main`.
