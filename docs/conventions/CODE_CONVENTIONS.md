# Code conventions

Rules for every file in `host`, `packages/*` and `tools/*`.

## File and folder naming

| What | Case | Example |
| :---- | :---- | :---- |
| TypeScript, JavaScript and CSS files | camelCase | `blobStorage.ts`, `buildCatalog.mjs`, `tokens.css` |
| React component files | PascalCase, same as the component | `MobileViewSwitch.tsx` |
| Other `.tsx` files (entry, route table) | camelCase | `main.tsx`, `router.tsx` |
| Markdown files | UPPERCASE_UNDERSCORE | `0001_NODE_EXPRESS_BACKEND.md`, `P1_DESIGN.md` |
| Documents in `docs/` in another format | UPPERCASE_UNDERSCORE | `HLD.html` |
| Other HTML files and any file served at a URL (images, fonts) | hyphen-case | `markdown-to-pdf.html` |
| JSON and YAML files we name | camelCase | `manifest.json`, `openapi.yaml` |
| Python files | snake_case (PEP 8) | `block_secrets.py` |
| Folders | hyphen-case | `ui-kit`, `markdown-to-pdf` |

- The case applies to the name before the last dot-separated suffixes: `searchTools.test.ts`, `tool.e2e.ts`, `types.d.ts`, `catalog.config.json`.
- Acronyms are written as words: `pdfRenderer.ts`, `requestId.ts`, `usePreviewHtml.ts`, not `PDFRenderer.ts`.
- Names fixed by a tool or a convention stay as they are: `package.json`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `vercel.json`, `.oxlintrc.json`, `.github/workflows/*.yml`, `index.html`, `README.md`, `AGENTS.md`, `CLAUDE.md`.
- Names that are not files keep their own rules: package names, tool slugs, URL paths, pnpm script names and CSS classes are hyphen-case (`@goblin/ui-kit`, `pnpm new-tool`, `mdpdf-toolbar`).
- oxlint (`unicorn/filename-case`) enforces the TypeScript, JavaScript and component rules; the rest is checked in REVIEW.

## Comment and language rules

- Applies to every file except `.md`: source code, tests, scripts, config, `.gitignore`, `.env.example`.
- Comments go only at the top of a file, in one header block. No comments between lines of code: no end-of-line comments, no JSDoc on functions or classes, no JSX `{/* */}` comments, no `// eslint-disable` or `// oxlint-disable`.
- Required first lines such as a `#!` shebang stay on line 1; the header goes right after. JSON files have no comments.
- Comments are written in English.
- Comment only when the code cannot speak for itself, i.e. to answer "why" or to warn about something easy to break:
  - A technical limit not visible from the code, e.g. `@sparticuz/chromium` only runs on Linux.
  - A security or privacy decision that looks like dead code, e.g. re-checking the IP after every redirect in the Request Guard.
  - A contract between modules that the function signature does not show, e.g. the Markdown Renderer must behave the same in the browser and in Chromium.
  - A data format or trick that is easy to delete by mistake, e.g. an import that only registers a tool's router.
  - How to use a script or config file.
- Do not comment to:
  - Describe what a file does when the file and function names already say it.
  - Narrate the code, e.g. list function names.
  - Record plans or change history; those belong in the requirement documents, `docs/phases/` and git.
  - Repeat content already in `docs/design/` or other documents.
  - Summarize a test when its name already says enough.
- System messages are in English: exceptions, config errors, CLI and script output, logs.
- User-facing UI text always goes through i18n (`en`, `vi`); never hard-code strings in components.
- API language and error rules are in [API_CONVENTIONS.md](./API_CONVENTIONS.md).

## Import rules

- Inside every package (`host`, `packages/*`, and `tools/<slug>/ui`, `api`, `shared`): imports of the package's own files use Node.js subpath imports `#/`, declared in that package's `package.json` as `"imports": { "#/*": "./src/*" }`, with the real file extension, e.g. `#/shared/components/index.ts`, including `@import` in CSS. No relative `./` or `../` paths.
- Other packages are imported by package name and export, e.g. `@goblin/server-kit`, never by a path into the package folder.
- The Host never imports a tool package; it reaches tools only through `catalog.json` and Module Federation.
- A tool package never imports another tool's packages; it may import its own `@goblin/tool-<slug>-*` packages.
- oxlint enforces the relative-path, Host and cross-tool rules (`no-restricted-imports` in `.oxlintrc.json`, with one override per tool added by `pnpm new-tool`); CSS `@import` is checked in review.

## Tests

- Every package keeps its tests in one `tests/` folder next to `src/`; no other test folders.
- `*.test.ts` files run with Vitest (`pnpm test`); `*.e2e.ts` files run with Playwright on the full stack (`pnpm test:ui`).

## Lint and format

| Scope | Lint | Format | Type check | Config |
| :---- | :---- | :---- | :---- | :---- |
| `host`, `packages/*`, `tools/*` | `pnpm lint` (oxlint) | `pnpm format` (Prettier) | `pnpm typecheck` (`tsc --noEmit` in every package) | `.oxlintrc.json` and the `prettier` key in `package.json`, at the repo root |

- The Claude Code Stop hook (`.claude/settings.json`, script `.claude/hooks/lint_format.py`) runs automatically when the agent finishes a turn: it fixes lint and formatting in every file changed in git, skipping what `.prettierignore` and the oxlint `ignorePatterns` exclude. If lint errors cannot be fixed automatically, the hook hands them back to the agent once, then only reports them to the user.
- The hook does nothing when oxlint and Prettier are not installed at the repo root.
- `.md` files are not formatted.
