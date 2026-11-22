# Phase 4: Deploy tool

**Goal:** Deploy the full build and verify the tool works correctly in production.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| P1 | Production config | Review env, function memory and `maxDuration`, the cleanup cron, the WAF threshold, the default locale, and the domain if any. | Phase 3 | [x] |
| P2 | Production deployment | Merge the reviewed build into `main` to deploy to production. | P1 | [x] |
| P3 | Smoke tests | Check the UI flow and call the API directly on production. | P2 | [ ] |
| P4 | Rollback drill | Instant Rollback to the previous deployment, then promote the new one again. | P2 | [x] |
| P5 | Documentation | Update the README, runbook and known limitations. | P3 | [ ] |

## Test

- Smoke test: home search → Markdown to PDF → upload `.md` → reformat → preview → download PDF.
- Call the production API with JSON; open the returned URL; check the file is deleted after 1 hour.
- Check request errors, input limits, rate limits, URL images (including blocked URLs), syntax highlighting, inline HTML, Mermaid, math and the options (including orientation, page numbers, colors, heading style).
- Check desktop/mobile, `en`/`vi` locales, and that logs contain no Markdown content.

## Review

- Review smoke test results, PDF quality, logs and usage against Hobby limits.
- Confirm production runs exactly the commit reviewed in Phase 3.

## AC

- The tool works from the production URL; UI and API behave per the contract.
- The finalized features, locales and options work in production.
- The rollback drill succeeded.
- README, runbook and known limitations are updated.

## Output

- The Markdown to PDF MVP in production, a smoke test record, operations docs.
