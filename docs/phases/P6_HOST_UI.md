# Phase 6: Host UI

**Goal:** Make the Host feel alive and easy to scan while keeping the "Goblin Gazette" identity in [DESIGN.md](../design/DESIGN.md): icons, a clear layout with tool cards, page transitions and small motion. The tool itself does not change in this phase, apart from the icon it now ships for the catalog. [Phase 7](./P7_TOOL_UI.md) then reworks the tool UI on top of this.

**Complexity:** medium.

## Tasks

| ID | Task | Description | Depends on | Status |
|---|---|---|---|---|
| H1 | Design tokens | Extend `packages/ui-kit/src/tokens.css` and [DESIGN.md](../design/DESIGN.md): print-style offset shadows, a small radius step, motion durations and easings, card surfaces. Every animation is turned off under `prefers-reduced-motion: reduce`. | — | [x] |
| H2 | Icons | Add `lucide-react` to the Host. It is not shared through Module Federation: a shared module cannot be tree-shaken and would ship the whole icon set. | — | [x] |
| H3 | Tool icon in the manifest | Optional `icon` field in `manifest.json`: the URL of an SVG the tool's UI remote serves, e.g. `/remotes/<slug>/icon.svg`. `buildCatalog.mjs` validates it; the Host shows a default icon when it is missing or fails to load. Markdown to PDF ships its icon. Update [TOOL_CONTRACT.md](../design/TOOL_CONTRACT.md) and `pnpm new-tool`. | H2 | [x] |
| H4 | Layout | Sticky masthead with icon nav, an active-page marker and an `EN / VI` toggle; home hero with a decorative background and a search field with an icon and a clear button; a grid of tool cards (icon, name, description, vault chip); vault cards with tool counts; tool page with a breadcrumb, a compact header and a loading skeleton; footer with nav links; illustrated 404 and tool load error. | H1, H2, H3 | [x] |
| H5 | Motion | Route transitions with the View Transitions API through React Router `viewTransition`; staggered card entrance; smooth filtering while searching; hover and press feedback on buttons, links and cards. Browsers without View Transitions navigate normally. | H4 | [x] |
| H6 | Tests and docs | Update `host/tests/federation.e2e.ts` and the locale parity test; desktop and mobile checks; update [DESIGN.md](../design/DESIGN.md) and [UI_CONVENTIONS.md](../design/UI_CONVENTIONS.md) if a rule changes. | H5 | [x] |
| H7 | Deploy | Preview deployment with the full test list; production after HUMAN REVIEW. | H6 | [ ] |

## Design

Visual rules are in [DESIGN.md](../design/DESIGN.md) (sections Rounded and shadows, Motion, Components); the manifest `icon` rule is in [TOOL_CONTRACT.md](../design/TOOL_CONTRACT.md).

| Area | Files | Notes |
|---|---|---|
| Tokens | `packages/ui-kit/src/tokens.css` | `--shadow-print-*`, `--motion-lift`, `--motion-enter`, `--motion-page`, `--stagger`; one `prefers-reduced-motion` block that zeroes durations |
| Catalog | `host/scripts/buildCatalog.mjs`, `host/src/catalog/types.ts` | Validate `icon` (`/remotes/<slug>/*.svg`); `CatalogTool.icon?: string` |
| Masthead | `app/AppLayout.tsx`, `components/MainNav.tsx`, `components/LanguageToggle.tsx` (replaces `LanguageSelect.tsx`) | `NavLink` for the active marker; toggle buttons with `aria-pressed` |
| Home | `pages/HomePage.tsx`, `components/SearchForm.tsx`, `components/TypingPlaceholder.tsx`, `hooks/useTypingText.ts`, `components/HeroStamp.tsx`, `components/ToolCard.tsx`, `components/MoreToolsCard.tsx`, `components/ToolIcon.tsx` | Search filters live (no submit button) and gets a clear button; while empty, `TypingPlaceholder` types the hints `markdown`, `pdf`, `markdown to pdf` with a blinking caret (`useTypingText` runs the timer, cleans up on unmount, stops under reduced motion); a dashed "More tools on the way" card ends the grid; `ToolIcon` paints the manifest SVG with a CSS mask and falls back to Lucide `Wrench` when a hidden probe image fails |
| Vaults | `pages/VaultPage.tsx`, `components/VaultCard.tsx` | Vault list as cards with tool counts; one vault reuses `ToolCard` |
| Tool page | `pages/ToolPage.tsx`, `components/Breadcrumb.tsx`, `federation/ToolSkeleton.tsx` | `RemoteTool` shows `ToolSkeleton` while loading |
| Footer | `app/AppLayout.tsx`, `components/SiteFooter.tsx` | Wordmark and nav links, then a centered `© <year> Goblin Toolbox` line at the bottom; the year comes from the current date |
| Errors | `pages/NotFoundPage.tsx`, `federation/ToolLoadError.tsx` | Icon, short text and a link home |
| Motion | `styles/motion.css`, `<Link viewTransition>` | Keyframes `rise`, `drift`, `spin`, `shimmer`; `::view-transition-*` rules |
| Styles | `styles/app.css` replaced by `layout.css`, `cards.css`, `toolPage.css`, `motion.css` | Keeps each file short; `bootstrap.tsx` imports them after `global.css` |
| i18n | `host/src/i18n/locales/{en,vi}/common.json` | New keys: main nav label, clear search, open tool, more tools on the way, breadcrumb label, tool count, the three search hints, copyright |
| Tool | `tools/markdown-to-pdf/ui/public/icon.svg`, `tools/markdown-to-pdf/manifest.json` | The only tool change in this phase |
| Scaffold | `scripts/newTool.mjs` | Writes a default `ui/public/icon.svg` and the `icon` field |

Mockup (home desktop, tool page loading, home mobile): https://claude.ai/artifact/A4ULxvtcv7vsA7SC4kB7LX

## Test

- Automated: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:ui`, `pnpm build`.
- Catalog: a manifest with a bad `icon` value fails `buildCatalog.mjs`; a tool without `icon` shows the default icon.
- Boundary: the Host build still contains no tool code; `lucide-react` is not in the shared singletons.
- Search hint: with the field empty, the hints type and delete in turn for two rounds, then rest on the last hint without a caret; focusing the field stops them at once; typing hides them; the timer stops when leaving the page.
- Motion: route change animates in Chrome; a spot of dark dots follows the mouse inside the hero; the stamp stops after 10 turns; with `prefers-reduced-motion: reduce` pages cross-fade without the slide and everything else keeps moving; Firefox without View Transitions navigates normally.
- Accessibility: keyboard reaches every nav item, card, toggle and the search clear button with visible focus; icon-only controls have accessible names; Lighthouse accessibility ≥ 95 on `/`.
- Layout: `/`, `/vaults`, `/vaults/document-tools`, `/tools/markdown-to-pdf` and a 404 at 375 px and 1280 px, `en` and `vi`, no horizontal scroll.
- The Markdown to PDF flow still works inside the new tool page.

## Review

- [REVIEW_CHECKLIST.md](../REVIEW_CHECKLIST.md), with extra attention to the React.js and Module Federation sections.
- Compare the Host JS bundle size with Phase 5.

## AC

- The Host shows tool cards with icons, an icon nav, page transitions and motion that respects reduced motion.
- The manifest `icon` field is in the contract, the scaffold and the catalog build.
- Docs match the code; production runs the new Host.

## Output

- New Host UI in production; updated `DESIGN.md`, `TOOL_CONTRACT.md` and `pnpm new-tool`.

## Decisions

- Reduced motion (HUMAN REVIEW round 1): the user's Mac has Reduce motion on and the first build stilled every animation, which read as broken. Decision: under `prefers-reduced-motion: reduce` only the page slide becomes a cross-fade; the typing hint, entrance, hover, the pointer halftone and the spinning stamp stay on.
- Halftone (HUMAN REVIEW round 2): the light dots stay still and a spot of ink dots trails the mouse inside the hero, also under reduced motion.
- Typing hint: two rounds, then it rests on the last hint; focusing the field stops it.

## Deviations from the plan

- The hero stamp turns 10 times (about 6 minutes 40 seconds) and then rests, also under reduced motion, at the user's request. It stops on its own but runs longer than the 5 seconds of WCAG 2.2.2 (Pause, Stop, Hide, level A) without a pause control; accepted by the user.
- The search hints (`markdown`, `pdf`, `markdown to pdf`) name the current tool in the Host's i18n; they must be revisited when more tools are added.
