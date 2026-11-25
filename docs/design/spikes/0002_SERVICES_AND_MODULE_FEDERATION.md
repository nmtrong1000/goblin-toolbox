# Spike 0002: Vercel Services and Module Federation

- **Phase:** P5, task F0
- **Date:** 2026-11-24
- **Decision:** go. Keep the architecture in [ADR 0003](../decisions/0003_FEDERATED_TOOLS_SHARED_DEPLOY.md), with the adjustments below. The fallback is not needed.

## Setup

A throwaway pnpm workspace with the target layout, deployed as previews of the `goblin-toolbox` project with Vercel CLI 66.6.0 (`npx vercel@latest`):

- `host/`: Vite + React SPA, `@module-federation/vite` 1.25.0 host with no static remotes. It reads `catalog.json` and loads a remote at runtime with `registerRemotes` and `loadRemote` from `@module-federation/runtime`.
- `tools/demo/ui/`: Vite MF remote, `base: '/remotes/demo/'`, output in `dist/remotes/demo/`, exposes `./Tool`.
- `tools/demo/api/` and `tools/light/api/`: Express services built with `createApp()` from a `workspace:*` package.
- `pnpm-workspace.yaml` `catalog:` for React 19, React Router 7, i18next 25, react-i18next 15.

## Results

| Check | Result |
|---|---|
| Services on Hobby | Accepted; up to 100 services per deployment (Build Output API docs). Each Express service became its own function in `sin1` (~480 KB). |
| Build | 15–23 s for 4 services. One root `pnpm install` from the lockfile with pnpm 12.21.0; each service then installs in ~12 ms. |
| `workspace:*` across service roots | Works for both API services. |
| Routing | Ordered top-level rewrites to services work. Each service sees the original path (`/api/tools/demo/echo`). Unknown API paths return the service's JSON 404. |
| Static remote under a prefix | Works when the build output itself lives under `remotes/<slug>/`. |
| SPA fallback | Works on Vercel. Must be scoped to page routes (`/vaults/:path*`, `/tools/:path*`): a catch-all rewrite to `/index.html` breaks the Vite dev server under `vercel dev`. |
| Cache headers | Service `headers` give hashed remote chunks `immutable`; `remoteEntry.js` keeps `max-age=0`. |
| MF singletons, production build | React, i18next and the React Router context are the Host's instances; the remote downloads no React code; the remote's strings live in the shared i18next. |
| MF singletons, `vercel dev` | Same result. |
| Broken remote | The Host shows its error state; the shell stays. |
| API from remote | Relative `fetch('/api/tools/demo/echo')` works with no CORS. |
| `maxDuration` per service | Works: a 35 s request returned 504 on the service set to 30 s and 200 on the default (300 s). |
| Memory per service | Not possible. Both services ran with a 2 GiB cgroup limit even with `memory: 3009` set. Vercel docs: Hobby always runs 2 GB / 1 vCPU and cannot change it; memory cannot be set in `vercel.json`; Pro sets one size per project in the dashboard. |
| Cron | A top-level `crons` entry pointing at a service path deploys without error. Crons run only on production, so the call itself is checked in F11. |
| Local dev | `vercel dev --local` (CLI 66) runs all services together. The installed global CLI is 54.14.2. |

## Adjustments to the design

1. **No per-tool memory.** A tool's own function settings are `maxDuration`, bundled files, env vars and cron. Docs that promised per-tool memory are corrected.
2. **Disable MF type generation** with `dts: false` in every federation config. The DTS plugin crashes `vercel dev` with TypeScript 7 in the tree, and the project keeps its own types.
3. **Scope the Host SPA fallback** to page routes, not `/(.*)`.
4. **Remote build output** goes to `dist/remotes/<slug>/` with `base: '/remotes/<slug>/'`; the service's `outputDirectory` is `dist`.
5. **Package granularity:** each service root is its own package (`tools/<slug>/ui`, `tools/<slug>/api`, and `tools/<slug>/shared` when a tool has shared code). The oxlint cross-tool rule must then allow a tool's own `@goblin/tool-<slug>-*` packages; `pnpm new-tool` adds that per-tool override.
6. **Pin the Vercel CLI** as a root dev dependency so `vercel dev` with Services works without relying on the global install.
