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
| Image fetching and IP classification | undici + ipaddr.js, DNS lookup bound to the request connection, manual redirect validation |
| Storage | `@vercel/blob` (*verified*) |
| Editor | CodeMirror 6 (`codemirror`, `@codemirror/state`, `@codemirror/view`, `@codemirror/lang-markdown`); `@codemirror/language` and `@lezer/highlight` for the Goblin syntax theme |
| UI icons | `lucide-react`, bundled by the UI remote (not a shared Module Federation singleton) |
| Markdown formatter | Prettier standalone with the built-in Markdown plugin |
| Fonts | `@fontsource` Noto Sans, Noto Serif, Noto Sans Mono (OFL; packaged subsets include latin, latin-ext and Vietnamese) |
| Match test | pngjs + pixelmatch; `pdftoppm` (poppler-utils) in CI |
