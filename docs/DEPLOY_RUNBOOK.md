# Deploy runbook

## Preview and production

Push a branch and open a pull request. Vercel should create a preview deployment for the pull request. Review the deployment checks and open the preview URL before merging. Merging to `main` deploys production.

For a manual deployment, link the repository with `vercel link` once, then use `vercel deploy --target preview` for a preview or `vercel deploy --prod` for production.

The active shared firewall rule matches `/api/`, limits requests to 100 per IP per 60 seconds, and returns `429` after the limit. Treat this as a provisional threshold and review it against real traffic before tightening it.

Content-hashed files under `/assets/*` are served with a one-year immutable cache policy. HTML uses revalidation so new deployments can reference new asset hashes.

## Environment variables

Set production and preview values in the Vercel project settings under **Settings → Environment Variables**. Pull the values needed for local development with:

```sh
vercel env pull .env.local
```

Never commit `.env.local` or values copied from Vercel. Redeploy after changing variables so a new function deployment receives them.

## Logs and health

Use **Vercel → Project → Deployments → deployment → Functions → Logs** to inspect function logs. Each API log is JSON and includes the request ID, method, path, status and duration. The matching `x-request-id` response header identifies a request. Do not log request or response bodies.

Check `/api/health` after deployment. It should return `200` with `{"status":"ok"}` and an `x-request-id` header.

## Production configuration review

Reviewed 2026-11-22:

- Production domain: `https://goblin-toolbox.vercel.app`.
- Function: 2048 MB memory, 60-second maximum duration, region `sin1`.
- Cleanup cron: `/api/cron/markdown-to-pdf-cleanup`, daily at 03:00 UTC.
- Blob: production has `BLOB_STORE_ID`; Vercel injects `VERCEL_OIDC_TOKEN` for the Blob SDK. No static read-write token is required on Vercel.
- Cleanup authentication: `CRON_SECRET` is configured as a sensitive production environment variable. Redeploy after changing it.
- Locale: browser language when supported, with English fallback.
- WAF: active rule `API rate limit`, path prefix `/api/`, 100 requests per IP per 60 seconds.

## Phase 4 verification record

- Commit `a90889f` passed GitHub CI and the Vercel deployment completed, but the function failed at runtime during the production smoke check. The current production alias is restored to the `a90889f` build with the sensitive cleanup secret loaded.
- Rollback drill on 2026-11-22: rolled the production alias back to the previous ready deployment, confirmed the alias target, then promoted the current deployment and confirmed `https://goblin-toolbox.vercel.app` points to it.
- Production smoke check returned a non-JSON server error on `/api/health`. Vercel function logs identified missing runtime packages, then CommonJS loading of ESM-only Chromium and Puppeteer modules. The Phase 4 working tree declares external runtime dependencies in the backend and loads Chromium/Puppeteer with dynamic imports.
- The protected preview `https://goblin-toolbox-edzry4v9v-john-does-projects-37100f9f.vercel.app` is ready (73.94 MB function). Authenticated Vercel CLI checks returned `200` for health, `200` for PDF creation with an `expiresAt` URL, and `400` for an invalid request. Downloading the returned Blob URL produced a one-page PDF 1.4 file (`%PDF-` signature). The preview UI flow still needs browser review. The fix is not yet deployed to production. Direct unauthenticated requests to protected preview URLs may return the Vercel Authentication page or `401`; use `vercel curl` for authenticated smoke checks.
- Vercel usage review is pending. `vercel usage --format=json` returned `Costs not found (404)` for this account, so current-period usage could not be assessed from the CLI.

## Instant Rollback

In **Vercel → Project → Deployments**, open the last known-good deployment and select **Promote to Production** (or **Instant Rollback** when shown). Confirm the production domain points to that deployment, then use the latest successful deployment's **Promote to Production** action to restore the current version. Keep both deployments available until the restored version is verified.
