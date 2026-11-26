# Tool contract

What every tool must provide so the Host can show it and Vercel can run it. The architecture is in [HLD.html](./HLD.html), the folder layout in [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md), API rules in [API_CONVENTIONS.md](./API_CONVENTIONS.md). A tool that meets this contract is added without changing Host code.

## Identity

- `slug`: lowercase kebab-case, unique, never changed after release, e.g. `markdown-to-pdf`. It is the package name suffix (`@goblin/tool-<slug>`), the i18n namespace and the path segment in every URL below.
- One tool = one folder `tools/<slug>/` = one UI remote + one API service. The UI and API of a tool always change together.

## Manifest

`tools/<slug>/manifest.json`, read by the Host's catalog build:

```json
{
  "slug": "<slug>",
  "name": { "en": "…", "vi": "…" },
  "description": { "en": "…", "vi": "…" },
  "keywords": ["…"],
  "remote": "/remotes/<slug>/remoteEntry.js",
  "icon": "/remotes/<slug>/icon.svg"
}
```

- Every user-facing field has both `en` and `vi`.
- `icon` is optional: the URL of a square SVG served by the tool's UI remote (put it in `ui/public/icon.svg`), drawn as a line icon on a 24 × 24 view box. Only its shape is used: the Host paints it in its own color through a CSS mask, so the SVG's colors do not matter. It must start with `/remotes/<slug>/` and end in `.svg`; the catalog build fails otherwise. Without it, or when it fails to load, the Host shows its default tool icon.
- The manifest does not say which vault the tool is in. Vault membership belongs to the Host (`host/catalog.config.json`).

## UI remote

| Rule | Value |
|---|---|
| Build | Static Vite build with Module Federation, served at `/remotes/<slug>/` (`base` set to that path) |
| Exposes | Exactly one module, `./Tool`: a React component with no required props |
| Code layout | `src/` follows [UI_CONVENTIONS.md](./UI_CONVENTIONS.md): `Tool.tsx` only wires i18n and styles and renders `pages/ToolPage.tsx` |
| Federation name | The slug with `-` replaced by `_` (`federationName()` in `@goblin/ui-kit/federation`) |
| Shared singletons | `sharedSingletons` from `@goblin/ui-kit/federation`: `react`, `react-dom`, `react-router-dom`, `i18next`, `react-i18next`, all from the Host; versions come from the workspace catalog |
| Routing | Renders inside the Host's `/tools/<slug>` page; may use nested routes under it, never routes outside it |
| i18n | Adds its strings to the shared i18next instance under the namespace `<slug>`, in `en` and `vi`; no hard-coded UI text |
| Styles | Uses `@goblin/ui-kit` tokens; every class is scoped (CSS modules or a `<slug>-` prefix; `common-` belongs to `@goblin/ui-kit`, so no tool slug is `common`); no global selectors on `html`, `body` or bare elements |

## API service

The API service, how the UI calls it and its `openapi.yaml` follow [API_CONVENTIONS.md](./API_CONVENTIONS.md).

## Shared code

- `tools/<slug>/shared/` exists only to share code between the tool's UI and API. What goes in is the tool's choice; code used by one side only stays in that side.
- A tool never imports another tool. Code needed by more than one tool moves to `packages/`.

## Docs and tests

| Item | Where |
|---|---|
| Requirements, tool NFRs, env vars, function settings | `tools/<slug>/README.md` |
| Design, decisions, spikes | `tools/<slug>/docs/` |
| API description | `tools/<slug>/docs/openapi.yaml`, per [API_CONVENTIONS.md](./API_CONVENTIONS.md) |
| Unit and API tests | `tests/*.test.ts` in `ui/`, `api/` and `shared/`, run by `pnpm test` (Vitest) |
| i18n key parity between `en` and `vi` | `ui/tests/i18n.test.ts` |
| UI flow test | `ui/tests/*.e2e.ts`, run by `pnpm test:ui` (Playwright) with the Host, the remote and the API running together |
