# Goblin Toolbox: agent instructions

@docs/WORKFLOW.md

`docs/WORKFLOW.md` above is the source of truth for phases, branches and commits, and blocked commands. Read these before working:

| Topic | Where |
|---|---|
| Requirements and scope | [README.md](./README.md), [docs/design/NFR.md](./docs/design/NFR.md), `tools/<slug>/README.md`, `docs/phases/` |
| Architecture | [docs/design/HLD.html](./docs/design/HLD.html), [docs/design/PROJECT_STRUCTURE.md](./docs/design/PROJECT_STRUCTURE.md), `docs/design/decisions/` |
| What a tool must provide | [docs/design/TOOL_CONTRACT.md](./docs/design/TOOL_CONTRACT.md) |
| API conventions | [docs/conventions/API_CONVENTIONS.md](./docs/conventions/API_CONVENTIONS.md) |
| How UI code is split into components | [docs/conventions/UI_CONVENTIONS.md](./docs/conventions/UI_CONVENTIONS.md) |
| i18n | [docs/design/I18N.md](./docs/design/I18N.md) |
| Deploy, environment, cron, logs, rollback | [docs/DEPLOY_RUNBOOK.md](./docs/DEPLOY_RUNBOOK.md) |
| What REVIEW checks | [docs/REVIEW_CHECKLIST.md](./docs/REVIEW_CHECKLIST.md) |

The rules below only cover how an agent works inside that process.

## Working through a phase

- Say which step and round you are in whenever you move to another step, e.g. "TESTING, round 2 of 2".
- Never commit, merge or push before the user approves at HUMAN REVIEW. One approval covers one commit, merge and push, not the next ones.
- Every HUMAN REVIEW message carries the test checklist from `docs/WORKFLOW.md`, section "HUMAN REVIEW content". Do not wait to be asked how to test.
- When a tool's component, hook or helper could serve other tools, ask the user whether to move it into `packages/ui-kit` and record the answer in the phase file (`UI_CONVENTIONS.md`, section "Where code lives").
- Do everything you can yourself: tests, builds, logs, local runs, Vercel preview deployments. Ask the user only for actions that need a human, batched into one numbered list, each step with its expected result.
