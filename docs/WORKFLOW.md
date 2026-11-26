# PHASE WORKFLOW

This workflow applies to every phase of Goblin Toolbox. Shared functional requirements live in the root [README.md](../README.md), shared non-functional requirements in [docs/design/NFR.md](./design/NFR.md), tool requirements in `tools/<slug>/README.md`, and phase scope and tasks in `docs/phases/`. After IMPLEMENTATION come three loops in sequence, each with its own RESOLVE FEEDBACK step and a maximum number of rounds: TESTING (2 rounds), REVIEW done by the agent itself (2 rounds), HUMAN REVIEW (2 rounds).

## Diagram

```mermaid
flowchart TD
    P[PLANNING] -->|User approves the plan| D[DESIGN]
    D --> I[IMPLEMENTATION]
    I --> T

    subgraph LT[TESTING loop, max 2 rounds]
        T[TESTING] -->|Failures| RT[RESOLVE FEEDBACK<br/>fix test failures]
        RT -->|Round 1| T
    end
    T -->|All pass| R
    RT -->|After round 2, remaining failures<br/>go into HUMAN REVIEW| R

    subgraph LR[REVIEW loop, by the agent, max 2 rounds]
        R[REVIEW] -->|Issues| RR[RESOLVE FEEDBACK<br/>fix review issues]
        RR -->|Round 1| R
    end
    R -->|No issues left| H
    RR -->|After round 2| H

    subgraph LH[HUMAN REVIEW loop, max 2 rounds]
        H[HUMAN REVIEW<br/>with test checklist] -->|User asks for changes,<br/>rounds left| RH[RESOLVE FEEDBACK<br/>fix per user]
        RH --> H
    end
    H -->|User approves| C[COMMIT]
    H -->|2 rounds of fixes,<br/>user still not approving| U{User decides}
    U -->|Approve| C
    U -->|Move the rest to a later phase| C
    U -->|Stop the phase| X[Stop, no commit]
```

## Steps

| Step | Work | Output | Condition to move on |
| :---- | :---- | :---- | :---- |
| PLANNING | Create the phase branch from `main`; read the phase file in `docs/phases/`, shared requirements in [README.md](../README.md) and [docs/design/NFR.md](./design/NFR.md), and tool requirements in `tools/<slug>/README.md` when relevant; identify scope, tasks and open questions | Phase execution plan | User approves the plan |
| DESIGN | Design the API, modules and flows for the phase | The design; update the documents in `docs/design/` when the design changes, including the OpenAPI spec when a tool's API changes | Design matches the approved plan |
| IMPLEMENTATION | Write code by task ID, following the architecture in [docs/design/HLD.html](./design/HLD.html); every tool meets [docs/design/TOOL_CONTRACT.md](./design/TOOL_CONTRACT.md) | Code and tests for the phase | Every task of the phase is done |
| TESTING | Run automated tests, type check, build and every test item of the phase; lint and format pass (section "Lint and format"). Phases that deploy also check the Vercel preview deployment | Result of each item, with failures if any | Every item passes, or 2 rounds are used |
| RESOLVE FEEDBACK (after TESTING) | Fix the failures from the TESTING round just run | Fixed code | Round 1: rerun TESTING. Round 2: go to REVIEW and record remaining failures for HUMAN REVIEW |
| REVIEW | The agent reviews the changes itself, without the user, against [docs/REVIEW_CHECKLIST.md](./REVIEW_CHECKLIST.md) | List of issues: unchecked best practices that apply and anti-patterns found | Empty list means go to HUMAN REVIEW |
| RESOLVE FEEDBACK (after REVIEW) | The agent fixes each issue and reruns the automated tests and affected test items | Fixed code, new test results | Round 1: review again. Round 2: go to HUMAN REVIEW |
| HUMAN REVIEW | Present to the user per section "HUMAN REVIEW content" | User's decision | User approves: go to COMMIT; user asks for changes: go to RESOLVE FEEDBACK |
| RESOLVE FEEDBACK (after HUMAN REVIEW) | Fix per the user's request, rerun related tests, present again | Fixed code, new test results | Back to HUMAN REVIEW. After 2 rounds of fixes without approval, the user decides: approve, move the rest to a later phase, or stop the phase |
| COMMIT | Commit with conventional commits on the phase branch, merge the branch into `main` and push | Phase merged into `origin/main` | Phase done |

### Counting rounds

- A round is one run of the main step (TESTING, REVIEW or HUMAN REVIEW) plus one RESOLVE FEEDBACK after it. The loop ends early when the main step has nothing left to fix.
- Every RESOLVE FEEDBACK reruns the related tests to confirm the fix; that rerun does not count as a new round.
- No extra loops once the rounds are used. Remaining failures or issues are not dropped: the agent lists them in HUMAN REVIEW for the user to decide.

## HUMAN REVIEW content

The agent presents all of the following in one message:

- **Changes:** summary by package (`host`, `packages/*`, `tools/*`) and by task ID.
- **Test results:** number of passing automated tests per package and the result of each phase test item, with evidence such as logs, API responses or deployment URLs.
- **Failures and issues fixed:** listed from the TESTING and REVIEW loops.
- **Still open:** failures not fixed when rounds ran out, known limitations, deviations from the plan.
- **User checklist (required):** a bullet list of what the user must check before approving. Each item states:
  - where: local with its URL, a preview deployment, or the Vercel production URL;
  - the clicks or commands to run, in order;
  - the expected result, so the user knows whether it passed.

  The user should never have to ask how to test. Items the agent has fully checked itself are left out of this list.
- **Planned commits:** the commit messages that will be used.

## Branch and commit rules

- Each phase runs on its own branch created from `main`, named `phase/p<phase number>`, e.g. `phase/p2`.
- No direct commits to `main`. The only exception: the repo's initial commit containing [README.md](../README.md), [docs/design/NFR.md](./design/NFR.md), `docs/phases/`, [docs/WORKFLOW.md](./WORKFLOW.md), [CLAUDE.md](../CLAUDE.md), `.claude/` and `.gitignore`, made after the user finalizes the plan.
- Never commit, merge or push before the user approves at HUMAN REVIEW.
- An approval for one commit, merge or push does not carry over to the next.
- Commit messages follow conventional commits, e.g. `feat(markdown-to-pdf): add page options`.
- Never commit secret files: tokens, keys, `.env`. The PreToolUse hook `.claude/hooks/block_secrets.py` blocks any `git add` or `git commit` that would stage one, by file name or by secret-looking content.
- Requirement and phase plan changes are committed together with the change that caused them; [README.md](../README.md), [docs/design/NFR.md](./design/NFR.md), `tools/<slug>/README.md` and `docs/phases/` always match the code on `main`.

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
- API language and error rules are in [docs/design/API_CONVENTIONS.md](./design/API_CONVENTIONS.md).

## Import rules

- Inside every package (`host`, `packages/*`, and `tools/<slug>/ui`, `api`, `shared`): imports of the package's own files use Node.js subpath imports `#/`, declared in that package's `package.json` as `"imports": { "#/*": "./src/*" }`, with the real file extension, e.g. `#/shared/components/index.ts`, including `@import` in CSS. No relative `./` or `../` paths.
- Other packages are imported by package name and export, e.g. `@goblin/server-kit`, never by a path into the package folder.
- The Host never imports a tool package; it reaches tools only through `catalog.json` and Module Federation.
- A tool package never imports another tool's packages; it may import its own `@goblin/tool-<slug>-*` packages.
- oxlint enforces the relative-path, Host and cross-tool rules (`no-restricted-imports` in `.oxlintrc.json`, with one override per tool added by `pnpm new-tool`); CSS `@import` is checked in review.

## Tests

- Every package keeps its tests in one `tests/` folder next to `src/`; no other test folders.
- `*.test.ts` files run with Vitest (`pnpm test`); `*.e2e.ts` files run with Playwright on the full stack (`pnpm test:ui`).

## Deployment docs

- [docs/DEPLOY_RUNBOOK.md](./DEPLOY_RUNBOOK.md) is the DevOps guide for the project as it is now: local stack, deploy, environment variables, functions, cron jobs, caching, firewall, logs and rollback. It holds no history; update it in the same change that alters any of these.
- What a phase checked in production (deployment URLs, smoke checks, cron, rollback drill, findings) is recorded in that phase's file in `docs/phases/`, under `## Verification`. Production checks run after the push, so their record goes in a follow-up docs commit that needs its own approval.

## Lint and format

| Scope | Lint | Format | Type check | Config |
| :---- | :---- | :---- | :---- | :---- |
| `host`, `packages/*`, `tools/*` | `pnpm lint` (oxlint) | `pnpm format` (Prettier) | `pnpm typecheck` (`tsc --noEmit` in every package) | `.oxlintrc.json` and the `prettier` key in `package.json`, at the repo root |

- The Claude Code Stop hook (`.claude/settings.json`, script `.claude/hooks/lint_format.py`) runs automatically when the agent finishes a turn: it fixes lint and formatting in every file changed in git, skipping what `.prettierignore` and the oxlint `ignorePatterns` exclude. If lint errors cannot be fixed automatically, the hook hands them back to the agent once, then only reports them to the user.
- The hook only runs once oxlint and Prettier are installed at the repo root (from Phase 2); before that it does nothing.
- `.md` files are not formatted.

## Blocked commands

- If a command cannot run because of environment access, network, DNS, credentials, or an unavailable tool, say so plainly and ask the user to run the exact command or provide the specific access needed.
- Do not send the user through speculative settings changes, mirrors, or workarounds. Do not claim a permission change will fix a failure unless the failure confirms that.
- After a failed attempt, report the concrete error and stop retrying unless a clear, safe diagnostic step can distinguish the cause.
