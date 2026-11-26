---
id: adr-0001
status: accepted
date: 2026-11-21
superseded_by: adr-0003
superseded_scope: deployment model (one function for every tool)
---

# ADR 0001: Node.js + Express backend

## Context

The backend runs on Vercel as one function hosting every tool's API. Tools may need heavy runtime pieces such as a headless browser; Node.js has the best-supported serverless options for those (e.g. `@sparticuz/chromium`), Python on Vercel does not. Each tool's API is a small router.

## Decision

Use Node.js with Express, written in TypeScript. One Express app holds every tool's router and runs as a single Vercel Function.

## Alternatives

- **Python (FastAPI) on Vercel:** rejected; no well-supported serverless headless browser.
- **NestJS:** rejected; DI and modules are overhead for small routers and add cold-start time.

## Consequences

- Frontend, shared packages and backend share one language and one toolchain (TypeScript, oxlint, Prettier).
- A tool's UI and API live in one package and can share code such as schemas.
- Spike 0001 confirmed Express works as a Vercel Function default export with the original request path preserved.
