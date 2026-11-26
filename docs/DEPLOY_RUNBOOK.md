# Deploy runbook

How to run, deploy, configure and operate Goblin Toolbox as it is today. It describes the current setup only; what each phase verified in production is recorded in that phase's file in `docs/phases/`.

## Setup

- One Vercel project, `goblin-toolbox`, linked to the GitHub repo. Production domain: `https://goblin-toolbox.vercel.app`.
- [Vercel Services](https://vercel.com/docs/services) (beta): `vercel.json` defines one service for the Host, one static service per tool UI remote and one function per tool API service, plus the public route table. Every service builds separately but ships in the same deployment, so a deployment or rollback always moves all services together.
- Region `sin1` for every function.
- Vercel CLI is a pinned dev dependency (`vercel` 66.6.0). Use `pnpm exec vercel …`; link the repo once with `vercel link`.

| Service | Root | Serves |
|---|---|---|
| `host` | `host/` | `/`, `/vaults/*`, `/tools/*`, `/catalog.json`, `/contracts/<slug>.html` |
| `<slug>-ui` | `tools/<slug>/ui/` | `/remotes/<slug>/*` |
| `<slug>-api` | `tools/<slug>/api/` | `/api/tools/<slug>/*`, `/api/cron/<slug>-*` |

## Local development

```sh
pnpm install
pnpm start
```

`pnpm start` runs `vercel dev --local`: every service in `vercel.json` behind <http://localhost:5173>, with reload on change. No Vercel login or environment variables are needed. The Host's dev command generates `catalog.json` and the contract pages before starting Vite.

- PDF rendering uses the local Google Chrome; set `LOCAL_CHROME_PATH` if it is not in the default location.
- The API service's dev script sets `LOCAL_PDF_OUTPUT=1`, so **Create PDF** downloads the file directly instead of uploading it to Blob.
- `pnpm test` runs unit tests; `pnpm test:ui` runs Playwright against the local stack and starts it if it is not running.

## Deploy

| Target | How |
|---|---|
| Preview | Push a branch and open a pull request; Vercel builds a preview deployment. Manual: `vercel deploy --target preview` |
| Production | Merge into `main`; Vercel deploys production from `main`. Manual: `vercel deploy --prod` |

- GitHub Actions (`.github/workflows/ci.yml`) runs lint, format, typecheck, unit tests, Playwright and build on every pull request and push to `main`. Vercel deploys independently of CI, so check that CI is green before merging.
- Preview deployments are protected. Use `vercel curl <path> --deployment <url>` for authenticated checks, or open them in a browser signed in to Vercel.
- After a production deployment, check the health of every API service and open the Host.

## Environment variables

Set them in **Vercel → Project → Settings → Environment Variables**, then redeploy so functions receive the new values. Never commit `.env.local` or values copied from Vercel. Pull values for local use with `vercel env pull .env.local`.

| Variable | Used by | Environments | Notes |
|---|---|---|---|
| `BLOB_STORE_ID` | `markdown-to-pdf-api` | Production, Preview, Development | Vercel Blob store; Vercel injects `VERCEL_OIDC_TOKEN` for access, so no static token is needed on Vercel |
| `CRON_SECRET` | `markdown-to-pdf-api` | Production | Sensitive; the cron route rejects calls without it |
| `BLOB_READ_WRITE_TOKEN` | `markdown-to-pdf-api` | Local only, optional | Only to test real Blob uploads locally |
| `LOCAL_CHROME_PATH` | `markdown-to-pdf-api` | Local only, optional | Chrome executable for local rendering |

`BLOB_WEBHOOK_PUBLIC_KEY` is added by the Blob integration and is not read by the code. Each tool lists its own variables, function settings and cron jobs in `tools/<slug>/README.md`.

## Functions

- Function settings live on the tool's API service in `vercel.json` (`functions`): Markdown to PDF uses `maxDuration` 60 seconds and bundles its renderer assets with `includeFiles`.
- On the Hobby plan memory is fixed at 2048 MB and 1 vCPU and cannot be set per service.
- Each API service has a health route, described in [API_CONVENTIONS.md](./design/API_CONVENTIONS.md).

## Cron jobs

Cron jobs are declared in `vercel.json` (`crons`) by the tool that needs them and run on production only.

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/markdown-to-pdf-cleanup` | `0 3 * * *` (03:00 UTC) | Delete expired PDFs from Blob |

- List: `vercel crons ls`.
- Run now: `vercel crons run /api/cron/markdown-to-pdf-cleanup`, or **Run** in **Vercel → Project → Settings → Cron Jobs**.
- Vercel sends `Authorization: Bearer $CRON_SECRET`; how the route checks it is in [API_CONVENTIONS.md](./design/API_CONVENTIONS.md).

## Caching and firewall

- Hashed files under `/assets/*` (Host) and `/remotes/<slug>/assets/*` (remotes) are cached for one year as immutable. HTML and `remoteEntry.js` revalidate, so a new deployment is picked up at once.
- WAF rule `API rate limit`: path prefix `/api/`, 100 requests per IP per 60 seconds, then `429`. Review it against real traffic before tightening.

## Logs

- **Vercel → Project → Logs**, or `vercel logs --deployment <url>`. Filter by service, e.g. `markdown-to-pdf-api`.
- Every API log line is JSON with the request ID, method, path, status and duration; the `x-request-id` response header gives the ID of a request. Request and response bodies are never logged.

## Rollback

All services roll back together.

1. **Vercel → Project → Deployments**, open the last known-good production deployment and select **Promote to Production** (or **Instant Rollback**). CLI: `vercel promote <deployment-url> --yes`.
2. Check that `https://goblin-toolbox.vercel.app` serves that deployment (`vercel inspect goblin-toolbox.vercel.app`) and that every health endpoint returns `200`.
3. When the fix is ready, merge it into `main`, or promote the newer deployment again the same way.
