# UI conventions

How React code is split into files and folders in the Host and in every Tool UI Remote. The repo layout above `src/` is in [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md); what a remote must expose is in [TOOL_CONTRACT.md](./TOOL_CONTRACT.md).

## Layers

Each piece of UI code belongs to exactly one layer. A layer may import only the layers below it in this table.

| Layer | Role | Does | Never does |
|---|---|---|---|
| Entry | `main.tsx`, `bootstrap.tsx` in the Host; `Tool.tsx` in a remote | Wires things together: providers, i18n bundles, styles, the first page | Holds state, markup or logic |
| App (Host only) | `app/`: route table, layout | Lists routes; renders the frame around pages | Holds the UI of one page |
| Page | `pages/`: one screen, one route | Owns the screen's state, calls hooks, composes components | Calls `fetch`; holds long blocks of markup |
| Component | `components/`: UI | Renders props, raises events through callbacks, uses `t()` | Fetches, reads the router, owns business state |
| Hook | `hooks/`, `useXxx.ts` | Stateful logic: `useState`, `useEffect`, calls into `api/` and `lib/` | Returns JSX |
| API client | `api/` | Calls the tool's own REST API; turns failures into error `code`s | Imports React |
| Lib | `lib/` | Pure functions and small DOM helpers | Imports React |

## Folders

```text
host/src/                          tools/<slug>/ui/src/
├── main.tsx, bootstrap.tsx        ├── Tool.tsx          # federation entry
├── app/                           ├── pages/
│   ├── router.tsx                 │   └── ToolPage.tsx
│   └── AppLayout.tsx              ├── components/
├── pages/                         ├── hooks/
├── components/                    ├── api/
├── hooks/                         ├── lib/
├── catalog/      # feature        ├── i18n/             # en.ts, vi.ts
├── federation/   # feature        └── styles/
├── i18n/
└── styles/
```

- A Tool UI Remote is one feature, so its `src/` is split by layer.
- The Host also has feature folders (`catalog/`, `federation/`) for capabilities that pages use but that are not UI. Files inside a feature folder stay flat; the file name shows the layer.
- Create a folder only when it has a file. An empty layer is left out.

## Files and names

File and folder names follow [WORKFLOW.md](../WORKFLOW.md), section "File and folder naming". For UI code:

| Kind | File name | Export |
|---|---|---|
| Component or page | `PascalCase.tsx`, same as the component | Named export; a remote's `Tool.tsx` also has the default export the Host loads |
| Hook | `useCamelCase.ts` | Named export |
| Other module | `camelCase.ts` | Named exports |

- One component per file. No second component in the same file, not even a small private one (lint: `react/no-multi-comp`).
- Props are typed with a `XxxProps` type in the same file.
- A type shared by several files lives next to the code that owns it, e.g. `catalog/types.ts`.

## When to split

Split as soon as one of these is true:

- A file passes 150 lines; lint stops it at 200 (`max-lines`).
- A component keeps more than 3 related pieces of state or effects: move them into a hook.
- A block of markup has a clear name of its own (toolbar, panel, form, list): make it a component.
- The same markup appears a second time: make it a component.
- A function does not need React: move it to `lib/` or `api/`.

Do not split code that is used once and short enough to read in place; a split must give a name to something.

## Where code lives

- Start next to the code that uses it.
- Move it up to `src/components/` or `src/hooks/` of the same package when two pages use it.
- When a tool builds a component, hook or helper that another tool could use, the agent asks the user whether it goes into `packages/ui-kit`: during PLANNING, or as soon as it is spotted in IMPLEMENTATION. The answer is recorded under `## Decisions` in the phase file. Without a yes it stays in the tool.
- Code in `packages/ui-kit` never imports a tool, never calls `t()` (all text comes in as props) and styles only `common-` classes with design tokens.
- ui-kit modules are imported by layer and name, e.g. `@goblin/ui-kit/hooks/useDismiss`, `@goblin/ui-kit/components/Drawer`, `@goblin/ui-kit/styles/common.css`.

## State and data

- State lives in the lowest component that needs it. A page owns the state its components share.
- Pass state down at most two levels. Deeper than that, use a context scoped to the feature, never a global one.
- Derived values are computed during render, not copied into state.
- Every async call handles loading, empty and error states, and cancels on unmount.

## Entry files

- `Tool.tsx` registers the tool's i18n bundles, imports its styles and renders `<ToolPage />`. Nothing else.
- `host/src/app/router.tsx` contains only the route table.
- `pnpm new-tool` creates this layout.

## Enforcement

- oxlint (`.oxlintrc.json`) runs the React plugin on every `.tsx` file in `host/src`, `tools/*/ui/src` and `packages/*/src`, with `react/no-multi-comp` and `max-lines` (200, blank lines and comments not counted).
- Layers, names, split points and state placement are checked in REVIEW ([REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), section React.js).
