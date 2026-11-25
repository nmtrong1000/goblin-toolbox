# Phase 5: Federated tools

**Goal:** Move the toolbox from one SPA and one function to the architecture in [HLD.html](../design/HLD.html) and [ADR 0003](../design/decisions/0003_FEDERATED_TOOLS_SHARED_DEPLOY.md): a Host SPA, one Module Federation UI remote and one Express API service per tool, all in one Vercel project with Vercel Services and one deployment. Markdown to PDF keeps working exactly as in Phase 4. Every tool follows [TOOL_CONTRACT.md](../design/TOOL_CONTRACT.md).

**Complexity:** large. The spike (F0) decides whether the rest runs as planned or on the fallback.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| F0 | Spike: Services + Module Federation | Throwaway branch and preview deployment with a static Vite host, a static Vite MF remote and an Express service, all using `workspace:*` packages. Measure: services allowed on Hobby, build time, routing order, SPA fallback, function size per service, React 19 / React Router / i18next as MF singletons, `vercel dev` locally. Record in `docs/design/spikes/0002_SERVICES_AND_MODULE_FEDERATION.md` with a go / fallback decision. | — | [x] |
| F1 | Workspace and catalog | Update `pnpm-workspace.yaml` for `host`, `packages/*` and the tool packages chosen in F0. Pin shared singletons (`react`, `react-dom`, `react-router`, `i18next`, `react-i18next`) with a pnpm `catalog:` so the Host and every remote use one version. Pin the Vercel CLI as a root dev dependency. Let the oxlint cross-tool rule allow a tool's own `@goblin/tool-<slug>-*` packages. | F0 | [x] |
| F2 | `@goblin/server-kit` | Move request id, JSON body limit, request log, 404, error handler and the cron bearer check from `backend/` into `packages/server-kit` behind `createApp({ routers })`, which also adds `/api/tools/<slug>/health` to every API service; `/api/health` is removed. Move the health and error-format tests with it. | F1 | [x] |
| F3 | `@goblin/ui-kit` | Move design tokens and components shared with tools from `frontend/` into `packages/ui-kit`. Shell-only components stay in the Host. | F1 | [x] |
| F4 | Host | Rename `frontend/` to `host/`. Add the Remote Loader (load by slug, mount `./Tool`, error state when a remote fails), the catalog loader, `catalog.config.json` and the `buildCatalog.mjs` script. Remove `registry.ts` and every static import of tool code. Tool names come from manifests, not shell i18n. | F1, F3 | [x] |
| F5 | Markdown to PDF split | Restructure `tools/markdown-to-pdf/` into `manifest.json`, `shared/`, `ui/` (MF remote exposing `./Tool`, i18n namespace `markdown-to-pdf`), `api/` (`routes/`, `services/`, `integrations/` on `server-kit`) and `renderer/`. Behavior, options, limits and error codes stay the same. | F2, F3 | [x] |
| F6 | Vercel Services config | Rewrite `vercel.json`: one service per Host, remote and API; the public route table; function settings, `includeFiles` and region on the Markdown to PDF API service; each service that needs a cron registers its own Vercel Cron Job; cache headers (`remoteEntry.js` short, hashed chunks immutable). Remove `api/` and `backend/`. | F4, F5 | [x] |
| F7 | Local dev and tests | `pnpm start` runs the Host, remote and API together with `vercel dev`. Update Playwright `webServer` so UI tests run the full stack. Every existing test passes in its new place. | F6 | [x] |
| F8 | CI | Lint, format, type check and tests across the new packages; build every service; run UI tests on the full stack. | F7 | [x] |
| F9 | Tool scaffold | `pnpm new-tool <slug>` creates a tool that meets the contract: manifest, `shared/`, `ui/`, `api/`, i18n with a parity test, README and `openapi.yaml` stubs, and prints the `vercel.json` and vault-config entries to add. Verified by generating a fake tool, building and testing it, then deleting it. | F6 | [x] |
| F10 | Harness and docs | Update `WORKFLOW.md` (package names in import and lint rules, HUMAN REVIEW package list), the lint hook if needed, `README.md` (setup, dev), `TECH_STACK.md` (MF plugin, Services), `DEPLOY_RUNBOOK.md`, the tool README (function settings), and `HLD.html`, `PROJECT_STRUCTURE.md` and `TOOL_CONTRACT.md` where F0 changed the design. | F8, F9 | [x] |
| F11 | Deploy | Preview deployment first, full test list on it; production after HUMAN REVIEW; rollback drill. | F10 | [x] |

## Patterns to keep

| Area | Source | Pattern |
|---|---|---|
| Express app setup | `backend/src/app.ts` | Middleware order: request id, JSON (`4.49mb`), request log, routes, 404, error handler |
| Errors | `backend/src/middleware/errors.ts` | `{ code, message }`; `NOT_FOUND`, `PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`; JSON error log line to stderr |
| Tool routes | `tools/markdown-to-pdf/src/api/index.ts` | Default export tool router, named `cleanupRouter` for cron |
| Shared schemas | `tools/markdown-to-pdf/src/shared/options.ts` | Zod schemas, `z.infer` types, limits and defaults in one file |
| API tests | `backend/test/health.test.ts` | Vitest + supertest against the app, assert status, body `code` and headers |
| i18n tests | `frontend/test/locales.test.ts`, `tools/markdown-to-pdf/test/i18n.test.ts` | Key parity between `en` and `vi` |
| UI tests | `tools/markdown-to-pdf/ui-test/tool.spec.ts`, `playwright.config.ts` | Playwright with `webServer` starting API and web |
| Imports | `.oxlintrc.json` | `#/` inside a package, package names across packages, no cross-tool imports |

## Test

- Automated: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:ui`, `pnpm build`; all existing Markdown to PDF tests pass unchanged in meaning.
- Boundary: the Host build contains no tool code; removing a tool's catalog entry hides it without a Host code change.
- Federation: React and i18next load once in the browser (network tab); a broken `remoteEntry.js` shows the Host's error state, not a blank page.
- Preview deployment: deep links `/`, `/vaults/document-tools`, `/tools/markdown-to-pdf` load; `/remotes/markdown-to-pdf/remoteEntry.js` is served with short cache; the tool flow from Phase 4 works (upload, reformat, preview, PDF download); the API returns the same responses and error codes; cron rejects calls without `CRON_SECRET`.
- Function settings: only the Markdown to PDF API service has `maxDuration` 60 s and Chromium in its bundle; memory stays the Hobby 2 GB for every function.
- Scaffold: a generated fake tool builds, passes its tests and appears in the catalog.
- Locales `en` and `vi`, desktop and mobile; logs still contain no Markdown content.

## Review

- [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), with extra attention to the Module Federation and Project sections.
- Compare function sizes, cold start and build time with Phase 4.

## AC

- Production runs the new architecture; Markdown to PDF behaves as in Phase 4 in UI and API.
- The Host has no build-time dependency on any tool.
- Each tool API service has its own function settings.
- `pnpm new-tool` produces a tool that meets the contract.
- Docs and harness match the code; the rollback drill succeeded.

## Output

- The migrated toolbox in production, the F0 spike record, updated docs and harness.

## Verification

- Merge `83f4a2e` deployed to production at `https://goblin-toolbox-5ikep8wld-john-does-projects-37100f9f.vercel.app`; `https://goblin-toolbox.vercel.app` serves it. The Markdown to PDF API function is 74 MB in `sin1`.
- Production smoke checks on 2026-11-25: `/`, `/vaults/document-tools`, `/tools/markdown-to-pdf`, `/catalog.json`, `/contracts/markdown-to-pdf.html` and `/remotes/markdown-to-pdf/remoteEntry.js` return `200`; `/api/tools/markdown-to-pdf/health` returns `200`, an unknown tool path `404` JSON, the cleanup cron without a secret `401`, and the removed `/api/health` `404`. A PDF request with Vietnamese text, a formula and a Mermaid diagram returned `200` with a Blob URL; the file is a valid one-page PDF 1.4 with all three rendered. Invalid input returns `400 INVALID_REQUEST`. `remoteEntry.js` is served with `max-age=0, must-revalidate`, hashed Host assets with `max-age=31536000, immutable`.
- Cron: `vercel crons ls` lists `/api/cron/markdown-to-pdf-cleanup` at `0 3 * * *`; `vercel crons run` invoked it and the function returned `200`.
- Rollback drill on 2026-11-25: `vercel promote` of the Phase 4 deployment `4x3dv8sso` moved the production alias to it (`/api/health` answered again), then `vercel promote` of `5ikep8wld` restored Phase 5; each step took under 3 seconds.
- The first GitHub CI run on the new layout failed in `pnpm test:ui`: under `vercel dev` the Host service ran plain `vite`, so `catalog.json` was never generated on a fresh checkout. The Host service now has `devCommand: pnpm dev --port $PORT`, and Vite's dependency scan is limited to `index.html` so the generated contract pages are not parsed.
- After the fixes, merge `d66665d` passed GitHub CI (lint, format, typecheck, unit tests, Playwright, build) and deployed to production as `https://goblin-toolbox-7po5j98yc-john-does-projects-37100f9f.vercel.app`; the production domain moved to it on its own after the earlier manual promotions. The production smoke checks above were repeated with the same results, a malformed JSON body now returns `400 INVALID_REQUEST`, and its log line holds only `entity.parse.failed`.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Vercel Services (beta) limits on Hobby: service count, build time | Medium | F0 measures first; fallback is one project without Services and one function per tool |
| A service root cannot build `workspace:*` packages | Medium | F0 tests it; fallback is bundling each service with esbuild/Vite from the repo root |
| MF singletons fail with React 19, React Router or i18next | Medium | F0 tests the exact versions; fallback is lazy imports with the static catalog (ADR 0003 alternative) |
| Behavior drift in Markdown to PDF during the split | Medium | Move code before changing it; keep every existing test green at each step |
| Chromium and `includeFiles` paths break after moving the API | Medium | Check function bundle and a real render on the preview deployment |
| Local dev gets slower or harder | Low | Decide `vercel dev` vs Vite proxy in F0; one `pnpm dev` command either way |
| Rollback across the migration | Low | Vercel Instant Rollback to the Phase 4 deployment; drill in F11 |

## Decisions

| Question | Decision |
|---|---|
| Health endpoint | Each API service has its own `/api/tools/<slug>/health` from `server-kit`; `/api/health` is removed. |
| Tool package granularity | Each service root is its own package: `tools/<slug>/ui`, `tools/<slug>/api`, and `tools/<slug>/shared` when needed ([spike 0002](../design/spikes/0002_SERVICES_AND_MODULE_FEDERATION.md)). |
| Cron | A service that needs scheduled work registers its own Vercel Cron Job; no shared cron. |
| `shared/` | No fixed content; each tool decides. Only code that the UI and API both use goes there. |
| Scheduled Jobs in C2 | Drawn outside the system boundary as a Vercel platform feature. |

## Deviations from the plan

| Change | Why |
|---|---|
| TypeScript 5.9 → 7, and `#/` imports use the real file extension (`#/routes/tool.ts`) | TypeScript 5.9 and esbuild 0.25 reject `#/` specifiers; the old workaround, `tsconfig` `paths`, leaks into every package a program imports, so `server-kit`'s `#/` resolved to the importer's `src/`. |
| esbuild 0.25 → 0.28 in the catalog | Same `#/` support, for the shared renderer bundle. |
| Root `pnpm dev` → `pnpm start` | Vercel refuses a `dev` script that calls `vercel dev` (`DEV_RECURSIVE_INVOCATION`). |
| API service entrypoint is `src/index.ts`, compiled by Vercel; no esbuild bundle | Vercel moves a prebuilt entry to the function root, so its external packages no longer resolve (`ERR_MODULE_NOT_FOUND` on the first preview). The API service `build` only copies the renderer assets. |
| API service has `devCommand: pnpm dev` | Vercel has no dev server for an Express service otherwise. |
| The PDF renderer uses local Chrome when `VERCEL_ENV` is `development` | `vercel dev` also sets `VERCEL=1`, which used to select the Linux-only Chromium. |
| i18n namespace `markdownToPdf` → `markdown-to-pdf` | TOOL_CONTRACT: the namespace is the slug. |
| `@goblin/ui-kit` holds tokens and federation settings only; it is not a federation singleton | No React component is shared with tools yet. |
| `/api/health` removed; each API service has `/api/tools/<slug>/health` | Decision above; there is no shared backend. |
| Host service has `devCommand: pnpm dev --port $PORT`; Vite's dependency scan is limited to `index.html` | Found by the first CI run: `vercel dev` ran plain `vite` for the Host, so `catalog.json` was missing on a fresh checkout; the generated contract pages also broke the dependency scan. |
| A malformed JSON body returns `400 INVALID_REQUEST` instead of `500`, and body parser errors are logged by type only | Found in the production smoke checks; the handler came unchanged from Phase 4 and its error message quoted part of the request body. |
| File naming: TypeScript, JavaScript and CSS files are camelCase, components PascalCase, Markdown UPPERCASE_UNDERSCORE, other HTML and folders hyphen-case (WORKFLOW.md); 15 files renamed; oxlint `unicorn/filename-case` enforces the code rules | Requested at HUMAN REVIEW. |
| Added `pnpm generate-contracts`: Redocly renders each tool's `openapi.yaml` to `host/public/contracts/<slug>.html` (gitignored), run by the Host's dev and build scripts, so every deployment serves `/contracts/<slug>.html` | Requested at HUMAN REVIEW: read the API contracts on the web. |
| Added [UI_CONVENTIONS.md](../design/UI_CONVENTIONS.md) and split the Host router and the Markdown to PDF `Tool.tsx` (390 lines) into pages, components, hooks, `api/` and `lib/`; oxlint now runs the React plugin with `react/no-multi-comp` and `max-lines` | Requested at HUMAN REVIEW: the old split mixed several components, fetching and layout logic in one file. |

