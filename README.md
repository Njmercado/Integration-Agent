# Agent API Construction

Agent API Construction is an Express + TypeScript proof of concept that hosts an automation agent capable of integrating external HTTP services on demand. Agents register new services through the `integrateToolToAgent` tool, persist them via LowDB, and then invoke endpoints with the `fetchTool` helper. This repository contains the HTTP surface, TypeScript tool definitions, and persistence layer that keep the agent composable.

## Features
- Express 5 server with `/` and `/integrations` routes for agent orchestration and discovery.
- Agent powered by `@strands-agents/sdk` with OpenAI-backed model configuration.
- LowDB persistence (`data/services.json`) so integrations survive restarts without a full database install.
- TypeScript-first setup using `tsx` for hot reloading and `tsc` for strict type checking.

## Architecture Overview
- `src/index.ts` – boots the Express app, exposes REST endpoints, and proxies requirements to the agent.
- `src/agent.ts` – instantiates the `@strands-agents/sdk` agent with OpenAI model credentials and available tools.
- `src/tools/fetch.ts` – defines `integrateToolToAgent` and `fetchTool`, delegating persistence to LowDB helpers.
- `src/persistence/services.ts` – wraps LowDB read/write helpers for integrated services and endpoints.
- `src/types/integration.ts` – shared `IntegratedService` and `Endpoint` types consumed across the codebase.
- `data/services.json` – generated automatically; stores integrated services (ignored by git).

Refer to `AGENTS.md` for deeper operational guidance tailored to autonomous agents collaborating on this project.

## Prerequisites
- Node.js 20 or newer (Node 22 LTS recommended).
- npm 8+ (bundled with modern Node releases).
- OpenAI and Gemini API keys stored in a local `.env` file.

## Environment Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` in the project root (see `.env example` below) and populate `MODEL_API_KEY`, `MODEL`, and `PORT` if you need a non-default value.
3. Ensure `data/` directory remains gitignored; it will be created on demand by LowDB.

### `.env` example
```
MODEL_API_KEY=sk-xxx
MODEL=ya29.xxx
PORT=3000
```

## Local Development Workflow
- Start the development server with automatic reloads:
  ```bash
  npm run dev
  ```
  This runs `tsx --watch src/index.ts`, compiling TypeScript in-memory and restarting on changes.

- Run the server once without watch (useful for smoke tests):
  ```bash
  npx tsx src/index.ts
  ```

- Type-check the project without emitting JS (acts as lint equivalent):
  ```bash
  npx tsc --noEmit
  ```

- Transpile TypeScript into `dist/` if a tool requires JavaScript output:
  ```bash
  npx tsc
  ```

## Testing
No automated tests ship with the repo yet. Recommended approach when adding tests is to use `tsx --test`:
```bash
npx tsx --test
```
Run a single file:
```bash
npx tsx --test src/__tests__/fetch-tool.test.ts
```
Filter by test name:
```bash
npx tsx --test --test-name "integrates new service"
```
Update `package.json` to `"test": "tsx --test"` once real tests are added.

## Persistence Details
- Services are persisted in `data/services.json` through LowDB.
- Helper functions in `src/persistence/services.ts` expose `listServices`, `findServiceByName`, and `upsertService`.
- The agent’s integrate tool writes to disk on every update, ensuring restart resilience.
- `data/` is gitignored; delete the JSON file to reset the catalog.

## HTTP API

### `GET /`
- Purpose: invoke the agent with a requirement payload.
- Body: `{ "requirement": string }`
- Response: `{ "response": any }` – whatever the agent returns.

### `GET /integrations`
- Purpose: list all currently integrated services.
- Response: `{ "integrations": Array<IntegratedService> }`.

### `POST /`
- Purpose: feed raw service details for integration. Typically consumed by the agent itself.
- Body: arbitrary JSON forwarded to the agent as part of the requirement string.
- Response: `{ "message": "Integration added successfully" }`.

## Limitations
- This proof of concept only supports creating and reading integrations. Update, removal, or performance-tuning workflows are intentionally out of scope.
- For now the agent operates as a single-process service; horizontal scaling and advanced caching strategies remain future work.

## Local Deployment Guide
Deploy locally using the steps below. This mirrors how you might host the agent in a dedicated process.

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the project (optional for ESM runtime, but useful for sanity checks)**
   ```bash
   npx tsc
   ```

3. **Prepare environment**
   - Ensure `.env` includes valid `OPENAI_API_KEY` and `GEMINI_API_KEY`.
   - Verify `data/services.json` exists or will be created automatically on first integration.

4. **Launch the server**
   ```bash
   node dist/src/index.js
   ```
   - If you prefer running directly from TypeScript without building:
     ```bash
     npx tsx src/index.ts
     ```

5. **Verify health**
   - `curl http://localhost:3000/integrations` should return `{ "integrations": [] }` on first run.
   - POST a payload to `/` or exercise the agent to add services; check `data/services.json` for persisted records.

6. **Manage process**
   - Use a process manager such as `pm2` or `forever` if you need auto-restart on crashes.
   - Mount `data/` to durable storage when running in Docker or other environments.

## Project Structure
```
├── src
│   ├── agent.ts
│   ├── index.ts
│   ├── persistence
│   │   └── services.ts
│   ├── tools
│   │   └── fetch.ts
│   └── types
│       └── integration.ts
├── data
│   └── services.json (generated)
├── package.json
├── tsconfig.json
├── AGENTS.md
└── README.md
```

## Coding Standards
- TypeScript strict mode with ESM `node16` resolution.
- Imports grouped as: external packages, absolute project modules, relative modules.
- 2-space indentation, double quotes, no semicolons unless required.
- Do not introduce `any`; prefer `zod` schemas and shared types from `src/types/integration.ts`.
- Reference `AGENTS.md` for the comprehensive style, tooling, and workflow guide.

## Contributing
1. Fork or branch from `main`.
2. Install dependencies and run `npm run dev` to work locally.
3. Before submitting a PR, run `npx tsc --noEmit` and any new tests.
4. Document new environment variables or infrastructure requirements in both `README.md` and `AGENTS.md`.
5. Keep changes small and well-documented for future agents to follow.

## License
ISC License – see `package.json` for details.

## Contact
Maintained by Nino Mercado (`package.json` author). Raise issues or PRs for enhancements.
