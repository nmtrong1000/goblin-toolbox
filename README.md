# Goblin Toolbox

Goblin Toolbox is a web app made of several **vaults**. Each vault groups **tools** on the same topic. Each tool has its own UI for direct use and its own API for other systems to call.

The MVP has one tool: **Markdown to PDF**.

## Shared functional requirements

- The home page searches tools; choosing a tool opens the tool's own page.
- A vault page lists the tools in that vault.
- i18n in English and Vietnamese **for the UI only**; more locales can be added later.
- Adding a new tool does not require changing the app shell.

## Documents

| Topic | Where |
|---|---|
| Shared non-functional requirements | [docs/design/NFR.md](docs/design/NFR.md) |
| Phase plans | [P1](docs/phases/P1_DESIGN.md), [P2](docs/phases/P2_SCAFFOLD_AND_DEPLOY.md), [P3](docs/phases/P3_BUILD_MARKDOWN_TO_PDF.md), [P4](docs/phases/P4_DEPLOY_TOOL.md), [P5](docs/phases/P5_FEDERATED_TOOLS.md) |
| How each phase runs | [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| Toolbox design | [docs/design/HLD.html](docs/design/HLD.html), [docs/design/PROJECT_STRUCTURE.md](docs/design/PROJECT_STRUCTURE.md) |
| What a tool must provide | [docs/design/TOOL_CONTRACT.md](docs/design/TOOL_CONTRACT.md) |
| API conventions | [docs/design/API_CONVENTIONS.md](docs/design/API_CONVENTIONS.md) |
| How UI code is split | [docs/design/UI_CONVENTIONS.md](docs/design/UI_CONVENTIONS.md) |
| Deploy, environment, cron, logs, rollback | [docs/DEPLOY_RUNBOOK.md](docs/DEPLOY_RUNBOOK.md) |
| Shared visual design system | [docs/design/DESIGN.md](docs/design/DESIGN.md) |
| Tool requirements | `tools/<slug>/README.md`, e.g. [Markdown to PDF](tools/markdown-to-pdf/README.md) |
| Tool documents | `tools/<slug>/docs/`, e.g. `tools/markdown-to-pdf/docs/` |

## Requirements

- Node.js 26.x (LTS)
- pnpm 12.21.0 (Corepack can activate the pinned version)

## Setup and local development

```sh
corepack enable
pnpm install
pnpm start
```

`pnpm start` runs `vercel dev --local`, which starts every service in `vercel.json` (the Host, each tool's UI remote and API service) behind one address: <http://localhost:5173>. Each API service has its own health endpoint, e.g. <http://localhost:5173/api/tools/markdown-to-pdf/health>.

`pnpm build` builds every service. Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm test:ui` before opening a pull request.

## Adding a tool

```sh
pnpm new-tool <slug>
pnpm install
```

The script creates `tools/<slug>/` per [docs/design/TOOL_CONTRACT.md](docs/design/TOOL_CONTRACT.md) and adds its services to `vercel.json`. Then add the tool to a vault in `host/catalog.config.json`.
