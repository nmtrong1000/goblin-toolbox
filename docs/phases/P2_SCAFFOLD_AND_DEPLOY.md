# Phase 2: Scaffold and deploy empty project

**Goal:** A blank source that follows the overall architecture (`docs/design/HLD.md` and `docs/design/PROJECT_STRUCTURE.md`), runs locally and is deployed to Vercel. This phase contains no Markdown to PDF code; the tool is added from Phase 3.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| S1 | Workspaces | Root `package.json` with `packageManager` pnpm and `pnpm-workspace.yaml` listing `frontend`, `backend`, `tools/*` (`tools/` left empty); root `tsconfig.json` with shared options and project references; `engines` pins Node.js 26.x LTS. | — | [x] |
| S2 | Frontend | Set up React + Vite in `frontend/` per `PROJECT_STRUCTURE.md`; create `frontend/src/styles/tokens.css` with semantic CSS custom properties derived from `docs/design/DESIGN.md` (colors, typography, spacing and corner radii), load Quicksand with a system fallback, and use the tokens in the app shell instead of hard-coded design values. | S1 | [x] |
| S3 | Backend | Express app in `backend/` with shared middleware (request id, logging, error format) and a health endpoint; `api/index.ts` exports the app for Vercel; `dev-server.ts` runs it locally; internal imports use `#/` subpath imports, verified locally and on Vercel. | S1 | [x] |
| S4 | Local workflow | Scripts to run Vite dev and Express; Vite proxies `/api/*` to Express; scripts to build the frontend and preview the build with a production-like proxy. | S2, S3 | [x] |
| S5 | Vault and tool routes | Support routes for vault and tool pages; no real vaults or tools yet. | S2 | [x] |
| S6 | i18n mechanism | `en` and `vi` locales, choosing and storing the locale, fallback, and adding a new locale. | S2 | [x] |
| S7 | App shell | Home with search and an empty state when there are no tools, vault page, tool page, and routing. | S5, S6 | [x] |
| S8 | Code quality and CI | oxlint, Prettier, `tsc -b` and a test runner at the repo root per `docs/WORKFLOW.md`, section "Lint and format", plus `#/` subpath imports per section "Import rules" (verified in Vite too); the Stop hook works; GitHub Actions runs everything on every PR. | S2, S3, S10 | [x] |
| S9 | Tool and vault integration | Verify a fake tool package `tools/fake/` (UI, router and its own dependency) and a fake vault integrate with the app, then remove them. | S4–S7 | [x] |
| S10 | GitHub remote | The `origin` remote (`github.com/nmtrong1000/goblin-toolbox`) exists; confirm the initial commit is on `origin/main` before creating the phase branch. | — | [x] |
| S11 | Vercel project | Create the project on Hobby and connect GitHub: every PR gets a preview deployment, `main` deploys to production. | S10 | [x] |
| S12 | `vercel.json` | Frontend build, `outputDirectory`, SPA fallback, rewrite `/api/*` to `api/index.ts`. | S3, S11 | [x] |
| S13 | WAF | Shared rate-limit rule for `/api/*` with a provisional threshold. | S11 | [x] |
| S14 | Empty deployment | Deploy the home page (empty state) and health endpoint to production; measure health latency with the function in `iad1` and `sin1` and set `regions` in `vercel.json`. | S7, S12, S13 | [x] |
| S15 | README and runbook | README for setup and local runs; runbook for deploy and redeploy, env management, logs, Instant Rollback. | S4, S14 | [x] |

## Test

**Local**
- Clone a clean repo, install per the README, and it runs.
- Check the home page (empty state), locale switching, and the health endpoint through the proxy.
- Confirm the app shell uses the CSS custom properties from `frontend/src/styles/tokens.css` and matches the visual rules in `docs/design/DESIGN.md`.
- With the fake vault and tool from S9: the home page can find the tool, the vault and tool pages open, and the tool's router responds.
- Build the frontend and preview: deep links work on reload, `/api/*` reaches Express instead of the SPA fallback.

**CI and production**
- CI passes on a test PR, and that PR gets a preview deployment.
- On the production URL: static files come from the CDN (check cache headers), deep links work on reload, the health endpoint responds, `/api/*` does not fall into the SPA fallback.
- Measure the function's cold start.
- Try Instant Rollback to the previous deployment, then promote back.

## Review

- Review repo structure, workspaces, scripts, middleware, module boundaries and the startup experience.
- Review `vercel.json`, env, the WAF rule, README and runbook.
- Confirm no tool-specific code exists in the source or the deployment.

## AC

- Frontend and Express run locally per the README.
- The production URL serves the frontend via CDN and the health endpoint via Express; deep links work on direct reload.
- Switching between English and Vietnamese works.
- The frontend has semantic CSS custom properties for the design tokens in `docs/design/DESIGN.md`; shell styles use those properties rather than duplicating token values.
- Tool and vault integration has been verified with temporary fixtures, which have been removed.
- CI passes; the WAF rule exists; the runbook can be followed, including rollback.

## Output

- A blank source running locally and on the Vercel production URL.
- `frontend/src/styles/tokens.css` with the shared design tokens applied to the app shell.
- README, scripts, CI, `vercel.json` and runbook; all committed to the repo.
