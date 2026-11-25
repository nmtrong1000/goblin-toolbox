# Project structure

How the repo maps onto the architecture in [HLD.html](./HLD.html): one Host, shared kits, and one folder per tool that produces a Tool UI Remote and a Tool API Service. Decision record: [ADR 0003](./decisions/0003_FEDERATED_TOOLS_SHARED_DEPLOY.md).

## Overall structure

```text
.
├── vercel.json              # Vercel Services: one entry per service, public route table, crons
├── host/                    # Host service: static Vite SPA, the only app users open
├── packages/
│   ├── ui-kit/              # design tokens and the Module Federation settings shared by Host and remotes
│   └── server-kit/          # Express app factory, middleware, error format for tool APIs
├── scripts/
│   └── new-tool.mjs         # pnpm new-tool <slug>: creates a tool and registers its services
├── tools/
│   └── <slug>/              # one tool: UI remote + API service + its own docs
└── docs/
    ├── WORKFLOW.md          # phase process
    ├── phases/              # scope and tasks of each phase
    └── design/              # toolbox-wide design: HLD, NFR, visual design, decisions
```

| Folder | Becomes | Routed at |
|---|---|---|
| `host/` | Host service (static) | `/`, `/vaults/*`, `/tools/*`, `/catalog.json`, `/contracts/<slug>.html` |
| `tools/<slug>/ui/` | Tool UI Remote service (static) | `/remotes/<slug>/*` |
| `tools/<slug>/api/` | Tool API Service (one Vercel Function) | `/api/tools/<slug>/*`, `/api/cron/<slug>-*` |
| `packages/*` | Not deployed; bundled into the services that use them | — |

## Host

```text
host/
├── catalog.config.json      # vaults, which tool belongs to which vault, order
├── scripts/
│   ├── build-catalog        # merges tool manifests + catalog.config.json into catalog.json
│   └── generate-contracts   # renders each tool's openapi.yaml to public/contracts/<slug>.html
├── src/                     # layout inside src/: UI_CONVENTIONS.md
│   ├── app/                 # route table and layout
│   ├── pages/               # home search, vault, tool page, not found
│   ├── components/          # UI used by several pages
│   ├── catalog/             # loads catalog.json, search
│   ├── federation/          # Remote Loader
│   ├── i18n/                # shell strings and the shared i18next instance
│   └── styles/
└── tests/                   # *.test.ts (Vitest), *.e2e.ts (Playwright)
```

The Host never imports a tool. It knows a tool only through `catalog.json`.

## Tool

```text
tools/<slug>/
├── README.md                # the tool's requirements
├── manifest.json            # slug, names (en, vi), keywords, remote URL
├── docs/                    # tool design, decisions, spikes, openapi.yaml
├── shared/                  # only code that both ui/ and api/ use
├── ui/                      # Tool UI Remote
│   ├── vite.config.ts       # base /remotes/<slug>/, exposes ./Tool, shared singletons
│   ├── src/                 # layout inside src/: UI_CONVENTIONS.md
│   │   ├── Tool.tsx         # exposed entry the Host mounts; renders pages/ToolPage.tsx
│   │   └── i18n/            # en, vi
│   └── tests/               # *.test.ts (Vitest), *.e2e.ts (Playwright)
└── api/                     # Tool API Service
    ├── src/
    │   ├── index.ts         # service entrypoint in vercel.json: createApp() from server-kit
    │   ├── dev-server.ts    # local runner used by vercel dev
    │   ├── routes/          # HTTP layer: tool and cron routers, Zod validation, error mapping
    │   ├── services/        # business logic; never imports Express
    │   └── integrations/    # external systems: Blob, browsers, outbound HTTP
    └── tests/               # *.test.ts (Vitest)
```

- A tool owns everything it needs: dependencies, function settings (duration, bundled files), env vars and cron jobs. They are declared in the tool's `README.md` and the tool's service entry in `vercel.json`.
- A tool never imports another tool. Code needed by more than one tool goes into `packages/`.
- `ui/` and `api/` are separate services but one tool: they are always changed and reviewed together.

## Adding a tool

1. `pnpm new-tool <slug>` creates `tools/<slug>/` with the layout above, adds its UI and API services and routes to `vercel.json`, and adds its lint override to `.oxlintrc.json`.
2. `pnpm install`.
3. Add the tool to a vault in `host/catalog.config.json`.
