# Deploy runbook

## Preview and production

Push a branch and open a pull request. Vercel should create a preview deployment for the pull request. Review the deployment checks and open the preview URL before merging. Merging to `main` deploys production.

For a manual deployment, link the repository with `vercel link` once, then use `vercel deploy --target preview` for a preview or `vercel deploy --prod` for production.

The shared firewall rule limits `/api/*` to 100 requests per IP per 60 seconds and returns `429` after the limit. Treat this as a provisional threshold and review it against real traffic before tightening it.

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

## Instant Rollback

In **Vercel → Project → Deployments**, open the last known-good deployment and select **Promote to Production** (or **Instant Rollback** when shown). Confirm the production domain points to that deployment, then use the latest successful deployment's **Promote to Production** action to restore the current version. Keep both deployments available until the restored version is verified.
