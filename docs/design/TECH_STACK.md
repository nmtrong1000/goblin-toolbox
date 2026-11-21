# Tech stack: toolbox

Shared by every tool. *Verified* means it ran in spike 0001; the remaining choices are verified when first installed in Phase 2. A tool that adds libraries declares them in its own `tools/<slug>/package.json` and lists them in `tools/<slug>/docs/TECH_STACK.md`.

## Runtime and platform

| Area | Choice | Notes |
|---|---|---|---|
| Node.js | Node.js | Runtime for the app and API |
| Hosting | Vercel Hobby | CDN, one Function, Cron, WAF; storage per tool |
| Language | TypeScript | `tsc -b` checked in Phase 2 |
| Package manager | pnpm workspaces | `frontend`, `backend`, `tools/*` |

## Frontend

| Area | Choice |
|---|---|
| UI | React |
| Build | Vite |
| Routing | React Router |
| i18n | i18next + react-i18next |

## Backend

| Area | Choice |
|---|---|
| HTTP | Express | *verified* |
| Schema validation | Zod |

## Quality and tests

| Area | Choice |
|---|---|
| Lint | oxlint |
| Format | Prettier |
| Unit and integration tests | Vitest |
| HTTP tests against Express | supertest |
| UI tests | Playwright |
