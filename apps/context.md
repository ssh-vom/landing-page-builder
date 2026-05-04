# Code Context

## Files Retrieved
1. `server/src/index.ts` (lines 1-280) - Express API entrypoint, local/persistence routing, generation endpoints, leads, analytics.
2. `server/src/landing/pipeline.ts` (lines 1-157) - Main Node generation/regeneration pipeline orchestration.
3. `server/src/landing/builder.ts` (lines 1-89) - Writes generated React/Vite site source to disk and builds it.
4. `server/src/landing/claudeManaged.ts` (lines 1-70) - Managed Agent wrapper and planner/writer/editor prompts.
5. `server/src/landing/editor.ts` (lines 1-66) - Sends existing generated source to managed editor agent for regeneration.
6. `server/src/landing/deployer.ts` (lines 1-105) - Cloudflare Pages/local deployment implementation.
7. `server/src/config.ts` (lines 1-46) - Runtime env/config knobs for API, persistence, generated sites, Cloudflare, managed agents.
8. `server/src/db.ts` (lines 1-82) - Local SQLite schema and migration, including `project_dir`.
9. `server/src/dataApi.ts` (lines 1-57) - Optional persistence API client used by server.
10. `api/src/index.ts` (lines 1-236) - Cloudflare Worker/Hono persistence+rendering API with D1 and simplified generation.
11. `api/migrations/0001_initial.sql` (lines 1-35) - D1 schema for generations/leads/analytics; no `project_dir`.
12. `api/wrangler.toml` (lines 1-16) - Worker deployment config and D1 binding.
13. `web/src/lib/api.ts` (lines 1-72) - Browser API client and generation type.
14. `web/src/pages/GenerationPage.tsx` (lines 1-130) - Web progress/result/editor UI, polling, iframe preview, regenerate call.
15. `web/src/components/flow/GeneratedSitePreview.tsx` (lines 1-120) - Static marketing/mock generated-site preview only.

## Key Code

### API surfaces
- Web calls `VITE_SERVER_URL || VITE_API_URL || http://localhost:3001` and exposes `createGeneration(prompt)` as `POST /generations` with `{ prompt, run: true }`, `getGeneration`, `listGenerations`, and `regenerateGeneration` (`web/src/lib/api.ts` lines 19-47).
- Server `POST /generations` either forwards row creation to `PERSISTENCE_API_URL` or inserts into local SQLite, then starts `startGenerationPipeline` if `run` is true (`server/src/index.ts` lines 91-117).
- Server supports `/generations/:id/run`, `/generations/:id/regenerate`, list/get/patch, `/leads`, and `/analytics/events` (`server/src/index.ts` lines 120-280).
- Public CORS is limited to `/leads` and `/analytics/events`; admin endpoints allow only `APP_URL` (`server/src/index.ts` lines 15-31). The Worker has broad CORS logic including Pages origins (`api/src/index.ts` lines 145-151).

### Generation pipeline
```ts
// server/src/landing/pipeline.ts lines 76-98
planning -> runManagedJsonAgent('planner') -> writing -> runManagedJsonAgent('writer') -> copying -> building -> buildLandingApp(...) -> deploying -> deployLandingApp(...) -> complete
```
- `runGenerationPipeline` persists stage/status updates either locally or via `dataApi.patchGeneration` (`server/src/landing/pipeline.ts` lines 27-61, 72-103).
- Planner/writer/editor are Claude Managed Agents created per run with `tools: []` and an external `MANAGED_AGENTS_ENVIRONMENT_ID` (`server/src/landing/claudeManaged.ts` lines 29-51). Planner/writer return JSON; editor returns complete file contents.
- Regeneration requires an existing `project_dir`; it reads and edits existing generated source, rebuilds, redeploys (`server/src/landing/pipeline.ts` lines 107-145; `server/src/landing/editor.ts` lines 17-65).

### Generated site build/deploy
- `buildLandingApp` derives `kiloforge-${generatedPageId}`, removes/recreates `config.generatedSitesDir/projectName`, writes `package.json`, `index.html`, `src/main.jsx`, `src/styles.css`, runs `pnpm exec vite build root --outDir root/dist`, and returns `{ project_dir, dist_dir, project_name }` (`server/src/landing/builder.ts` lines 18-89).
- Generated `main.jsx` embeds copy/meta/API/PostHog config and submits leads/analytics back to API (`server/src/landing/builder.ts` lines 39-82).
- `deployLandingApp` deploys either `file://.../dist/index.html` for `DEPLOYMENT_MODE=local` or creates/deploys a Cloudflare Pages project using `wrangler pages project create` and `wrangler pages deploy` with `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` (`server/src/landing/deployer.ts` lines 53-105).

### Persistence
- Local Node persistence is SQLite at `SQLITE_PATH` defaulting to `./data/kiloforge.sqlite`, with `generations`, `leads`, and `analytics_events`; `generations` includes `project_dir` (`server/src/config.ts` lines 6-23; `server/src/db.ts` lines 15-82).
- If `PERSISTENCE_API_URL` is set, server delegates create/list/get/patch/leads/analytics to that API (`server/src/dataApi.ts` lines 17-57; usages in `server/src/index.ts` lines 101-103, 145-176, 221, 250).
- The `api` app is a Cloudflare Worker/Hono+D1 persistence API. Its migration lacks `project_dir` (`api/migrations/0001_initial.sql` lines 1-16), and `GenerationRow` in the Worker also lacks `project_dir` (`api/src/index.ts` lines 16-19).

## Architecture

There are three apps:

1. `web`: React/Vite frontend. It creates and polls generations, shows stage progress, result links, and an editor workspace. The editor preview is just an iframe to `deployment_url`; regeneration sends a prompt to the server (`web/src/pages/GenerationPage.tsx` lines 32-62, 82-116).
2. `server`: Node/Express orchestrator. It can persist locally or through `PERSISTENCE_API_URL`, calls Claude Managed Agents for plan/copy/editor, writes generated site source into `GENERATED_SITES_DIR`, builds with Vite, and deploys to local file or Cloudflare Pages.
3. `api`: Cloudflare Worker/Hono API. It stores D1 records, leads, analytics, can generate copy using regular Anthropic Messages API, and serves generated sites dynamically from D1 at `/sites/:pageId` (`api/src/index.ts` lines 117-142, 198-202). It does not build/deploy actual source files.

Important split: there appear to be two generation modes. The Node `server` pipeline produces visible source files and Cloudflare Pages deploys. The Worker `api` pipeline produces copy and renders HTML at `/sites/:pageId` without filesystem/source-code artifacts.

## Generated/deployed site code visibility to the managed agent

- Initial Node generation: planner/writer managed agents see only prompt/brief JSON, not generated site source. The source is deterministic server-side template code written after copy generation (`server/src/landing/pipeline.ts` lines 76-86; `server/src/landing/builder.ts` lines 39-84).
- Regeneration/editing: the managed editor agent is explicitly sent the current generated `src/main.jsx` and `src/styles.css` contents in the task (`server/src/landing/editor.ts` lines 17-47). Therefore generated site source is visible to the managed agent only during regeneration, and only for those two files.
- Deployed Cloudflare Pages code itself is not fetched back. The editor uses the local `project_dir` copy persisted during build (`server/src/landing/pipeline.ts` lines 87, 116-123).
- If using the Worker/D1 `api` as `PERSISTENCE_API_URL`, `project_dir` is not in the Worker schema/type, so regeneration through Node likely cannot find `project_dir` (`api/migrations/0001_initial.sql` lines 1-16; `api/src/index.ts` lines 16-19; `server/src/landing/pipeline.ts` lines 116-117). This is a key gap.

## Gaps / Risks

- `api` Worker schema and code lack `project_dir`, but Node server persistence client type expects it. This breaks source-backed regeneration when `PERSISTENCE_API_URL` points to the Worker.
- Node server `PATCH /generations/:id` schema does not include `project_dir`, but the pipeline patches `project_dir` via `dataApi.patchGeneration` when using external persistence (`server/src/index.ts` lines 162-172 vs. `server/src/landing/pipeline.ts` lines 87). The Worker patch schema also lacks `project_dir` (`api/src/index.ts` lines 204-212).
- Worker `api` generation is not the same as Node managed-agent pipeline: it uses normal Anthropic Messages API, skips Cloudflare Pages deployment, and serves rendered HTML directly from `/sites/:pageId` (`api/src/index.ts` lines 94-129, 198-202). Clarify intended production architecture.
- Generated source lives under `GENERATED_SITES_DIR` default `./generated-sites` (`server/src/config.ts` line 18), but no route exposes source files to web/admin; only `project_dir` is returned by server serialization (`server/src/index.ts` lines 64-80), while `web/src/lib/api.ts` type omits `project_dir` (lines 3-17).
- `runRegeneratePipeline` deploys with `project_name: generation.generated_page_id`, while initial build uses `kiloforge-${generatedPageId}` (`server/src/landing/pipeline.ts` lines 126-130; `server/src/landing/builder.ts` lines 10-25). This may create/deploy to a different Pages project on regeneration.

## Start Here

Open `server/src/landing/pipeline.ts` first. It shows the real Node generation/regeneration data flow and points directly to managed agents, builder, deployer, persistence, and the `project_dir` dependency that controls whether generated code is visible/editable.
