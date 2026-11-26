# Review checklist

Used in the REVIEW step of [WORKFLOW.md](./WORKFLOW.md). Tick every best practice that applies to the change; any anti-pattern found is an issue to fix.

## Project

### Best practices

- [ ] The change matches the approved phase plan and its task IDs.
- [ ] Requirement docs (`README.md`, `NFR.md`, `tools/<slug>/README.md`, `docs/phases/`) are updated in the same change.
- [ ] Design docs in `docs/design/` and the tool's `openapi.yaml` match the code.
- [ ] A new tool or a changed tool still meets [TOOL_CONTRACT.md](./design/TOOL_CONTRACT.md).
- [ ] File and folder names follow [CODE_CONVENTIONS.md](./conventions/CODE_CONVENTIONS.md), section "File and folder naming", including what lint does not check: Markdown, HTML, served files, folders and acronyms.
- [ ] Comments follow the comment rules: one header block, English, only "why" or "watch out".
- [ ] System messages are English; UI text goes through i18n in `en` and `vi`.
- [ ] `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
- [ ] New dependencies are declared in the package that uses them and are needed.

### Anti-patterns

- The Host imports tool code, or a tool imports another tool.
- Code shared by two tools copied into both instead of moved to `packages/`.
- Relative imports (`./`, `../`) instead of `#/` or a package name.
- Comments that narrate code, record history or repeat the docs; `eslint-disable` or `oxlint-disable`.
- Changes outside the phase scope, or extra features nobody asked for.
- Secret files or real tokens in the diff.

## Module Federation

### Best practices

- [ ] The remote exposes only `./Tool`.
- [ ] The federation config uses `sharedSingletons` and `federationName()` from `@goblin/ui-kit/federation`, with `dts: false`.
- [ ] The remote's `base` is `/remotes/<slug>/`, and its assets load from there in a production build.
- [ ] `remoteEntry.js` is not cached long; hashed chunks are cached as immutable.
- [ ] The Host shows an error state when a remote fails to load, without breaking the shell.

### Anti-patterns

- A remote bundling its own copy of React or i18next.
- A remote reaching into Host internals other than the shared singletons.
- Global CSS in a remote that restyles the Host or other tools.
- Hard-coded absolute URLs to a remote or an API.

## React.js

### Best practices

- [ ] Code is split per [UI_CONVENTIONS.md](./conventions/UI_CONVENTIONS.md): each file sits in the right layer (entry, app, page, component, hook, API client, lib) and imports only layers below it.
- [ ] One component per file, named after the file, with a typed `XxxProps`; files stay under 150 lines.
- [ ] Components only render props and raise callbacks; fetching and stateful logic live in hooks and `api/`.
- [ ] State lives as low as possible and is passed down at most two levels.
- [ ] Effects have correct dependency lists and clean up timers, listeners and in-flight requests (`AbortController`).
- [ ] Lists use stable keys from the data, not the index.
- [ ] Loading, empty and error states are handled for every async call.
- [ ] Expensive work is memoized only where it measurably helps.
- [ ] Heavy libraries are loaded lazily, only on the page that needs them.
- [ ] User HTML is sanitized (DOMPurify) before it is rendered.

### Anti-patterns

- `dangerouslySetInnerHTML` with unsanitized input.
- Derived state copied into `useState` and kept in sync by effects.
- Fetching in an effect without handling unmount or a race between requests.
- Hard-coded UI strings or colors instead of i18n keys and design tokens.
- Prop drilling across many levels where a context or composition fits.
- A page or `Tool.tsx` that holds long markup, `fetch` calls or many effects instead of components and hooks.
- A component that calls `fetch`, reads the router or owns business state.
- Code moved to `packages/ui-kit` without the user's yes recorded in the phase file.
- A reusable component, hook or helper kept in a tool without asking the user about `packages/ui-kit`.
- ui-kit code that calls `t()`, imports a tool or uses a class without the `common-` prefix.
- Disabling the hooks rules instead of fixing the dependency list.

## Node.js

### Best practices

- [ ] The service is created with `createApp()` from `@goblin/server-kit`; shared middleware is not rewritten.
- [ ] Code follows the layers `routes/` → `services/` → `integrations/`; services are tested without HTTP.
- [ ] Every input is validated with Zod before use; limits (size, count, time) are enforced.
- [ ] Errors use `{ code, message }`; every `code` is in `openapi.yaml`.
- [ ] Async errors reach the error handler; no unhandled promise rejections.
- [ ] Outbound requests have timeouts and size limits; user-provided URLs go through the SSRF guard.
- [ ] Expensive resources (e.g. Chromium) are reused per warm instance and closed or relaunched safely.
- [ ] Logs are one structured line per request with metadata only.
- [ ] Cron routes check `CRON_SECRET`.

### Anti-patterns

- Business logic in a route handler, or `req`/`res` passed into a service.
- A route or service calling an SDK or `fetch` directly instead of going through `integrations/`.
- Logging request bodies, user content or secrets.
- Blocking the event loop with sync file or CPU-heavy work in a request path.
- Returning stack traces or internal details to the client.
- Trusting client input for file paths, URLs or shell arguments.
- Keeping state in memory and expecting it to survive between requests or instances.
- Function settings (duration, bundled files) set for the whole toolbox instead of in one tool's service.

## TypeScript

### Best practices

- [ ] Strict mode passes with no new `any`.
- [ ] Types for API data come from the shared Zod schemas (`z.infer`), not duplicated by hand.
- [ ] Unknown input is typed as `unknown` and narrowed.
- [ ] Exhaustive `switch` on unions.

### Anti-patterns

- `as` casts or non-null `!` used to silence the compiler.
- `@ts-ignore` or `@ts-expect-error` without a real reason.
- The same type written in both the UI and the API.

## Security and privacy

### Best practices

- [ ] HTTPS only; no mixed content.
- [ ] User content is not stored unless the tool's design says so, and stored files expire.
- [ ] Generated files use random, unguessable names.
- [ ] New env vars are listed in the tool README; secrets live only in Vercel env vars.
- [ ] Rate limits for new or expensive endpoints are reviewed.

### Anti-patterns

- Secrets in code, tests, fixtures or logs.
- `.env` files, keys or credential JSON staged in git.
- Fetching arbitrary URLs without the request guard.
- CORS opened to `*` on tool APIs.

## Testing

### Best practices

- [ ] New behavior has tests; fixed bugs have a test that failed before the fix.
- [ ] API tests cover success, validation errors and each documented error `code`.
- [ ] i18n key parity tests pass for the Host and every changed tool.
- [ ] UI flows that changed are covered by Playwright with the Host, remote and API running together.
- [ ] Deploying phases check the Vercel preview deployment.

### Anti-patterns

- Tests that depend on the network, the clock or run order without control.
- Snapshot tests used instead of real assertions.
- Skipped or `.only` tests left in the change.
- Mocking the module under test.

## Accessibility

### Best practices

- [ ] Everything works with the keyboard, with a visible focus.
- [ ] Form controls have labels; icons-only buttons have accessible names.
- [ ] Text and controls meet WCAG 2.1 AA contrast in light and dark themes.
- [ ] Status changes (loading, errors) are announced to screen readers.

### Anti-patterns

- Clickable `div`s instead of buttons or links.
- Color as the only way to show state.
- Removing focus outlines without a replacement.
