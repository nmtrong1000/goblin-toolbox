# Goblin Toolbox

Goblin Toolbox is a web app made of several **vaults**. Each vault groups **tools** on the same topic. Each tool has its own UI for direct use and its own API for other systems to call.

The MVP has one tool: **Markdown to PDF**.

## Shared functional requirements

- The home page searches tools; choosing a tool opens the tool's own page.
- A vault page lists the tools in that vault.
- i18n in English and Vietnamese **for the UI only**; more locales can be added later. The API has no i18n.
- Adding a new tool does not require changing the app shell.

## Documents

| Topic | Where |
|---|---|
| Shared non-functional requirements | [docs/design/NFR.md](docs/design/NFR.md) |
| Phase plans | [P1](docs/phases/P1_DESIGN.md), [P2](docs/phases/P2_SCAFFOLD_AND_DEPLOY.md), [P3](docs/phases/P3_BUILD_MARKDOWN_TO_PDF.md), [P4](docs/phases/P4_DEPLOY_TOOL.md) |
| How each phase runs | [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| Toolbox design | [docs/design/HLD.html](docs/design/HLD.html) |
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
pnpm dev
```

The frontend runs at <http://localhost:5173>. Vite proxies `/api/*` to the Express server on port 3000. The health endpoint is available at <http://localhost:5173/api/health>.

To check the production build locally:

```sh
pnpm build
pnpm preview
```

Vite preview runs at <http://localhost:4173> and keeps the API proxy enabled. Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and `pnpm test` before opening a pull request.
