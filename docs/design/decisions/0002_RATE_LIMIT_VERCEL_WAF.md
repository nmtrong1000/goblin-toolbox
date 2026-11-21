# ADR 0002: Rate limiting with Vercel WAF

- **Status:** accepted
- **Date:** 2026-11-21

## Context

Tool APIs have no authentication, and some tools are expensive to run. Counters inside the function do not work across serverless instances.

## Decision

Use Vercel WAF custom rules with the `rate_limit` action (429), keyed by IP and scoped by path prefix. The toolbox has one shared rule for `/api/*`; a tool may add its own stricter rule. Rules are created with `vercel firewall rules add` and published with `vercel firewall publish`, and are recorded in the runbook.

## Alternatives

- **Upstash Redis + middleware:** more flexible, but another vendor; kept as the fallback.
- **`deny` action with a duration:** rejected; spike 0001 showed it blocks the IP on every path, including health, for the whole duration.

## Consequences

- Blocked requests never reach the function, so they cost no function time.
- Thresholds live in Vercel, not in the repo; the runbook must list them.
