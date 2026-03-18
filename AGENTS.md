# Agent Operations Guide
## Mission Profile
- Purpose: equip autonomous agents with the context needed to extend and maintain the integration service without human supervision.
- Scope: everything under `src/`, TypeScript tool definitions, Express surface, and infrastructure-in-code found in this repository.
- Mindset: favor incremental, reversible changes; preserve the agent-first tooling workflow already in place.
- North star: keep the integration agent reliable, composable, and secure for new service hookups.
- Golden rule: never leak secrets or persistently mutate integrated service inventories without explicit instruction.
- Delivery target: ship work as small PRs with verifiable behavior and documented commands.

## Repository Layout
- `src/index.ts` bootstraps the Express HTTP interface and wires the agent entry points.
- `src/agent.ts` constructs the `@strands-agents/sdk` agent plus the OpenAI-backed model wrapper.
- `src/tools/fetch.ts` declares the `integrateToolToAgent` and `fetchTool` utilities and delegates persistence to the LowDB helpers.
- `src/persistence/services.ts` stores integrated services via LowDB in `data/services.json` and exposes helper CRUD utilities.
- `src/types/integration.ts` centralizes the shared `Endpoint` and `IntegratedService` type definitions.
- `dist/` holds TypeScript transpilation artifacts; treat it as disposable output.
- `tsconfig.json` extends the Node 24 baseline and enables `allowImportingTsExtensions` for ESM interop.
- `.env` carries local secret material; never commit its contents.
- `package.json` defines dependency graph and scripts; no test harness is pre-wired.

## Runtime & Services
- Node runtime: align with Node 20+; the `@tsconfig/node24` profile expects modern ESM features and global `fetch`.
- Process entrypoint: the Express server listens on port `3000`; adjust via environment variable if desired.
- AI providers: OpenAI (`OPENAI_API_KEY`) and Gemini (`GEMINI_API_KEY`) are loaded via `dotenv`.
- HTTP client: leverage the global `fetch`; prefer `node-fetch`-style features sparingly since native support exists.
- Agent SDK: `@strands-agents/sdk` supplies the agent shell, tool registration, and model bridges.
- Schema validation: `zod` is the canonical choice for tooling input validation.

## Local Setup
- Install dependencies once per checkout: `npm install`.
- Copy `.env` template from secrets manager; populate `OPENAI_API_KEY` and `GEMINI_API_KEY` manually.
- Avoid committing `.env`; rely on `.gitignore` guard already present.

## Command Cheatsheet
- Start watcher-driven dev server:
```bash
npm run dev
```
- Launch the API once without watch (useful for tests and smoke checks):
```bash
npx tsx src/index.ts
```
- Type-check without emitting artifacts (acts as lightweight lint):
```bash
npx tsc --noEmit
```
- Produce transpiled output into `dist/` for tooling that requires JS:
```bash
npx tsc
```

## Testing Approach
- Current state: no automated tests exist; `npm test` intentionally exits with status 1.
- Recommended harness: adopt Node's built-in test runner via `tsx` for seamless TypeScript execution.
- Run the full test suite once introduced:
```bash
npx tsx --test
```
- Execute a single test file (primary ask):
```bash
npx tsx --test src/__tests__/fetch-tool.test.ts
```
- Narrow to one test case by name:
```bash
npx tsx --test --test-name "integrates new service"
```

## Linting & Quality Gates
- No ESLint wiring yet; rely on the `strict` TypeScript compiler settings enforced by `@tsconfig/node24`.
- Introduce ESLint or Biome only when necessary; default stance is minimal tooling to reduce friction for agents.
- Use `npx tsc --noEmit` in CI as a gating step until additional linters are added.
- When adding linting, prefer ESM-aware configs (`moduleResolution: node16`) to match the compiler baseline.
- Treat type errors as blockers; do not suppress via `any` or `@ts-ignore` unless justified in docstrings.
- Keep Prettier unconfigured; follow the manual formatting rules outlined below.

## Formatting & Imports
- File encoding: UTF-8 ASCII; avoid non-ASCII characters unless interacting with external schemas requiring them.
- Indentation: 2 spaces; no tabs.
- Strings: default to double quotes; use template literals for interpolation and triple-backtick multiline strings sparingly.
- Semicolons: omit unless required by the compiler; current codebase is semicolon-free.
- Imports: sort in three blocks—external packages, absolute project imports, relative sibling imports—with blank lines between blocks.
- Use ESM specifiers with explicit extensions (`./agent.js`), matching what the TypeScript compiler emits.
- Prefer named exports for utilities; default exports reserved for the primary `agent` instance.
- Keep import side effects (e.g., `dotenv.config()`) grouped at the top before constant declarations.
- For conditional imports, rely on dynamic `await import()` instead of `require` to maintain ESM purity.

## Type System Patterns
- Favor `interface` or `type` aliases to describe external payloads; keep them co-located with usage when scope is narrow.
- Reuse the exported `Endpoint` and `IntegratedService` types when shaping related data structures.
- Use `zod` schemas as the single source of truth for runtime validation; derive TypeScript types from `z.infer` if duplication arises.
- Keep types immutable: mark arrays as `readonly` when mutation is not required.
- Model discriminated unions for branching logic instead of string-based switch statements when adding new tool actions.
- Avoid `any`; if unavoidable, annotate with TODO comments describing the path to stronger typing.
- Use generics for shared helper utilities that operate on agent tool payloads or fetch responses.
- Document public types with short comments when behavior is not obvious.

## Express Middleware Patterns
- Register JSON body parsing via `app.use(express.json())` before defining routes; keep additional middleware minimal unless required.
- Prefer `async` route handlers with `await`-based control flow to avoid nested `.then()` chains.
- Wrap handler bodies in `try/catch`; respond with structured error payloads that include a `message` and optional `details` field.
- Avoid reading from `req.body` in GET requests; prefer query parameters or POST bodies depending on endpoint semantics.
- Centralize reusable middleware under `src/middleware/` if the surface area grows.
- Log high-level request metadata (method, path, correlation id) using `console.log` for now; upgrade to structured logging later.
- When adding new routes, expose them under descriptive paths (`/integrations`, `/tools/:name`) and align with REST conventions.

## Tooling & Integrations
- `integrateToolToAgent` persists services through LowDB (`src/persistence/services.ts`), writing to `data/services.json`; helpers dedupe by service name.
- `fetchTool` reads from the same store; always guard user flows to ensure the requested service and endpoint exist before issuing fetches.
- Expand the `IntegratedService` schema rather than passing ad-hoc metadata through the tool context.
- When adding new tools, define them in `src/tools/` and export from an index module to keep registration centralized.
- Keep tool descriptions concise yet explicit; agents rely on them for planning.
- Use `zod` refinements to validate endpoint URLs and HTTP methods beyond the basic enum where necessary.
- Consider idempotent callbacks wherever practical to make retries safe.

## State & Data Flow
- The LowDB-backed store (`src/persistence/services.ts`) is the single source of truth; use the exported helper functions instead of mutating data directly.
- Avoid direct mutation outside of the designated tool callbacks; route controllers should consume read-only views returned by `listServices`.
- When persisting state elsewhere, create adapter modules (`src/persistence/<service>.ts`) rather than embedding logic in route handlers.
- Keep responses stable: shape them as `{ data, error }` objects for predictable consumption.

## Error Handling & Logging
- Throw rich `Error` instances with clear messages from tool callbacks; the agent SDK surfaces these to calling contexts.
- Translate low-level errors into HTTP 4xx/5xx responses with actionable payloads.
- Log errors once at the boundary; avoid double-logging within nested helpers.
- Use `console.error` for unexpected failures; reserve `console.log` for high-level status messages.
- Avoid leaking secrets in logs; redact URLs that include credentials.
- Plan to introduce a centralized error handler middleware when routes multiply.

## Security & Secrets
- Required environment variables: `OPENAI_API_KEY`, `GEMINI_API_KEY`; add new keys in uppercase snake case.
- Store secrets exclusively in `.env` or your orchestrator; never inline them in source.
- Validate incoming payloads with `zod` before invoking external services to prevent SSRF or injection.
- Enforce HTTPS when constructing external URLs; reject non-HTTPS endpoints during integration.
- Scrub user-provided data before logging or echoing back in responses.
- Keep dependency upgrades current to minimize supply-chain risk; audit with `npm audit` quarterly.
- Ensure `data/` remains gitignored; sanitize the persisted payloads if they ever include sensitive metadata.

## Cursor & Copilot Rules
- No `.cursor/rules/` or `.cursorrules` files detected; Cursor runs without repo-specific overrides.
- No `.github/copilot-instructions.md` present; GitHub Copilot defaults apply.
- Document any future assistant rules here to keep autonomous agents aware of constraints.

## PR Flow & Review Tips
- Create feature branches per task; keep commits small and descriptive.
- Run `npx tsc --noEmit` plus any added tests before opening a PR.
- Include reproduction steps or endpoint call examples in PR descriptions for reviewer context.
- Request reviews from maintainers familiar with the affected surface (tools vs. routes) to accelerate feedback.
- Ensure new environment variables are mirrored in deployment manifests before merging.
