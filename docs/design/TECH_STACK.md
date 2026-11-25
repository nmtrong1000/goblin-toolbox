# Tech stack: toolbox

Shared by every tool. *Verified* means it ran in spike 0001; the remaining choices are verified when first installed in Phase 2. A tool that adds libraries declares them in its own `tools/<slug>/package.json` and lists them in `tools/<slug>/docs/TECH_STACK.md`.

## Runtime and platform

| Area | Choice | Notes |
|---|---|---|---|
| Node.js | Node.js | Runtime for the app and API |
| Hosting | Vercel Hobby, Vercel Services (beta) | One project: static Host and tool remotes, one function per tool API, Cron, WAF; storage per tool |
| Language | TypeScript 7 | `tsc --noEmit` per package; 7 is the first version that resolves `#/` subpath imports |
| Package manager | pnpm workspaces + catalog | `host`, `packages/*`, `tools/*/{ui,api,shared}`; shared versions in the `catalog:` of `pnpm-workspace.yaml` |
| Local dev | Vercel CLI (`vercel dev`) | Pinned as a root dev dependency; runs every service locally |

## Frontend

| Area | Choice |
|---|---|
| UI | React |
| Build | Vite |
| Routing | React Router |
| Micro-frontends | Module Federation (`@module-federation/vite`, `@module-federation/runtime`) |
| i18n | i18next + react-i18next |

## Backend

| Area | Choice |
|---|---|
| HTTP | Express, through `@goblin/server-kit` | *verified* |
| Schema validation | Zod |

## Quality and tests

| Area | Choice |
|---|---|
| Lint | oxlint |
| Format | Prettier |
| Unit and integration tests | Vitest |
| HTTP tests against Express | supertest |
| UI tests | Playwright |
