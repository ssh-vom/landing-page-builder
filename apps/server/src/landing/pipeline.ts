import Database from 'better-sqlite3';
import { config } from '../config.js';
import * as dataApi from '../dataApi.js';
import type { ApiGeneration } from '../dataApi.js';
import { buildLandingApp } from './builder.js';
import { runManagedJsonAgent } from './claudeManaged.js';
import { editLandingApp } from './editor.js';
import { deployLandingApp } from './deployer.js';
import type { LandingBrief, LandingCopy, GenerationStage, GenerationStatus } from './types.js';

function now() { return new Date().toISOString(); }

type PipelineGeneration = { id: string; prompt: string; generated_page_id: string };

type PatchInput = Partial<{
  stage: GenerationStage;
  status: GenerationStatus;
  brief: LandingBrief;
  copy: LandingCopy;
  cloudflare_project_name: string | null;
  deployment_url: string | null;
  project_dir: string | null;
  retry_count: number;
  error_message: string | null;
}>;

async function persistPatchGeneration(db: Database.Database, id: string, input: PatchInput) {
  if (dataApi.hasPersistenceApi()) {
    await dataApi.patchGeneration(id, input);
    return;
  }
  patchLocalGeneration(db, id, input);
}

function patchLocalGeneration(db: Database.Database, id: string, input: PatchInput) {
  const row = db.prepare('SELECT cloudflare_project_name, deployment_url, project_dir, error_message FROM generations WHERE id = ?').get(id) as any;
  db.prepare(`UPDATE generations SET
    stage = COALESCE(?, stage), status = COALESCE(?, status),
    brief_json = COALESCE(?, brief_json), copy_json = COALESCE(?, copy_json),
    cloudflare_project_name = ?, deployment_url = ?, project_dir = ?,
    retry_count = COALESCE(?, retry_count),
    error_message = ?, updated_at = ? WHERE id = ?`).run(
      input.stage ?? null,
      input.status ?? null,
      input.brief ? JSON.stringify(input.brief) : null,
      input.copy ? JSON.stringify(input.copy) : null,
      'cloudflare_project_name' in input ? input.cloudflare_project_name : row.cloudflare_project_name,
      'deployment_url' in input ? input.deployment_url : row.deployment_url,
      'project_dir' in input ? input.project_dir : row.project_dir,
      input.retry_count ?? null,
      'error_message' in input ? input.error_message : row.error_message,
      now(), id,
    );
}

async function persistGetGeneration(db: Database.Database, id: string): Promise<PipelineGeneration | undefined> {
  if (dataApi.hasPersistenceApi()) {
    const row = await dataApi.getGeneration(id);
    return { id: row.id, prompt: row.prompt, generated_page_id: row.generated_page_id };
  }
  return db.prepare('SELECT id, prompt, generated_page_id FROM generations WHERE id = ?').get(id) as PipelineGeneration | undefined;
}

async function plan(prompt: string) {
  return runManagedJsonAgent<LandingBrief>('planner', `Prompt: ${prompt}`);
}

async function writeCopy(brief: LandingBrief) {
  return runManagedJsonAgent<LandingCopy>('writer', `Brief JSON:\n${JSON.stringify(brief, null, 2)}`);
}

export async function runGenerationPipeline(db: Database.Database, generationId: string) {
  const generation = await persistGetGeneration(db, generationId);
  if (!generation) throw new Error(`Generation not found: ${generationId}`);

  try {
    await persistPatchGeneration(db, generationId, { stage: 'planning', status: 'in_progress', error_message: null });
    const brief = await plan(generation.prompt);
    await persistPatchGeneration(db, generationId, { stage: 'writing', brief });

    const copy = await writeCopy(brief);
    await persistPatchGeneration(db, generationId, { stage: 'copying', copy });

    await persistPatchGeneration(db, generationId, { stage: 'building' });
    const build = await buildLandingApp({ generationId, generatedPageId: generation.generated_page_id, brief, copy });

    await persistPatchGeneration(db, generationId, { stage: 'deploying', cloudflare_project_name: build.project_name, project_dir: build.project_dir });
    const deployed = await deployLandingApp(build);
    if (deployed.deployment_url.includes('.pages.dev')) {
      config.publicCorsOrigins.push(new URL(deployed.deployment_url).origin);
    }

    await persistPatchGeneration(db, generationId, {
      stage: 'complete', status: 'complete',
      cloudflare_project_name: deployed.cloudflare_project_name,
      deployment_url: deployed.deployment_url,
      error_message: null,
    });
  } catch (error) {
    await persistPatchGeneration(db, generationId, { status: 'failed', error_message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

type RegenGen = { id: string; prompt: string; generated_page_id: string; project_dir: string | null; status: string };

export async function runRegeneratePipeline(db: Database.Database, generationId: string, changePrompt: string) {
  let generation: RegenGen | undefined;
  if (dataApi.hasPersistenceApi()) {
    const row = await dataApi.getGeneration(generationId).catch(() => undefined);
    if (row) generation = row as RegenGen;
  } else {
    generation = db.prepare('SELECT id, prompt, generated_page_id, project_dir, status FROM generations WHERE id = ?').get(generationId) as RegenGen | undefined;
  }

  if (!generation) throw new Error(`Generation not found: ${generationId}`);
  if (!generation.project_dir) throw new Error('No project_dir found for this generation. It may not have completed initial build yet.');

  try {
    await persistPatchGeneration(db, generationId, { stage: 'planning', status: 'in_progress', error_message: null });

    // Edit existing code
    await editLandingApp({ projectDir: generation.project_dir, changePrompt });

    await persistPatchGeneration(db, generationId, { stage: 'deploying' });
    const deployed = await deployLandingApp({
      project_dir: generation.project_dir,
      dist_dir: `${generation.project_dir}/dist`,
      project_name: generation.generated_page_id,
    });
    if (deployed.deployment_url.includes('.pages.dev')) {
      config.publicCorsOrigins.push(new URL(deployed.deployment_url).origin);
    }

    await persistPatchGeneration(db, generationId, {
      stage: 'complete', status: 'complete',
      cloudflare_project_name: deployed.cloudflare_project_name,
      deployment_url: deployed.deployment_url,
      error_message: null,
    });
  } catch (error) {
    await persistPatchGeneration(db, generationId, { status: 'failed', error_message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export function startGenerationPipeline(db: Database.Database, generationId: string) {
  void runGenerationPipeline(db, generationId).catch((error) => {
    console.error(`generation pipeline failed for ${generationId}`, error);
  });
}

export function startRegeneratePipeline(db: Database.Database, generationId: string, changePrompt: string) {
  void runRegeneratePipeline(db, generationId, changePrompt).catch((error) => {
    console.error(`regeneration pipeline failed for ${generationId}`, error);
  });
}
