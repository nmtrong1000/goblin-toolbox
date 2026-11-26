# Markdown to PDF

Belongs to the **Document Tools** vault. The tool only outputs PDF.

## Functional requirements

- Editor and live preview, split side by side on desktop.
- Input by typing/pasting or uploading a `.md` file.
- A button to reformat the Markdown in the editor.
- Supports basic Markdown/GFM, syntax highlighting per language, Mermaid, math formulas and images from public URLs.
- YAML frontmatter at the top of a document renders as a key–value table; frontmatter that is not plain `key: value` lines renders as raw text.
- Inline HTML through an allowlist (e.g. `<sup>`, `<sub>`, `<kbd>`, `<br>`); tags outside the allowlist and scripts are removed.
- Download PDF; choose page size, orientation, margins (a preset or each side in mm, 0–50), page numbers (on/off, left/center/right, `n / total` or `n`), font and density (Comfortable or Compact, sent as `theme`). Fonts must fully support Vietnamese.
- Adjust text, heading and link colors and the heading style (H1–H3).
- The PDF matches the preview.
- The API accepts JSON with Markdown and options. Deployed runs upload the PDF to Blob and return a download URL; local development returns the PDF as a direct browser download without Blob storage.
- The API needs no authentication; it has a basic rate limit.

## Non-functional requirements

### Non-functional requirements

- Render within Vercel's 60-second function duration and 2048 MB memory setting established by spike 0001.
- Accept at most 100,000 Markdown characters and keep JSON bodies under 4.49 MB, below the measured platform rejection point of 4.5 MB.
- Do not persist Markdown or log document contents. Store generated PDFs in Vercel Blob with random names and remove them after one hour when cleanup runs.
- Allow only guarded public HTTP(S) image fetches; enforce DNS/IP checks after redirects, a 5-second per-request timeout, a 15-second image budget, a 5 MB per-image response ceiling, and a 3 MB aggregate ceiling.
- Allow at most 10 remote images and 10 Mermaid diagrams per document.
- Reuse Chromium per warm function instance; relaunch after a disconnect. Spike baseline: cold request about 4.5 seconds, warm request 1.0–2.4 seconds, observed memory 320–480 MB.
- Apply the shared Vercel WAF per-IP rate limit to the API. The production rule currently allows 100 requests per IP per 60 seconds on `/api/`; revisit it against real traffic before tightening it.

The duration and memory baseline comes from [the Vercel Chromium spike](docs/spikes/0001_CHROMIUM_ON_VERCEL.md). Markdown, image and diagram limits are provisional until M5.1 measures representative workloads.

Initial local benchmark on Chrome 157 (Node process RSS; one Chromium instance reused):

| Fixture | Markdown | Images | Diagrams | Render time | Node RSS |
|---|---:|---:|---:|---:|---:|
| Small document | 2,517 chars | 0 | 0 | 1,005 ms (first render) | 246 MB |
| Maximum Markdown input | 100,000 chars | 0 | 0 | 705 ms | 272 MB |
| Maximum image count | 1,278 chars | 10 | 0 | 611 ms | 205 MB |
| Maximum Mermaid count | 330 chars | 0 | 10 | 885 ms | 291 MB |

These are local renderer measurements, not Vercel function measurements; the spike observed 320–480 MB system memory on its long fixture. The CI benchmark renders the maximum input, image and diagram counts and writes exact duration and Node RSS values to its log. The 100,000-character, 10-image, and 10-diagram limits remain provisional until the same workload is measured in a Vercel function.

## Operations

How to deploy, set variables, run cron jobs and read logs is in [docs/DEPLOY_RUNBOOK.md](../../docs/DEPLOY_RUNBOOK.md). This section lists only what this tool adds.

### Environment variables

| Variable | Environments | Notes |
|---|---|---|
| `BLOB_STORE_ID` | Production, Preview, Development | Vercel Blob store; Vercel injects the short-lived `VERCEL_OIDC_TOKEN` for access, so no static token is needed on Vercel |
| `CRON_SECRET` | Production | Sensitive bearer token for the daily cleanup cron |
| `BLOB_READ_WRITE_TOKEN` | Local only, optional | Only to test real Blob uploads locally |
| `LOCAL_CHROME_PATH` | Local only, optional | Chrome executable for local rendering; Linux CI and Vercel use `@sparticuz/chromium` |
| `LOCAL_PDF_OUTPUT` | Local only | Set to `1` by the API service's dev script, so **Create PDF** downloads the file directly instead of uploading it to Blob |

`BLOB_WEBHOOK_PUBLIC_KEY` is added by the Blob integration and is not read by the code.

### Function settings

`markdown-to-pdf-api` in `vercel.json`: `maxDuration` 60 seconds, renderer assets bundled with `includeFiles`.

### Cron jobs

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/markdown-to-pdf-cleanup` | `0 3 * * *` (03:00 UTC) | Delete expired PDFs from Blob |

### Local development

PDF rendering uses the local Google Chrome; set `LOCAL_CHROME_PATH` if it is not in the default location.

## API examples

Create a PDF:

```sh
curl -sS -X POST "$BASE_URL/api/tools/markdown-to-pdf" \
  -H 'content-type: application/json' \
  -d '{"markdown":"# Hello\n\nA PDF from Markdown.","options":{"pageSize":"A4","orientation":"portrait","margin":"normal","pageNumbers":true,"font":"noto-sans","theme":"default","colors":{"text":"#1d1b18","heading":"#78351f","link":"#a64f35"},"headingStyle":"default"}}'
```

The response contains `url` and `expiresAt`. The URL is public and random, and cleanup removes the file after one hour when the cleanup job runs. API errors use `{ "code", "message" }`; Vercel WAF `429` responses do not use this JSON shape.

## Design

Design documents are in this package's `docs/` directory (Phase 1):

| Document | Content |
|---|---|
| `openapi.yaml` | API contract |
| [TECH_STACK.md](docs/TECH_STACK.md) | libraries the tool adds |
| `decisions/` | tool decisions |
| [UI.md](docs/UI.md) | UI design: layout, style presets, settings drawer, zoom, feedback |
