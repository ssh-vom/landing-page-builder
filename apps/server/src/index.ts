import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { config } from './config.js';
import * as dataApi from './dataApi.js';
import { getDb, migrate } from './db.js';
import { startGenerationPipeline, startRegeneratePipeline } from './landing/pipeline.js';

migrate();

const app = express();
const db = getDb();

const adminCors = cors({ origin: config.appUrl, credentials: false });
const publicCors = cors({
  origin(origin, callback) {
    const allowedOrigins = new Set([config.appUrl, ...config.publicCorsOrigins]);
    const isCloudflarePages = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)?\.pages\.dev$/i.test(origin ?? '');
    if (!origin || allowedOrigins.has(origin) || isCloudflarePages) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: false,
});

app.use((req, res, next) => {
  if (req.path === '/leads' || req.path === '/analytics/events') {
    return publicCors(req, res, next);
  }
  return adminCors(req, res, next);
});
app.use(express.json({ limit: '1mb' }));

const stageSchema = z.enum(['planning', 'writing', 'copying', 'building', 'deploying', 'complete']);
const statusSchema = z.enum(['pending', 'in_progress', 'complete', 'failed']);
const emailSchema = z.string().trim().email().max(320);
const jsonRecord = z.record(z.unknown());

function now() {
  return new Date().toISOString();
}

function parseJson<T>(value: string | null): T | null {
  return value ? (JSON.parse(value) as T) : null;
}

type GenerationRow = {
  id: string;
  prompt: string;
  stage: string;
  status: string;
  brief_json: string | null;
  copy_json: string | null;
  generated_page_id: string;
  cloudflare_project_name: string | null;
  deployment_url: string | null;
  project_dir: string | null;
  git_repo_url: string | null;
  git_branch: string | null;
  git_commit_sha: string | null;
  retry_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

function serializeGeneration(row: GenerationRow) {
  return {
    id: row.id,
    prompt: row.prompt,
    stage: row.stage,
    status: row.status,
    brief: parseJson(row.brief_json),
    copy: parseJson(row.copy_json),
    generated_page_id: row.generated_page_id,
    cloudflare_project_name: row.cloudflare_project_name,
    deployment_url: row.deployment_url,
    project_dir: row.project_dir,
    git_repo_url: row.git_repo_url,
    git_branch: row.git_branch,
    git_commit_sha: row.git_commit_sha,
    retry_count: row.retry_count,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function badRequest(res: express.Response, error: unknown) {
  return res.status(400).json({ error: 'invalid_request', details: error instanceof z.ZodError ? error.flatten() : String(error) });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, environment: config.nodeEnv });
});

app.post('/generations', async (req, res) => {
  const schema = z.object({
    prompt: z.string().trim().min(1).max(4000),
    generated_page_id: z.string().trim().min(1).max(200).optional(),
    cloudflare_project_name: z.string().trim().min(1).max(200).optional(),
    run: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);

  if (dataApi.hasPersistenceApi()) {
    const row = await dataApi.createGeneration({ prompt: parsed.data.prompt, generated_page_id: parsed.data.generated_page_id, cloudflare_project_name: parsed.data.cloudflare_project_name });
    if (parsed.data.run) startGenerationPipeline(db, row.id);
    return res.status(201).json(row);
  }

  const id = randomUUID();
  const generatedPageId = parsed.data.generated_page_id ?? `page_${id}`;
  const timestamp = now();
  db.prepare(`
    INSERT INTO generations (id, prompt, stage, status, generated_page_id, cloudflare_project_name, created_at, updated_at)
    VALUES (?, ?, 'planning', 'pending', ?, ?, ?, ?)
  `).run(id, parsed.data.prompt, generatedPageId, parsed.data.cloudflare_project_name ?? null, timestamp, timestamp);

  const row = db.prepare('SELECT * FROM generations WHERE id = ?').get(id) as GenerationRow;
  if (parsed.data.run) startGenerationPipeline(db, id);
  res.status(201).json(serializeGeneration(row));
});

app.post('/generations/:id/run', async (req, res) => {
  const row = dataApi.hasPersistenceApi()
    ? await dataApi.getGeneration(req.params.id).catch(() => undefined)
    : db.prepare('SELECT * FROM generations WHERE id = ?').get(req.params.id) as GenerationRow | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  if (row.status === 'in_progress') return res.status(409).json({ error: 'already_running' });
  startGenerationPipeline(db, req.params.id);
  res.status(202).json({ accepted: true, generation_id: req.params.id });
});

app.post('/generations/:id/regenerate', async (req, res) => {
  const schema = z.object({ prompt: z.string().trim().min(1).max(4000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);

  const row = dataApi.hasPersistenceApi()
    ? await dataApi.getGeneration(req.params.id).catch(() => undefined)
    : db.prepare('SELECT * FROM generations WHERE id = ?').get(req.params.id) as GenerationRow | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  if (row.status === 'in_progress') return res.status(409).json({ error: 'already_running' });

  startRegeneratePipeline(db, req.params.id, parsed.data.prompt);
  res.status(202).json({ accepted: true, generation_id: req.params.id });
});

app.get('/generations', async (_req, res) => {
  if (dataApi.hasPersistenceApi()) return res.json(await dataApi.listGenerations());
  const rows = db.prepare('SELECT * FROM generations ORDER BY created_at DESC').all() as GenerationRow[];
  res.json({ generations: rows.map(serializeGeneration) });
});

app.get('/generations/:id', async (req, res) => {
  if (dataApi.hasPersistenceApi()) {
    const row = await dataApi.getGeneration(req.params.id).catch(() => undefined);
    if (!row) return res.status(404).json({ error: 'not_found' });
    return res.json(row);
  }
  const row = db.prepare('SELECT * FROM generations WHERE id = ?').get(req.params.id) as GenerationRow | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  res.json(serializeGeneration(row));
});

app.patch('/generations/:id', async (req, res) => {
  const schema = z.object({
    stage: stageSchema.optional(),
    status: statusSchema.optional(),
    brief: jsonRecord.optional(),
    copy: jsonRecord.optional(),
    cloudflare_project_name: z.string().trim().min(1).max(200).nullable().optional(),
    deployment_url: z.string().trim().url().nullable().optional(),
    project_dir: z.string().trim().min(1).max(1000).nullable().optional(),
    git_repo_url: z.string().trim().min(1).max(1000).nullable().optional(),
    git_branch: z.string().trim().min(1).max(255).nullable().optional(),
    git_commit_sha: z.string().trim().regex(/^[0-9a-f]{7,64}$/i).nullable().optional(),
    retry_count: z.number().int().min(0).optional(),
    error_message: z.string().max(8000).nullable().optional(),
  }).refine((value) => Object.keys(value).length > 0, 'at least one field is required');
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);

  if (dataApi.hasPersistenceApi()) return res.json(await dataApi.patchGeneration(req.params.id, parsed.data));

  const existing = db.prepare('SELECT * FROM generations WHERE id = ?').get(req.params.id) as GenerationRow | undefined;
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const next = { ...parsed.data };
  db.prepare(`
    UPDATE generations SET
      stage = COALESCE(?, stage),
      status = COALESCE(?, status),
      brief_json = COALESCE(?, brief_json),
      copy_json = COALESCE(?, copy_json),
      cloudflare_project_name = ?,
      deployment_url = ?,
      project_dir = ?,
      git_repo_url = ?,
      git_branch = ?,
      git_commit_sha = ?,
      retry_count = COALESCE(?, retry_count),
      error_message = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    next.stage ?? null,
    next.status ?? null,
    next.brief ? JSON.stringify(next.brief) : null,
    next.copy ? JSON.stringify(next.copy) : null,
    'cloudflare_project_name' in next ? next.cloudflare_project_name : existing.cloudflare_project_name,
    'deployment_url' in next ? next.deployment_url : existing.deployment_url,
    'project_dir' in next ? next.project_dir : existing.project_dir,
    'git_repo_url' in next ? next.git_repo_url : existing.git_repo_url,
    'git_branch' in next ? next.git_branch : existing.git_branch,
    'git_commit_sha' in next ? next.git_commit_sha : existing.git_commit_sha,
    next.retry_count ?? null,
    'error_message' in next ? next.error_message : existing.error_message,
    now(),
    req.params.id,
  );

  const row = db.prepare('SELECT * FROM generations WHERE id = ?').get(req.params.id) as GenerationRow;
  res.json(serializeGeneration(row));
});

app.post('/leads', async (req, res) => {
  const schema = z.object({
    generation_id: z.string().trim().min(1),
    generated_page_id: z.string().trim().min(1),
    email: emailSchema,
    metadata: jsonRecord.optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);

  if (dataApi.hasPersistenceApi()) return res.status(201).json(await dataApi.createLead(parsed.data));

  const generation = db.prepare('SELECT id, generated_page_id FROM generations WHERE id = ?').get(parsed.data.generation_id) as { id: string; generated_page_id: string } | undefined;
  if (!generation || generation.generated_page_id !== parsed.data.generated_page_id) {
    return res.status(400).json({ error: 'invalid_generation' });
  }

  const id = randomUUID();
  const timestamp = now();
  db.prepare(`
    INSERT INTO leads (id, generation_id, generated_page_id, email, submission_metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, parsed.data.generation_id, parsed.data.generated_page_id, parsed.data.email, JSON.stringify(parsed.data.metadata ?? {}), timestamp);

  res.status(201).json({ id, generation_id: parsed.data.generation_id, generated_page_id: parsed.data.generated_page_id, email: parsed.data.email, created_at: timestamp });
});

app.post('/analytics/events', async (req, res) => {
  const schema = z.object({
    event: z.enum(['landing_page_viewed', 'cta_email_submit_clicked', 'email_capture_submitted', 'email_capture_failed']),
    generation_id: z.string().trim().min(1).optional(),
    generated_page_id: z.string().trim().min(1).optional(),
    project_name: z.string().trim().min(1).optional(),
    cloudflare_project_name: z.string().trim().min(1).optional(),
    deployment_url: z.string().trim().url().optional(),
    site_url: z.string().trim().url().optional(),
    environment: z.string().trim().min(1).optional(),
    properties: jsonRecord.optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error);

  if (dataApi.hasPersistenceApi()) return res.status(201).json(await dataApi.trackAnalyticsEvent(parsed.data));

  const properties = {
    ...(parsed.data.properties ?? {}),
    generation_id: parsed.data.generation_id ?? parsed.data.properties?.generation_id,
    generated_page_id: parsed.data.generated_page_id ?? parsed.data.properties?.generated_page_id,
    project_name: parsed.data.project_name ?? parsed.data.properties?.project_name,
    cloudflare_project_name: parsed.data.cloudflare_project_name ?? parsed.data.properties?.cloudflare_project_name,
    deployment_url: parsed.data.deployment_url ?? parsed.data.properties?.deployment_url,
    site_url: parsed.data.site_url ?? parsed.data.properties?.site_url,
    environment: parsed.data.environment ?? config.nodeEnv,
  };
  const id = randomUUID();
  const timestamp = now();
  db.prepare(`
    INSERT INTO analytics_events (id, event, generation_id, generated_page_id, project_name, environment, properties_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    parsed.data.event,
    properties.generation_id ?? null,
    properties.generated_page_id ?? null,
    properties.project_name ?? null,
    String(properties.environment),
    JSON.stringify(properties),
    timestamp,
  );

  res.status(201).json({ id, event: parsed.data.event, properties, created_at: timestamp });
});

app.listen(config.port, () => {
  console.log(`server listening on http://localhost:${config.port}`);
});
