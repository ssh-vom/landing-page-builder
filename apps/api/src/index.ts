import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

type Env = {
  DB: D1Database;
  NODE_ENV: string;
  PUBLIC_CORS_ORIGINS: string;
};

type GenerationRow = {
  id: string; prompt: string; stage: string; status: string; brief_json: string | null; copy_json: string | null;
  generated_page_id: string; cloudflare_project_name: string | null; deployment_url: string | null; retry_count: number;
  error_message: string | null; created_at: string; updated_at: string;
};

const app = new Hono<{ Bindings: Env }>();
const jsonRecord = z.record(z.unknown());
const emailSchema = z.string().trim().email().max(320);
const stageSchema = z.enum(['planning', 'writing', 'copying', 'building', 'deploying', 'complete']);
const statusSchema = z.enum(['pending', 'in_progress', 'complete', 'failed']);

function now() { return new Date().toISOString(); }
function parseJson<T>(value: string | null): T | null { return value ? JSON.parse(value) as T : null; }
function serializeGeneration(row: GenerationRow) {
  return { ...row, brief: parseJson(row.brief_json), copy: parseJson(row.copy_json), brief_json: undefined, copy_json: undefined };
}
function badRequest(c: any, error: unknown) {
  return c.json({ error: 'invalid_request', details: error instanceof z.ZodError ? error.flatten() : String(error) }, 400);
}

app.use('*', async (c, next) => {
  const configured = c.env.PUBLIC_CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  const origin = c.req.header('origin');
  const allowOrigin = !origin || configured.length === 0 || configured.includes(origin) ? origin : configured[0];
  return cors({ origin: allowOrigin ?? '*', allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'], allowHeaders: ['content-type'] })(c, next);
});

app.get('/health', (c) => c.json({ ok: true, environment: c.env.NODE_ENV ?? 'production', database: 'd1' }));

app.post('/generations', async (c) => {
  const schema = z.object({ prompt: z.string().trim().min(1).max(4000), generated_page_id: z.string().trim().min(1).max(200).optional(), cloudflare_project_name: z.string().trim().min(1).max(200).optional() });
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const id = crypto.randomUUID();
  const generatedPageId = parsed.data.generated_page_id ?? `page_${id}`;
  const ts = now();
  await c.env.DB.prepare(`INSERT INTO generations (id, prompt, stage, status, generated_page_id, cloudflare_project_name, created_at, updated_at) VALUES (?, ?, 'planning', 'pending', ?, ?, ?, ?)`).bind(id, parsed.data.prompt, generatedPageId, parsed.data.cloudflare_project_name ?? null, ts, ts).run();
  const row = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(id).first<GenerationRow>();
  return c.json(serializeGeneration(row!), 201);
});

app.get('/generations', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM generations ORDER BY created_at DESC').all<GenerationRow>();
  return c.json({ generations: rows.results.map(serializeGeneration) });
});

app.get('/generations/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(c.req.param('id')).first<GenerationRow>();
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json(serializeGeneration(row));
});

app.patch('/generations/:id', async (c) => {
  const schema = z.object({ stage: stageSchema.optional(), status: statusSchema.optional(), brief: jsonRecord.optional(), copy: jsonRecord.optional(), cloudflare_project_name: z.string().trim().min(1).max(200).nullable().optional(), deployment_url: z.string().trim().url().nullable().optional(), retry_count: z.number().int().min(0).optional(), error_message: z.string().max(8000).nullable().optional() }).refine((v) => Object.keys(v).length > 0);
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const existing = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(c.req.param('id')).first<GenerationRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  const next = parsed.data;
  await c.env.DB.prepare(`UPDATE generations SET stage=COALESCE(?, stage), status=COALESCE(?, status), brief_json=COALESCE(?, brief_json), copy_json=COALESCE(?, copy_json), cloudflare_project_name=?, deployment_url=?, retry_count=COALESCE(?, retry_count), error_message=?, updated_at=? WHERE id=?`).bind(next.stage ?? null, next.status ?? null, next.brief ? JSON.stringify(next.brief) : null, next.copy ? JSON.stringify(next.copy) : null, 'cloudflare_project_name' in next ? next.cloudflare_project_name : existing.cloudflare_project_name, 'deployment_url' in next ? next.deployment_url : existing.deployment_url, next.retry_count ?? null, 'error_message' in next ? next.error_message : existing.error_message, now(), c.req.param('id')).run();
  const row = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(c.req.param('id')).first<GenerationRow>();
  return c.json(serializeGeneration(row!));
});

app.post('/leads', async (c) => {
  const schema = z.object({ generation_id: z.string().trim().min(1), generated_page_id: z.string().trim().min(1), email: emailSchema, metadata: jsonRecord.optional() });
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const generation = await c.env.DB.prepare('SELECT id, generated_page_id FROM generations WHERE id = ?').bind(parsed.data.generation_id).first<{ id: string; generated_page_id: string }>();
  if (!generation || generation.generated_page_id !== parsed.data.generated_page_id) return c.json({ error: 'invalid_generation' }, 400);
  const id = crypto.randomUUID(); const ts = now();
  await c.env.DB.prepare('INSERT INTO leads (id, generation_id, generated_page_id, email, submission_metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, parsed.data.generation_id, parsed.data.generated_page_id, parsed.data.email, JSON.stringify(parsed.data.metadata ?? {}), ts).run();
  return c.json({ id, generation_id: parsed.data.generation_id, generated_page_id: parsed.data.generated_page_id, email: parsed.data.email, created_at: ts }, 201);
});

app.post('/analytics/events', async (c) => {
  const schema = z.object({ event: z.enum(['landing_page_viewed', 'cta_email_submit_clicked', 'email_capture_submitted', 'email_capture_failed']), generation_id: z.string().trim().min(1).optional(), generated_page_id: z.string().trim().min(1).optional(), project_name: z.string().trim().min(1).optional(), environment: z.string().trim().min(1).optional(), properties: jsonRecord.optional() });
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const properties = { ...(parsed.data.properties ?? {}), generation_id: parsed.data.generation_id ?? parsed.data.properties?.generation_id, generated_page_id: parsed.data.generated_page_id ?? parsed.data.properties?.generated_page_id, project_name: parsed.data.project_name ?? parsed.data.properties?.project_name, environment: parsed.data.environment ?? c.env.NODE_ENV ?? 'production' };
  const id = crypto.randomUUID(); const ts = now();
  await c.env.DB.prepare('INSERT INTO analytics_events (id, event, generation_id, generated_page_id, project_name, environment, properties_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id, parsed.data.event, properties.generation_id ?? null, properties.generated_page_id ?? null, properties.project_name ?? null, String(properties.environment), JSON.stringify(properties), ts).run();
  return c.json({ id, event: parsed.data.event, properties, created_at: ts }, 201);
});

export default app;
