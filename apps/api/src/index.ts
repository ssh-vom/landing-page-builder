import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

type Env = {
  DB: D1Database;
  NODE_ENV: string;
  PUBLIC_CORS_ORIGINS: string;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  POSTHOG_KEY: string;
  POSTHOG_HOST: string;
  API_URL: string;
};

type GenerationRow = {
  id: string; prompt: string; stage: string; status: string; brief_json: string | null; copy_json: string | null;
  generated_page_id: string; cloudflare_project_name: string | null; deployment_url: string | null; project_dir: string | null;
  git_repo_url: string | null; git_branch: string | null; git_commit_sha: string | null; retry_count: number;
  error_message: string | null; created_at: string; updated_at: string;
};

type LandingBrief = {
  product_category: string;
  target_audience: string;
  pain_point: string;
  value_proposition: string;
  cta_goal: string;
  sections: string[];
  tone: string;
  visual_direction: string;
  prompt_summary: string;
};

type LandingCopy = {
  hero_headline: string;
  hero_subheadline: string;
  benefits: Array<{ title: string; body: string }>;
  how_it_works: Array<{ title: string; body: string }>;
  cta_heading: string;
  cta_body: string;
  email_label: string;
  email_placeholder: string;
  submit_label: string;
  footer: string;
};

const app = new Hono<{ Bindings: Env }>();
const jsonRecord = z.record(z.unknown());
const emailSchema = z.string().trim().email().max(320);
const stageSchema = z.enum(['planning', 'writing', 'copying', 'building', 'deploying', 'complete']);
const statusSchema = z.enum(['pending', 'in_progress', 'complete', 'failed']);

function now() { return new Date().toISOString(); }
function parseJson<T>(value: string | null): T | null { return value ? JSON.parse(value) as T : null; }
function serializeGeneration(row: GenerationRow) {
  const { brief_json, copy_json, ...rest } = row;
  return { ...rest, brief: parseJson(brief_json), copy: parseJson(copy_json) };
}
function badRequest(c: any, error: unknown) {
  return c.json({ error: 'invalid_request', details: error instanceof z.ZodError ? error.flatten() : String(error) }, 400);
}
function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
}
function js(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
function publicApiUrl(c: any) { return c.env.API_URL || new URL(c.req.url).origin; }
function projectName(pageId: string) { return `kiloforge-${pageId.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 48)}`.toLowerCase(); }

async function patchGeneration(c: any, id: string, input: Partial<{ stage: string; status: string; brief: LandingBrief; copy: LandingCopy; cloudflare_project_name: string | null; deployment_url: string | null; project_dir: string | null; git_repo_url: string | null; git_branch: string | null; git_commit_sha: string | null; retry_count: number; error_message: string | null }>) {
  const existing = await (c.env.DB as D1Database).prepare('SELECT * FROM generations WHERE id = ?').bind(id).first<GenerationRow>();
  if (!existing) throw new Error(`Generation not found: ${id}`);
  await c.env.DB.prepare(`UPDATE generations SET stage=COALESCE(?, stage), status=COALESCE(?, status), brief_json=COALESCE(?, brief_json), copy_json=COALESCE(?, copy_json), cloudflare_project_name=?, deployment_url=?, project_dir=?, git_repo_url=?, git_branch=?, git_commit_sha=?, retry_count=COALESCE(?, retry_count), error_message=?, updated_at=? WHERE id=?`).bind(
    input.stage ?? null,
    input.status ?? null,
    input.brief ? JSON.stringify(input.brief) : null,
    input.copy ? JSON.stringify(input.copy) : null,
    'cloudflare_project_name' in input ? input.cloudflare_project_name : existing.cloudflare_project_name,
    'deployment_url' in input ? input.deployment_url : existing.deployment_url,
    'project_dir' in input ? input.project_dir : existing.project_dir,
    'git_repo_url' in input ? input.git_repo_url : existing.git_repo_url,
    'git_branch' in input ? input.git_branch : existing.git_branch,
    'git_commit_sha' in input ? input.git_commit_sha : existing.git_commit_sha,
    input.retry_count ?? null,
    'error_message' in input ? input.error_message : existing.error_message,
    now(), id,
  ).run();
}

function stripJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error(`Claude did not return JSON: ${text.slice(0, 500)}`);
  return candidate.slice(start, end + 1);
}

async function claudeJson<T>(c: any, system: string, prompt: string): Promise<T> {
  if (!c.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': c.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: c.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 1800,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json<any>();
  if (!response.ok) throw new Error(data?.error?.message ?? `Anthropic request failed: ${response.status}`);
  const text = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n') ?? '';
  return JSON.parse(stripJson(text)) as T;
}

async function runGeneration(c: any, id: string) {
  const row = await (c.env.DB as D1Database).prepare('SELECT * FROM generations WHERE id = ?').bind(id).first<GenerationRow>();
  if (!row) throw new Error('not_found');
  try {
    await patchGeneration(c, id, { stage: 'planning', status: 'in_progress', error_message: null });
    const brief = await claudeJson<LandingBrief>(c, 'Expand a short landing-page prompt into conservative structured JSON. Do not invent testimonials, logos, stats, customer counts, or unsupported claims. Return only JSON matching {"product_category":"","target_audience":"","pain_point":"","value_proposition":"","cta_goal":"email_capture","sections":["Hero","Benefits","How it works","CTA","Footer"],"tone":"","visual_direction":"","prompt_summary":""}.', `Prompt: ${row.prompt}`);
    await patchGeneration(c, id, { stage: 'writing', brief });
    const copy = await claudeJson<LandingCopy>(c, 'Write clear conversion-oriented landing page copy from a structured brief. Do not fabricate trust signals, testimonials, stats, logos, or business facts. Return only JSON matching {"hero_headline":"","hero_subheadline":"","benefits":[{"title":"","body":""}],"how_it_works":[{"title":"","body":""}],"cta_heading":"","cta_body":"","email_label":"Email","email_placeholder":"you@example.com","submit_label":"Join the list","footer":""}.', `Brief JSON:\n${JSON.stringify(brief, null, 2)}`);
    await patchGeneration(c, id, { stage: 'copying', copy });
    await patchGeneration(c, id, { stage: 'building' });
    const name = projectName(row.generated_page_id);
    const url = `${publicApiUrl(c)}/sites/${encodeURIComponent(row.generated_page_id)}`;
    await patchGeneration(c, id, { stage: 'complete', status: 'complete', cloudflare_project_name: name, deployment_url: url, error_message: null });
  } catch (error) {
    await patchGeneration(c, id, { status: 'failed', error_message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

function renderSite(c: any, generation: ReturnType<typeof serializeGeneration>) {
  const copy = generation.copy as LandingCopy;
  const meta = { generation_id: generation.id, generated_page_id: generation.generated_page_id, project_name: generation.cloudflare_project_name, cloudflare_project_name: generation.cloudflare_project_name, deployment_url: generation.deployment_url, site_url: generation.deployment_url, environment: c.env.NODE_ENV ?? 'production' };
  const apiUrl = publicApiUrl(c);
  const posthogKey = c.env.POSTHOG_KEY || '';
  const posthogHost = c.env.POSTHOG_HOST || 'https://us.i.posthog.com';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${escapeHtml(copy.hero_headline)}</title><meta name="description" content="${escapeHtml(copy.hero_subheadline)}"/><style>:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#111827;background:#f8fafc}body{margin:0}main{max-width:1120px;margin:0 auto;padding:32px 20px 56px}.hero{padding:88px 0;text-align:center}.eyebrow{color:#4f46e5;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:700}h1{font-size:clamp(42px,8vw,82px);line-height:.95;margin:16px 0}p{color:#4b5563;font-size:18px;line-height:1.7}.button,button{background:#111827;color:white;border:0;border-radius:999px;padding:14px 22px;font-weight:700;text-decoration:none;cursor:pointer}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}.card,.cta,.steps{background:white;border:1px solid #e5e7eb;border-radius:28px;padding:28px;box-shadow:0 20px 60px #0f172a0d}.steps,.cta{margin-top:20px}.step{display:flex;gap:16px;border-top:1px solid #e5e7eb;padding:18px 0}.step span{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#eef2ff;color:#4f46e5;font-weight:800;flex:0 0 auto}form{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px}label{text-align:left;color:#374151;font-weight:700}input{display:block;margin-top:8px;min-width:280px;border:1px solid #d1d5db;border-radius:999px;padding:14px 16px;font:inherit}.success{color:#047857}.error{color:#b91c1c}footer{text-align:center;margin-top:40px;color:#6b7280}</style></head><body><main><section class="hero"><p class="eyebrow">Early access</p><h1>${escapeHtml(copy.hero_headline)}</h1><p>${escapeHtml(copy.hero_subheadline)}</p><a href="#join" class="button">${escapeHtml(copy.submit_label)}</a></section><section class="grid">${copy.benefits.map((item) => `<article class="card"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p></article>`).join('')}</section><section class="steps"><h2>How it works</h2>${copy.how_it_works.map((item, i) => `<div class="step"><span>${i + 1}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div></div>`).join('')}</section><section id="join" class="cta"><h2>${escapeHtml(copy.cta_heading)}</h2><p>${escapeHtml(copy.cta_body)}</p><form id="lead-form"><label>${escapeHtml(copy.email_label)}<input id="email" required type="email" placeholder="${escapeHtml(copy.email_placeholder)}"/></label><button id="submit">${escapeHtml(copy.submit_label)}</button></form><p id="message"></p></section><footer>${escapeHtml(copy.footer)}</footer></main><script>const meta=${js(meta)};const apiUrl=${js(apiUrl)};const posthogKey=${js(posthogKey)};const posthogHost=${js(posthogHost)};function capturePostHog(event,properties){if(!posthogKey)return;fetch(posthogHost.replace(/\/$/,'')+'/capture/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({api_key:posthogKey,event,distinct_id:localStorage.getItem('kf_distinct_id')||(localStorage.setItem('kf_distinct_id',crypto.randomUUID()),localStorage.getItem('kf_distinct_id')),properties})}).catch(()=>{})}function track(event,properties={}){const payload={...meta,...properties};capturePostHog(event,payload);fetch(apiUrl+'/analytics/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event,...payload})}).catch(()=>{})}track('landing_page_viewed');document.getElementById('lead-form').addEventListener('submit',async(e)=>{e.preventDefault();const btn=document.getElementById('submit');const msg=document.getElementById('message');btn.textContent='Submitting…';track('cta_email_submit_clicked');const email=document.getElementById('email').value;const response=await fetch(apiUrl+'/leads',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...meta,email,metadata:{source:'generated_landing_page'}})}).catch(()=>null);if(response&&response.ok){msg.className='success';msg.textContent='Thanks — you are on the list.';track('email_capture_submitted')}else{msg.className='error';msg.textContent='Something went wrong. Please try again.';track('email_capture_failed')}btn.textContent=${js(copy.submit_label)}})</script></body></html>`;
}

app.use('*', async (c, next) => {
  const configured = (c.env.PUBLIC_CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  const origin = c.req.header('origin');
  const isCloudflare = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)?\.pages\.dev$/i.test(origin ?? '');
  const allowOrigin = !origin || configured.includes(origin) || isCloudflare ? origin : configured[0];
  return cors({ origin: allowOrigin ?? '*', allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'], allowHeaders: ['content-type'] })(c, next);
});

app.get('/health', (c) => c.json({ ok: true, environment: c.env.NODE_ENV ?? 'production', database: 'd1' }));

app.post('/generations', async (c) => {
  const schema = z.object({ prompt: z.string().trim().min(1).max(4000), generated_page_id: z.string().trim().min(1).max(200).optional(), cloudflare_project_name: z.string().trim().min(1).max(200).optional(), run: z.boolean().optional() });
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const id = crypto.randomUUID();
  const generatedPageId = parsed.data.generated_page_id ?? `page_${id}`;
  const ts = now();
  await c.env.DB.prepare(`INSERT INTO generations (id, prompt, stage, status, generated_page_id, cloudflare_project_name, created_at, updated_at) VALUES (?, ?, 'planning', 'pending', ?, ?, ?, ?)`).bind(id, parsed.data.prompt, generatedPageId, parsed.data.cloudflare_project_name ?? null, ts, ts).run();
  const row = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(id).first<GenerationRow>();
  if (parsed.data.run) c.executionCtx.waitUntil(runGeneration(c, id));
  return c.json(serializeGeneration(row!), 201);
});

app.post('/generations/:id/run', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(c.req.param('id')).first<GenerationRow>();
  if (!row) return c.json({ error: 'not_found' }, 404);
  if (row.status === 'in_progress') return c.json({ error: 'already_running' }, 409);
  c.executionCtx.waitUntil(runGeneration(c, c.req.param('id')));
  return c.json({ accepted: true, generation_id: c.req.param('id') }, 202);
});

app.post('/generations/:id/regenerate', async (c) => {
  const schema = z.object({ prompt: z.string().trim().min(1).max(4000) });
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const existing = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(c.req.param('id')).first<GenerationRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  await c.env.DB.prepare('UPDATE generations SET prompt=?, stage=?, status=?, error_message=?, updated_at=? WHERE id=?').bind(parsed.data.prompt, 'planning', 'pending', null, now(), c.req.param('id')).run();
  c.executionCtx.waitUntil(runGeneration(c, c.req.param('id')));
  return c.json({ accepted: true, generation_id: c.req.param('id') }, 202);
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

app.get('/sites/:pageId', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM generations WHERE generated_page_id = ? AND status = ? ORDER BY updated_at DESC LIMIT 1').bind(c.req.param('pageId'), 'complete').first<GenerationRow>();
  if (!row) return c.text('Site not found', 404);
  return c.html(renderSite(c, serializeGeneration(row)));
});

app.patch('/generations/:id', async (c) => {
  const schema = z.object({ stage: stageSchema.optional(), status: statusSchema.optional(), brief: jsonRecord.optional(), copy: jsonRecord.optional(), cloudflare_project_name: z.string().trim().min(1).max(200).nullable().optional(), deployment_url: z.string().trim().url().nullable().optional(), project_dir: z.string().trim().min(1).max(1000).nullable().optional(), git_repo_url: z.string().trim().min(1).max(1000).nullable().optional(), git_branch: z.string().trim().min(1).max(255).nullable().optional(), git_commit_sha: z.string().trim().regex(/^[0-9a-f]{7,64}$/i).nullable().optional(), retry_count: z.number().int().min(0).optional(), error_message: z.string().max(8000).nullable().optional() }).refine((v) => Object.keys(v).length > 0);
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const existing = await c.env.DB.prepare('SELECT * FROM generations WHERE id = ?').bind(c.req.param('id')).first<GenerationRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  await patchGeneration(c, c.req.param('id'), parsed.data as any);
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
  const schema = z.object({ event: z.enum(['landing_page_viewed', 'cta_email_submit_clicked', 'email_capture_submitted', 'email_capture_failed']), generation_id: z.string().trim().min(1).optional(), generated_page_id: z.string().trim().min(1).optional(), project_name: z.string().trim().min(1).optional(), cloudflare_project_name: z.string().trim().min(1).optional(), deployment_url: z.string().trim().url().optional(), site_url: z.string().trim().url().optional(), environment: z.string().trim().min(1).optional(), properties: jsonRecord.optional() });
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return badRequest(c, parsed.error);
  const properties = { ...(parsed.data.properties ?? {}), generation_id: parsed.data.generation_id ?? parsed.data.properties?.generation_id, generated_page_id: parsed.data.generated_page_id ?? parsed.data.properties?.generated_page_id, project_name: parsed.data.project_name ?? parsed.data.properties?.project_name, cloudflare_project_name: parsed.data.cloudflare_project_name ?? parsed.data.properties?.cloudflare_project_name, deployment_url: parsed.data.deployment_url ?? parsed.data.properties?.deployment_url, site_url: parsed.data.site_url ?? parsed.data.properties?.site_url, environment: parsed.data.environment ?? c.env.NODE_ENV ?? 'production' };
  const id = crypto.randomUUID(); const ts = now();
  await c.env.DB.prepare('INSERT INTO analytics_events (id, event, generation_id, generated_page_id, project_name, environment, properties_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id, parsed.data.event, properties.generation_id ?? null, properties.generated_page_id ?? null, properties.project_name ?? null, String(properties.environment), JSON.stringify(properties), ts).run();
  return c.json({ id, event: parsed.data.event, properties, created_at: ts }, 201);
});

export default app;
