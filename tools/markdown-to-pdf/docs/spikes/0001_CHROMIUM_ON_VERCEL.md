# Spike 0001: Express + Chromium on Vercel Hobby

- **Date:** 2026-11-21
- **Goal:** answer the Phase 1 go/no-go criteria G1–G8 before any design is finalized.
- **Code:** throwaway, kept outside the repo (`~/dev/projects/goblin-toolbox-spike`), not committed.
- **Deployment:** Vercel project `goblin-toolbox-spike` (Hobby), production URL `https://goblin-toolbox-spike.vercel.app`, function region `iad1`, Node.js 22.23.5.

## Setup

| Part | Choice in the spike |
|---|---|
| API | Express 5.3.0, exported as the default handler of `api/index.js`; `vercel.json` rewrites `/api/(.*)` to `/api` |
| Chromium | `puppeteer-core` 25.18.1 + `@sparticuz/chromium` 153.0.0 on Vercel; local Chrome 157 on macOS |
| Renderer | one esbuild IIFE bundle: markdown-it 15.0.3, markdown-it-task-lists, `@vscode/markdown-it-katex` (KaTeX 0.19.1), highlight.js 11.12.0, Mermaid 12.3.0, DOMPurify 3.4.18 |
| Fonts | `@fontsource` Noto Sans, Noto Serif, Noto Sans Mono (latin, latin-ext, vietnamese subsets, 400/700) |
| Storage | `@vercel/blob` 2.9.0, public store, random file names |
| Function config | memory 2048 MB, `maxDuration` 60 s, `includeFiles: assets/**` |
| Fixtures | GFM, math, Mermaid (valid, sequence, invalid), inline HTML attacks, URL images, Vietnamese, a long document (13 pages) |

The PDF Renderer writes a page into a per-request temp folder, loads the renderer bundle and CSS from `file://`, renders inside the page, waits for Mermaid, fonts and images, then calls `page.pdf()`. Request interception allows only `data:` and `file://` inside the assets and temp folders; images go through the Request Guard and are answered with `request.respond()`; everything else is aborted.

## Results

| # | Check | Result | Evidence |
|---|---|---|---|
| G1 | Function bundle | **Pass** | `λ api/index` = **72.51 MB** (`vercel inspect`); deploy succeeded |
| G2 | 10+ page document | **Pass** | Long fixture prints 13 pages. Cold request: round trip ~4.5 s (Chromium launch 2.6–2.9 s). Warm: round trip 1.0–2.4 s, in-function 0.7–1.9 s. System memory used 320–480 MB of 2279 MB |
| G3 | Renderer in Chromium | **Pass** after fixes (see below) | GFM, highlighting, KaTeX, Mermaid incl. Vietnamese labels, URL images, page numbers `n / total`, invalid Mermaid shown as an error block |
| G4 | Vietnamese | **Pass** | All diacritics correct in Noto Sans, Noto Serif, Noto Sans Mono, both local and on Vercel |
| G5 | Preview vs PDF match | **Pass** | First page, preview screenshot (Chrome 157) vs Vercel PDF (Chromium 153): GFM 0.65 %, math 0.18 %, Vietnamese 0.64 %, HTML 0.16 %, Mermaid 2.52 % differing pixels; differences are anti-aliasing, layout identical |
| G6 | Routing, body limit, WAF | **Pass** | Static from CDN, `/api/*` reaches Express with the original path. Body limit: 4,490,000 bytes accepted, 4,500,000 rejected with `413 FUNCTION_PAYLOAD_TOO_LARGE`. WAF `rate_limit` rule (5 req / 10 s per IP on a path prefix) returned 429 from request 6, other paths stayed 200, access returned after the window |
| G7 | Blob and cron | **Pass** | Upload ~55–140 ms, random URLs. Daily cron registered on Hobby (`vercel crons ls`), manual trigger reached the function; the endpoint rejects calls without `CRON_SECRET` (401). On 2026-11-21, a production PDF request returned 200 and its cleanup reported deleting 7 PDFs older than 1 hour. |
| G8 | Request Guard | **Pass** | Blocked: `169.254.169.254`, `127.0.0.1`, `10.0.0.1`, `[::1]`, `localhost`, `0x7f000001`, `file://`, non-image responses, and redirects from a public URL to each internal IP. Allowed: public images and public redirects (`github.com/github.png` → avatars) |

## Findings that change the design

1. **Sanitize only user-written HTML.** Sanitizing the whole rendered HTML strips the `style` attributes KaTeX needs. The renderer must sanitize only markdown-it's `html_inline` / `html_block` tokens: inline tags pass only if they match the allowlist exactly, blocks go through DOMPurify with the allowlist and `KEEP_CONTENT`. Output of trusted plugins (KaTeX, highlighting, Mermaid in strict mode) is not re-sanitized. markdown-it's own link validation already blocks `javascript:` URLs.
2. **Mermaid error handling.** Validate with `mermaid.parse()` before `render()`, enable `suppressErrorRendering`, give every diagram a unique id, and remove only Mermaid's temporary nodes directly under `body`. Otherwise Mermaid leaves its own error graphic in the page or removes a valid diagram.
3. **Pin the Mermaid font.** Linux Chromium lacks Mermaid's default fonts; set `fontFamily` and `themeVariables.fontFamily` to a bundled font so preview and PDF use the same metrics.
4. **Recover from a dead browser.** A cached Chromium that crashed made every later request fail; the renderer must relaunch when the browser is disconnected.
5. **Image fetches need a User-Agent.** Some hosts (Wikimedia) reject requests without one; use a generic one, e.g. `GoblinToolbox-ImageFetcher/<version>`.
6. **Preview images bypass the server guard.** In the preview, the user's browser loads images directly. A URL to an internal or unreachable address made the preview wait for the browser timeout, and `localhost` URLs would load from the user's own machine. The preview needs its own rules: same scheme and host checks as the Request Guard where they can be checked on the client, and a render that does not wait on slow images.
7. **Use `rate_limit`, not `deny`, for WAF rules.** With `deny` plus a duration, the IP was blocked on every path, including `/api/health`, for the whole duration.
8. **Function region.** The function ran in `iad1` while the edge serving the tester was `hkg1`. Choosing the function region closest to users (e.g. `sin1`) should be measured in Phase 2.
9. **DNS rebinding.** The Request Guard validates addresses inside the connection's DNS lookup (undici `connect.lookup`), so the address checked is the address connected to; it does not trust a separate pre-check.

## Decision

All criteria pass. The planned stack (Express + `puppeteer-core` + `@sparticuz/chromium` in one Vercel Function, Vercel Blob, Vercel WAF) is kept. No fallback is needed.
