# Shared non-functional requirements

These apply to every tool. Each tool records additional non-functional requirements in `tools/<slug>/README.md` when its build starts.

| Area | Requirement |
|---|---|
| Security | HTTPS only. Every API input is validated against a schema. |
| Privacy | Do not store content users send, unless the tool needs it and says so in its design. Do not log content; log only metadata (request id, size, duration, outcome). |
| Rate limit | Per IP, using Vercel WAF on `/api/*` (decided). Each tool's own thresholds are set in the phase that builds it. |
| Availability | Best effort, no SLA. |
| Browsers | The two latest versions of Chrome, Edge, Firefox, Safari. |
| Accessibility | Basic WCAG 2.1 AA: keyboard navigation, contrast, form labels, visible focus. |
| Observability | Vercel logs; structured logs, one line per request. |
| Source control and CI/CD | Git repo on GitHub. GitHub Actions runs lint, type check, test and build on every PR. Vercel Git integration: every PR gets a preview deployment, `main` deploys to production. |
| Rollback | Vercel Instant Rollback; the Host, every tool remote and every tool API share one deployment, so they roll back together. |
| Cost | Stay within Hobby limits. Upgrade to Pro when commercial use is needed or limits are hit two months in a row. |
