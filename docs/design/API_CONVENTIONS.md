# API conventions

Rules for every tool's API service and for the code that calls it. The architecture is in [HLD.html](./HLD.html), what else a tool must provide in [TOOL_CONTRACT.md](./TOOL_CONTRACT.md). What REVIEW checks is in [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md).

## Service

| Rule | Value |
|---|---|
| Runtime | One Express app in one Vercel Function, built with `createApp()` from `@goblin/server-kit`; shared middleware is not rewritten. The service entrypoint is `src/index.ts` (Vercel compiles it; do not ship a prebuilt bundle), and `devCommand` runs `src/devServer.ts` for `vercel dev` |
| Layers | `routes/` → `services/` → `integrations/`. Routes handle HTTP only: validation, calling a service, mapping results and errors. Services hold the business logic and never import Express. Integrations wrap external systems (Blob, browsers, outbound HTTP). A layer only calls the layer below it |
| Function settings | `maxDuration`, bundled files (`includeFiles`), env vars and crons are declared in the tool's service entry in `vercel.json` and in the tool README. Memory is not per service: Hobby runs every function at 2 GB / 1 vCPU, and Pro sets one size for the whole project (spike 0002) |

## Paths and versioning

- Tool API: `/api/tools/<slug>/…`. Scheduled jobs: `/api/cron/<slug>-<job>`.
- Health: every service answers `GET /api/tools/<slug>/health` with `200` and `{ "status": "ok", "service": "<slug>" }` (server-kit).
- **No API versioning.** Paths carry no version segment (no `/v1`), and there is no version header. The UI and API of a tool ship in the same deployment, so they always match. A change that breaks other API clients is recorded in the tool's README and `openapi.yaml` in the same change. The `info.version` in `openapi.yaml` is the document's version, not part of any URL.

## Requests and responses

- HTTPS only.
- JSON in, JSON out, unless the tool's design says otherwise (e.g. a file download).
- JSON field names are camelCase, e.g. `expiresAt`.
- Request bodies above 4.49 MB are rejected by server-kit; Vercel itself rejects bodies above ~4.5 MB.
- The API has no i18n: every text it returns is English.

## Validation

- Every request body and query is validated with the tool's Zod schemas before the handler runs. Limits (size, count, time) are enforced.
- The schemas live in `tools/<slug>/shared/`, so the UI and API validate the same way. Types for API data come from them (`z.infer`), never written again by hand.

## Errors

- Body: `{ "code": string, "message": string }`.
- `code` is stable, `UPPER_SNAKE_CASE`, and listed in the tool's `openapi.yaml`. Clients rely on it.
- `message` is English, for developers; it never carries request content or internal details.
- Async errors reach the error handler; no unhandled promise rejections.

Answers from server-kit, the same in every tool:

| Case | Status | `code` |
|---|---|---|
| Unknown route | `404` | `NOT_FOUND` |
| Malformed JSON body | `400` | `INVALID_REQUEST` |
| Body over the server-kit limit | `413` | `PAYLOAD_TOO_LARGE` |
| Cron call without the right secret | `401` | `UNAUTHORIZED` |
| Unexpected failure | `500` | `INTERNAL_ERROR`; details only in logs |

Answers from the platform, without the JSON body; clients must handle them:

| Case | Status |
|---|---|
| WAF rate limit | `429` |
| Body above ~4.5 MB | `413` |

## Security and rate limit

- Cron routes use `requireCronSecret` from server-kit: `Authorization: Bearer $CRON_SECRET`, otherwise `401`.
- CORS is never opened to `*`. The UI calls its API on the same domain, so no CORS is needed.
- Rate limit per IP with Vercel WAF on `/api/*` ([ADR 0002](./decisions/0002_RATE_LIMIT_VERCEL_WAF.md)). A tool may add a stricter rule; its thresholds are set in the phase that builds it. Current rules are in [DEPLOY_RUNBOOK.md](../DEPLOY_RUNBOOK.md).
- Outbound requests have timeouts and size limits; user-provided URLs go through the SSRF guard.

## Logging

- One structured JSON line per request from server-kit: `requestId`, `method`, `path`, `status`, `durationMs`.
- Each response carries the request ID in the `x-request-id` header.
- Request and response bodies and user content are never logged.

## Clients (tool UI)

- A tool UI calls only its own `/api/tools/<slug>/…`, with relative URLs; never a hard-coded absolute URL.
- The UI's `api/` layer turns failures into error `code`s ([UI_CONVENTIONS.md](./UI_CONVENTIONS.md)).
- The UI shows API errors by `code`, translated in the tool's own i18n namespace. `429` and network failures use the Host's shared messages.

## Contract and tests

- Each tool describes its API, including every error `code`, in `tools/<slug>/docs/openapi.yaml`. It always matches the code and is updated in the same change.
- `pnpm generate-contracts` renders it to `/contracts/<slug>.html`, e.g. <http://localhost:5173/contracts/markdown-to-pdf.html>; the Host's dev and build scripts run it, and every deployment serves it.
- API tests live in `tools/<slug>/api/tests/*.test.ts` and cover success, validation errors and each documented error `code`. Services are tested without HTTP.
