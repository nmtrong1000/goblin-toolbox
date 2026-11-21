# Phase 2: Scaffold and deploy empty project

**Goal:** A blank source that follows the overall architecture (`docs/INIT_PLAN.md` sections 3 and 4), runs locally and is deployed to Vercel. This phase contains no Markdown to PDF code; the tool is added from Phase 3.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| S1 | Workspaces | Root `package.json` with npm workspaces `frontend`, `backend`, `packages/*` (`packages/` left empty); shared TypeScript config. | — | [ ] |
| S2 | Frontend | Set up React + Vite in `frontend/` per `repo-runtime.md`. | S1 | [ ] |
| S3 | Backend | Express app in `backend/` with shared middleware (request id, logging, error format) and a health endpoint; `api/index.ts` exports the app for Vercel; `dev-server.ts` runs it locally. | S1 | [ ] |
| S4 | Local workflow | Scripts to run Vite dev and Express; Vite proxies `/api/*` to Express; scripts to build the frontend and preview the build with a production-like proxy. | S2, S3 | [ ] |
| S5 | Registry | Vault/tool registry and manifest mechanism per `docs/INIT_PLAN.md` section 2; no real vaults or tools yet. | S2 | [ ] |
| S6 | i18n mechanism | `en` and `vi` locales, choosing and storing the locale, fallback, adding a new locale; search matches every locale. | S2 | [ ] |
| S7 | App shell | Home with search and an empty state when there are no tools, vault page, tool page, routing; tool UIs lazy-loaded from manifests. | S5, S6 | [ ] |
| S8 | Code quality and CI | oxlint, Prettier, `tsc -b` and a test runner at the repo root per `docs/WORKFLOW.md` section 7, plus the `frontend` `@/` alias per section 6; the Stop hook works; GitHub Actions runs everything on every PR. | S2, S3, S10 | [ ] |
| S9 | Add-tool checklist | Verify the add-tool checklist with a fake vault and tool (with UI and router), then remove them. | S4–S7 | [ ] |
| S10 | GitHub remote | The `origin` remote (`github.com/nmtrong1000/goblin-toolbox`) exists; confirm the initial commit is on `origin/main` before creating the phase branch. | — | [ ] |
| S11 | Vercel project | Create the project on Hobby and connect GitHub: every PR gets a preview deployment, `main` deploys to production. | S10 | [ ] |
| S12 | `vercel.json` | Frontend build, `outputDirectory`, SPA fallback, rewrite `/api/*` to `api/index.ts`. | S3, S11 | [ ] |
| S13 | WAF | Shared rate-limit rule for `/api/*` with a provisional threshold. | S11 | [ ] |
| S14 | Empty deployment | Deploy the home page (empty state) and health endpoint to production. | S7, S12, S13 | [ ] |
| S15 | README and runbook | README for setup and local runs; runbook for deploy and redeploy, env management, logs, Instant Rollback. | S4, S14 | [ ] |

## Test

**Local**
- Clone a clean repo, install per the README, and it runs.
- Check the home page (empty state), locale switching, and the health endpoint through the proxy.
- With the fake vault and tool from S9: search finds it, the vault and tool pages open, the tool's router responds.
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
- The add-tool checklist has been verified with a fake tool, and the fake tool has been removed.
- CI passes; the WAF rule exists; the runbook can be followed, including rollback.

## Output

- A blank source running locally and on the Vercel production URL.
- README, scripts, CI, `vercel.json`, runbook, add-tool checklist; all committed to the repo.
