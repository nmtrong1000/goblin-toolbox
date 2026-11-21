# Goblin Toolbox: rules for Claude

@docs/WORKFLOW.md

`docs/WORKFLOW.md` above is the source of truth for phases, branches and commits, comments and language, imports and lint. `docs/INIT_PLAN.md` and `docs/phases/` hold the scope and tasks of each phase. The rules below only cover how Claude works inside that process.

## Working through a phase

- Say which step and round you are in whenever you move to another step, e.g. "TESTING, round 2 of 2".
- Never commit, merge or push before the user approves at HUMAN REVIEW. One approval covers one commit, merge and push, not the next ones.
- Every HUMAN REVIEW message carries the test checklist from `docs/WORKFLOW.md` section 3. Do not wait to be asked how to test.
- Do everything you can yourself: tests, builds, logs, local runs, Vercel preview deployments. Ask the user only for actions that need a human, batched into one numbered list, each step with its expected result.
