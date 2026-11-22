# Project structure: toolbox

Covers the shared repo layout, packages, imports, Vercel configuration and local workflow. A tool's extra runtime needs (function settings, bundled files, storage, env vars, crons) are declared in `tools/<slug>/README.md` and merged into the shared config when the tool is built.

## Directory structure

```text
.
├── CLAUDE.md                        # rules for Claude, imports docs/WORKFLOW.md
├── .claude/                         # Claude Code settings and lint/format hook
├── README.md                        # created in Phase 2
├── package.json                     # root scripts, packageManager (pnpm), engines (Node), prettier config
├── pnpm-workspace.yaml              # frontend, backend, tools/*
├── tsconfig.json                    # shared compiler options + project references for tsc -b
├── .oxlintrc.json
├── vercel.json                      # build, SPA fallback, rewrite /api/* → api/index.ts, function config, crons
├── .gitignore
├── .github/workflows/ci.yml         # lint, type check, test, build
├── api/
│   └── index.ts                     # Vercel Function entrypoint; exports the Express app from backend/
├── frontend/                        # @goblin/web: React + Vite shell
│   ├── src/
│   │   ├── app/                     # shell and routing
│   │   ├── i18n/                    # en, vi, locale configuration
│   │   ├── styles/                  # global CSS and tokens.css from DESIGN.md
│   │   └── shared/                  # shared UI
│   └── dist/                        # build output, gitignored, served by Vercel CDN
├── backend/                         # @goblin/api: Express shell, API only
│   └── src/
│       ├── app.ts                   # creates the Express app, mounts middleware, health and tool routers
│       ├── tools.ts                 # list of tool routers to mount
│       ├── dev-server.ts            # runs Express locally
│       └── middleware/              # request id, logging, error format
├── tools/                           # one pnpm package per tool
│   └── markdown-to-pdf/             # @goblin/tool-markdown-to-pdf, requirements in README.md, design in docs/
│       ├── package.json             # exports ./ui, ./api; this tool's dependencies
│       └── src/                     # ui/, api/, shared/, i18n/
└── docs/
    ├── WORKFLOW.md                  # phase process, branches, commits, comments, imports, lint
    ├── phases/                      # description of each phase
    └── design/                      # Phase 1 output; shared architecture, visual design and NFR.md
```

## Packages (pnpm workspaces)

`pnpm-workspace.yaml` lists `frontend`, `backend`, `tools/*`. The root `package.json` pins pnpm with `"packageManager": "pnpm@12.21.0"`.

| Folder | Package name | Contents |
|---|---|---|
| `frontend/` | `@goblin/web` | React + Vite shell: layout, routing, i18n, shared UI |
| `backend/` | `@goblin/api` | Express shell: middleware, health, 404 and error handling, router mounting, `dev-server.ts` |
| `tools/<slug>/` | `@goblin/tool-<slug>` | one package per tool: UI, API, i18n, tool-internal shared code, its own dependencies |

A tool package's `package.json` exports three entry points:

| Export | Imported by | Contents |
|---|---|---|
| `./ui` | `frontend`, lazily | the tool page component and its i18n |
| `./api` | `backend` | an Express router to mount at `/api/tools/<slug>` |

Tool layout:

```text
tools/<slug>/
├── package.json        # name, exports, dependencies of this tool only
├── src/
│   ├── ui/             # React components
│   ├── api/            # Express router and server-side code
│   ├── shared/         # code used by both ui/ and api/ (e.g. schemas)
│   └── i18n/           # en.json, vi.json
└── test/
```

`backend/src/tools.ts` imports the API entry point of each tool that has an API. The frontend connects each tool UI to its route.

Rules:

- `frontend` and `backend` depend on tool packages with `workspace:*`.
- A tool package never depends on another tool package. Code needed by more than one tool is not shared yet; when it first happens, a shared package is designed then.
- Each package declares the dependencies it uses; pnpm's strict `node_modules` makes undeclared imports fail.

## Imports

- Inside every package: Node.js subpath imports, declared in that package's `package.json` as `"imports": { "#/*": "./src/*" }`, used as `import { x } from "#/api/router.js"`. Node resolves them at runtime (locally and in the Vercel Function), Vite resolves them for the browser, TypeScript resolves them with `moduleResolution: "bundler"` or `"nodenext"`. No relative `./` or `../` paths.
- Across packages: by package name and export, e.g. `@goblin/tool-<slug>/api`; never by a path into another package.
- Verified in Phase 2 (S3, S9): local dev, Vite build, and the Vercel Function. If one of them rejects `#/`, the fallback is decided then and [docs/WORKFLOW.md](../WORKFLOW.md), section "Import rules", is updated.

## Vercel

Base `vercel.json` (Phase 2):

```json
{
  "framework": null,
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "outputDirectory": "frontend/dist",
  "regions": ["sin1"],
  "functions": {
    "api/index.ts": { "includeFiles": "{backend/dist/**,tools/markdown-to-pdf/assets/**}", "memory": 2048, "maxDuration": 60 }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- `api/index.ts` only re-exports the Express app from `@goblin/api`.
- `pnpm build` bundles the backend source into `backend/dist/app.cjs` before building the frontend. The local API runner still uses TypeScript source through `tsx`.
- Static files are matched before rewrites, so the SPA fallback only catches unknown paths.
- `functions["api/index.ts"]`: memory and `maxDuration` take the largest value any tool declares. The bundled CommonJS app is included with `includeFiles`; tool API code and its dependencies are bundled into it. Current values are in section "Current function settings".
- `crons`: one entry per tool job, path `/api/cron/<slug>-<job>`.
- `regions`: one region for the whole function. Phase 2 measured the health endpoint in `iad1` and `sin1`; `sin1` is selected for the Vietnam audience.
- Env vars: `CRON_SECRET` (shared) plus whatever each tool declares. Local values come from `vercel env pull .env.local` (gitignored).

## Current function settings

| Setting | Value | Required by |
|---|---|---|
| memory | 2048 MB | Markdown-to-PDF Chromium renderer |
| `maxDuration` | 60 seconds | Markdown-to-PDF rendering |
| `includeFiles` | `backend/dist/**`, `tools/markdown-to-pdf/assets/**` | Bundled Express app and renderer |
| `regions` | `sin1` | Lower measured health latency for the Vietnam audience |

Updated by the phase that builds a tool that needs more.

## Scaling limit of one function

Every tool's API code and dependencies end up in the one Vercel Function, so its bundle size (Vercel limit 250 MB) grows with each tool. The function's size is checked on every deploy. When it approaches the limit, or one tool's needs (memory, duration) burden the rest, tools are split into several functions, each with its own entry file mounting a group of tool routers; the API paths stay the same. This is decided then, not now.

## Local workflow

1. Node.js 26.x LTS (`engines` in `package.json`), `corepack enable`, `pnpm install`.
2. `vercel env pull .env.local` when a tool needs env vars.
3. `pnpm dev`: Vite on `:5173` with `/api` proxied to Express on `:3000`.
4. `pnpm build && pnpm preview`: the built frontend with the same proxy, to check deep links and the SPA fallback.
