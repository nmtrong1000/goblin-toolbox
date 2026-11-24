# Project structure

How the repo maps onto the architecture in [HLD.html](./HLD.html): one Host, shared kits, and one folder per tool that produces a Tool UI Remote and a Tool API Service. Decision record: [ADR 0003](./decisions/0003_FEDERATED_TOOLS_SHARED_DEPLOY.md).

## Overall structure

```text
.
├── vercel.json              # Vercel Services: one entry per service, public route table, crons
├── host/                    # Host service: static Vite SPA, the only app users open
├── packages/
│   ├── ui-kit/              # design tokens and shared React components, shared with remotes
│   └── server-kit/          # Express app factory, middleware, error format for tool APIs
├── tools/
│   └── <slug>/              # one tool: UI remote + API service + its own docs
└── docs/
    ├── WORKFLOW.md          # phase process
    ├── phases/              # scope and tasks of each phase
    └── design/              # toolbox-wide design: HLD, NFR, visual design, decisions
```

| Folder | Becomes | Routed at |
|---|---|---|
| `host/` | Host service (static) | `/`, `/vaults/*`, `/tools/*`, `/catalog.json` |
| `tools/<slug>/ui/` | Tool UI Remote service (static) | `/remotes/<slug>/*` |
| `tools/<slug>/api/` | Tool API Service (one Vercel Function) | `/api/tools/<slug>/*`, `/api/cron/<slug>-*` |
| `packages/*` | Not deployed; bundled into the services that use them | — |

## Host

```text
host/
├── catalog.config.json      # vaults, which tool belongs to which vault, order
├── scripts/build-catalog    # merges tool manifests + catalog.config.json into catalog.json
└── src/
    ├── app/                 # shell, routes, pages (home search, vault, tool page)
    ├── federation/          # Remote Loader and shared-dependency setup
    ├── catalog/             # loads catalog.json
    ├── i18n/                # shell strings and the shared i18next instance
    └── styles/
```

The Host never imports a tool. It knows a tool only through `catalog.json`.

## Tool

```text
tools/<slug>/
├── README.md                # the tool's requirements
├── manifest.json            # slug, names (en, vi), keywords, remote URL
├── docs/                    # tool design, decisions, spikes, openapi.yaml
├── shared/                  # code used by both ui/ and api/, e.g. request schemas
├── ui/                      # Tool UI Remote
│   ├── vite.config.ts       # base /remotes/<slug>/, exposes ./Tool, shared singletons
│   └── src/
│       ├── Tool.tsx         # exposed entry the Host mounts
│       ├── components/
│       ├── api-client/      # calls /api/tools/<slug>, maps error codes to i18n
│       └── i18n/            # en, vi
└── api/                     # Tool API Service
    └── src/
        ├── index.ts         # service entry: createApp() from server-kit with this tool's routers
        ├── routes/          # HTTP layer: tool and cron routers, Zod validation, error mapping
        ├── services/        # business logic; never imports Express
        └── integrations/    # external systems: Blob, browsers, outbound HTTP
```

- A tool owns everything it needs: dependencies, function settings (memory, duration, bundled files), env vars and cron jobs. They are declared in the tool's `README.md` and the tool's service entry in `vercel.json`.
- A tool never imports another tool. Code needed by more than one tool goes into `packages/`.
- `ui/` and `api/` are separate services but one tool: they are always changed and reviewed together.

## Adding a tool

1. Create `tools/<slug>/` with the layout above.
2. Add its UI and API services and their routes to `vercel.json`.
3. Add the tool to a vault in `host/catalog.config.json`.
