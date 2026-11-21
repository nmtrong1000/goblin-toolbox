# Tech stack: Markdown to PDF

Libraries this tool adds on top of the shared stack in [docs/design/TECH_STACK.md](../../../docs/design/TECH_STACK.md). *Verified* means it ran in spike 0001.

| Area | Choice |
|---|---|
| Browser automation | `puppeteer-core` (*verified*) |
| Serverless Chromium | `@sparticuz/chromium` (*verified*) |
| Markdown | markdown-it (*verified*) |
| Task lists | markdown-it-task-lists (*verified*) |
| Math | `@vscode/markdown-it-katex` + KaTeX (*verified*) |
| Highlighting | highlight.js (*verified*) |
| Diagrams | Mermaid (*verified*) |
| HTML sanitizer | DOMPurify (*verified*) |
| Renderer bundler | esbuild (*verified*) |
| Image fetching | undici (*verified*) |
| Storage | `@vercel/blob` (*verified*) |
| Editor | CodeMirror 6 (`@codemirror/view`, `@codemirror/lang-markdown`) |
| Markdown formatter | Prettier standalone with the markdown plugin |
| Fonts | `@fontsource` Noto Sans, Noto Serif, Noto Sans Mono (OFL; latin, latin-ext, vietnamese) (*verified*) |
| Match test | pngjs + pixelmatch; `pdftoppm` (poppler-utils) in CI |
