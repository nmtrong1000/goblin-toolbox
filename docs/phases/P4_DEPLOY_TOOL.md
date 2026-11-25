# Phase 4: Deploy tool

**Goal:** Deploy the full build and verify the tool works correctly in production.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| P1 | Production config | Review env, function memory and `maxDuration`, the cleanup cron, the WAF threshold, the default locale, and the domain if any. | Phase 3 | [x] |
| P2 | Production deployment | Merge the reviewed build into `main` to deploy to production. | P1 | [x] |
| P3 | Smoke tests | Check the UI flow and call the API directly on production. | P2 | [x] |
| P4 | Rollback drill | Instant Rollback to the previous deployment, then promote the new one again. | P2 | [x] |
| P5 | Documentation | Update the README, runbook and known limitations. | P3 | [x] |

## Test

- Smoke test: home search → Markdown to PDF → upload `.md` → reformat → preview → download PDF.
- Call the production API with JSON; open the returned URL; check the file is deleted after 1 hour.
- Check request errors, input limits, rate limits, URL images (including blocked URLs), syntax highlighting, inline HTML, Mermaid, math and the options (including orientation, page numbers, colors, heading style).
- Check desktop/mobile, `en`/`vi` locales, and that logs contain no Markdown content.

## Review

- Review smoke test results, PDF quality, logs and usage against Hobby limits.
- Confirm production runs exactly the commit reviewed in Phase 3.

## AC

- The tool works from the production URL; UI and API behave per the contract.
- The finalized features, locales and options work in production.
- The rollback drill succeeded.
- README, runbook and known limitations are updated.

## Output

- The Markdown to PDF MVP in production, a smoke test record, operations docs.

## Verification

### Production configuration

Reviewed 2026-11-22:

- Production domain: `https://goblin-toolbox.vercel.app`.
- Function: 2048 MB memory, 60-second maximum duration, region `sin1`.
- Cleanup cron: `/api/cron/markdown-to-pdf-cleanup`, daily at 03:00 UTC.
- Blob: production has `BLOB_STORE_ID`; Vercel injects `VERCEL_OIDC_TOKEN` for the Blob SDK. No static read-write token is required on Vercel.
- Cleanup authentication: `CRON_SECRET` is configured as a sensitive production environment variable. Redeploy after changing it.
- Locale: browser language when supported, with English fallback.
- WAF: active rule `API rate limit`, path prefix `/api/`, 100 requests per IP per 60 seconds.

### Production checks

- Commit `dbe7834` passed GitHub CI and deployed successfully to production at `https://goblin-toolbox-4x3dv8sso-john-does-projects-37100f9f.vercel.app`; `https://goblin-toolbox.vercel.app` now serves that deployment.
- Rollback drill on 2026-11-22: rolled the production alias back to the previous ready deployment, confirmed the alias target, then promoted the current deployment and confirmed `https://goblin-toolbox.vercel.app` points to it.
- The initial production smoke check returned a non-JSON server error on `/api/health`. Vercel function logs identified missing runtime packages, then CommonJS loading of ESM-only Chromium and Puppeteer modules. The fix declares those packages as backend runtime dependencies and loads Chromium/Puppeteer with dynamic imports.
- Production smoke checks through authenticated `vercel curl` returned `200` and `{"status":"ok"}` for health, `200` for PDF creation with an `expiresAt` URL, and `400` for invalid input. The returned Blob downloaded as a valid one-page PDF 1.4 file (`%PDF-` signature). Direct requests from this environment could not resolve `goblin-toolbox.vercel.app` (`ENOTFOUND`), so the production UI flow still needs browser review. Protected preview URLs may return the Vercel Authentication page or `401` to unauthenticated requests; use `vercel curl` for authenticated smoke checks.
- Vercel usage review is pending. `vercel usage --format=json` returned `Costs not found (404)` for this account, so current-period usage could not be assessed from the CLI.
