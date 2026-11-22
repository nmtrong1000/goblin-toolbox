# Goblin Toolbox agent instructions

@docs/WORKFLOW.md

## Blocked commands

- If a command cannot run because of environment access, network, DNS, credentials, or an unavailable tool, say so plainly and ask the user to run the exact command or provide the specific access needed.
- Do not send the user through speculative settings changes, mirrors, or workarounds. Do not claim a permission change will fix a failure unless the failure confirms that.
- After a failed attempt, report the concrete error and stop retrying unless a clear, safe diagnostic step can distinguish the cause.
