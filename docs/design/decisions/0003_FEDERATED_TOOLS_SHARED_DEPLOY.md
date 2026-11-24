# ADR 0003: Tools as federated UI remotes and API services, deployed together

- **Status:** accepted
- **Date:** 2026-11-24

## Context

Until Phase 4 the toolbox was one SPA that imported every tool's UI at build time and one Vercel Function that mounted every tool's Express router. The first tool, Markdown to PDF, needs Chromium, 2048 MB and 60 seconds, so every tool inherited those settings and that bundle. Adding a tool also meant editing the shell in several places: the UI registry, the router list, shell i18n strings, `vercel.json` and the root build scripts.

Tools should be self-contained units, and the toolbox should not change when a tool is added.

## Decision

- **Host:** one static Vite SPA owns the shell, search, vault pages, i18n and the shared dependencies. Users only open Host pages.
- **Tool UI Remote:** each tool builds its UI as a static Module Federation remote at `/remotes/<slug>/`. The Host loads it at runtime and mounts its exposed `./Tool` component. React, React Router, i18next and the UI kit are shared singletons provided by the Host.
- **Tool API Service:** each tool runs its API as its own Express service in its own Vercel Function at `/api/tools/<slug>/`, with its own memory, duration, bundled files and cron routes. Shared middleware lives in `@goblin/server-kit`.
- **Catalog:** each tool declares a manifest; vault membership is kept in the Host's vault config. Both are merged into a static `catalog.json` at build time. No catalog backend and no admin dashboard.
- **Deployment:** for now everything is in one Vercel project using Vercel Services and ships in one deployment. A tool's UI remote and API service are grouped as one tool package so that the tool can later move to its own project and deploy independently.

## Alternatives

- **Keep the monolith (one SPA with lazy imports, one function):** simplest, but every tool keeps paying for the heaviest tool, and adding a tool keeps touching the shell.
- **Lazy imports plus one function per tool, no Module Federation:** solves resource isolation and could also generate the registry, but the Host keeps importing tool code at build time and the path to independent deploys is longer. Kept as the fallback if Module Federation fails the spike.
- **Deploy each tool independently now (one project per tool, Vercel Microfrontends):** gives per-tool deploys and rollbacks, but needs a runtime catalog, a versioning rule for shared dependencies and a rewrite of the rollback requirement in NFR. Deferred until there are enough tools, or tool owners, to need it.

## Consequences

- Each tool API gets its own function settings; a heavy tool no longer sets limits for light ones.
- Adding a tool needs only its package, its manifest and one vault-config entry; the Host's code does not change.
- Host, remotes and APIs always roll back together, so the NFR rollback requirement stays as it is.
- Module Federation's independent deploys are not used yet; the cost is paid now for a clean boundary and an easy split later.
- Shared dependency versions must match between the Host and every remote; mismatches show up at runtime.
- Opening a tool needs two extra requests (`catalog.json`, `remoteEntry.js`).
- Vercel Services is in beta. A spike must confirm Hobby limits, pnpm workspace builds per service, Module Federation with the shared singletons, and local development before migration starts. If Services fails, fall back to one project without Services and one function per tool.
