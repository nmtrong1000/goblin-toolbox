# Tool contract

What every tool must provide so the Host can show it and Vercel can run it. The architecture is in [HLD.html](./HLD.html), the folder layout in [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md). A tool that meets this contract is added without changing Host code.

## Identity

- `slug`: lowercase kebab-case, unique, never changed after release, e.g. `markdown-to-pdf`. It is the package name suffix (`@goblin/tool-<slug>`), the i18n namespace and the path segment in every URL below.
- One tool = one folder `tools/<slug>/` = one UI remote + one API service. The UI and API of a tool always change together.

## Manifest

`tools/<slug>/manifest.json`, read by the Host's catalog build:

```json
{
  "slug": "<slug>",
  "name": { "en": "…", "vi": "…" },
  "description": { "en": "…", "vi": "…" },
  "keywords": ["…"],
  "remote": "/remotes/<slug>/remoteEntry.js"
}
```

- Every user-facing field has both `en` and `vi`.
- The manifest does not say which vault the tool is in. Vault membership belongs to the Host (`host/catalog.config.json`).

## UI remote

| Rule | Value |
|---|---|
| Build | Static Vite build with Module Federation, served at `/remotes/<slug>/` (`base` set to that path) |
| Exposes | Exactly one module, `./Tool`: a React component with no required props |
| Shared singletons | `react`, `react-dom`, `react-router`, `i18next`, `react-i18next`, `@goblin/ui-kit`, all from the Host; versions come from the workspace catalog |
| Routing | Renders inside the Host's `/tools/<slug>` page; may use nested routes under it, never routes outside it |
| i18n | Adds its strings to the shared i18next instance under the namespace `<slug>`, in `en` and `vi`; no hard-coded UI text |
| Styles | Uses `@goblin/ui-kit` tokens; every class is scoped (CSS modules or a `<slug>-` prefix); no global selectors on `html`, `body` or bare elements |
| API calls | Only to its own `/api/tools/<slug>/…`, with relative URLs |
| Errors | Shows API errors by `code`, translated in its own namespace; 429 and network failures use the Host's shared messages |

## API service

| Rule | Value |
|---|---|
| Runtime | One Express app in one Vercel Function, built with `createApp()` from `@goblin/server-kit` |
| Layers | `routes/` → `services/` → `integrations/`. Routes handle HTTP only: validation, calling a service, mapping results and errors. Services hold the business logic and never import Express. Integrations wrap external systems (Blob, browsers, outbound HTTP). A layer only calls the layer below it. |
| Paths | `/api/tools/<slug>/…` for the API; `/api/cron/<slug>-<job>` for scheduled jobs |
| Format | JSON in, JSON out, unless the tool's design says otherwise (e.g. a file download) |
| Validation | Every request body and query is validated with the tool's Zod schemas before the handler runs |
| Errors | `{ "code": string, "message": string }`; `code` is stable and listed in `openapi.yaml`; `message` is English |
| Unknown routes | `404` with `code: "NOT_FOUND"` (server-kit) |
| Unexpected failures | `500` with `code: "INTERNAL_ERROR"`; details only in logs (server-kit) |
| Platform answers | `429` from the WAF and `413` above ~4.5 MB come from Vercel without the JSON body; clients must handle them |
| Cron | Requires `Authorization: Bearer $CRON_SECRET` |
| Logging | One structured line per request (method, path, status, duration, request id) from server-kit; never bodies or user content |
| Function settings | Memory, `maxDuration`, bundled files, env vars and crons are declared in the tool's service entry in `vercel.json` and in the tool README |

## Shared code

- `tools/<slug>/shared/` holds what both sides need, mainly request and response schemas. The UI and API import the same schemas, so their types always match.
- A tool never imports another tool. Code needed by more than one tool moves to `packages/`.

## Docs and tests

| Item | Where |
|---|---|
| Requirements, tool NFRs, env vars, function settings | `tools/<slug>/README.md` |
| Design, decisions, spikes | `tools/<slug>/docs/` |
| API description, including every error `code` | `tools/<slug>/docs/openapi.yaml` |
| Unit and API tests | `tools/<slug>/` tests, run by `pnpm test` |
| i18n key parity between `en` and `vi` | A test in the tool |
| UI flow test | Playwright, with the Host, the remote and the API running together |
