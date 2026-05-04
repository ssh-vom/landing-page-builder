import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { config } from '../config.js';
import type { BuildResult, DeployResult } from './types.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractDeploymentUrl(output: string, projectName: string) {
  const canonicalUrl = `https://${projectName}.pages.dev`;
  if (output.includes(canonicalUrl)) return canonicalUrl;
  const urls = output.match(/https:\/\/[^\s)]+/g) ?? [];
  return urls.find((url) => url === canonicalUrl)
    ?? urls.find((url) => url.includes(`${projectName}.pages.dev`) && !/^https:\/\/[a-f0-9]+\./.test(url))
    ?? canonicalUrl;
}

function cloudflareEnv() {
  return {
    ...process.env,
    CLOUDFLARE_API_TOKEN: config.cloudflareApiToken,
    CLOUDFLARE_ACCOUNT_ID: config.cloudflareAccountId,
  };
}

async function ensurePagesProject(build: BuildResult) {
  try {
    await execa('pnpm', [
      'exec',
      'wrangler',
      'pages',
      'project',
      'create',
      build.project_name,
      '--production-branch',
      config.cloudflarePagesBranch,
    ], {
      cwd: serverRoot,
      env: cloudflareEnv(),
      all: true,
      timeout: 60_000,
    });
  } catch (error) {
    const output = error && typeof error === 'object' && 'all' in error ? String(error.all) : error instanceof Error ? error.message : String(error);
    if (!/already exists|project.*exists|8000007/i.test(output)) throw error;
  }
}

async function wranglerPagesDeploy(build: BuildResult) {
  await ensurePagesProject(build);
  return execa('pnpm', [
    'exec',
    'wrangler',
    'pages',
    'deploy',
    build.dist_dir,
    '--project-name',
    build.project_name,
    '--branch',
    config.cloudflarePagesBranch,
    '--commit-dirty=true',
  ], {
    cwd: serverRoot,
    env: cloudflareEnv(),
    all: true,
    timeout: 180_000,
  });
}

export async function deployLandingApp(build: BuildResult): Promise<DeployResult> {
  if (config.deploymentMode === 'local') {
    return {
      cloudflare_project_name: build.project_name,
      deployment_url: `file://${path.join(build.dist_dir, 'index.html')}`,
    };
  }

  if (!config.cloudflareApiToken || !config.cloudflareAccountId) {
    throw new Error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required for Cloudflare Pages deployment. Set DEPLOYMENT_MODE=local for local-only smoke tests.');
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await wranglerPagesDeploy(build);
      const output = result.all ?? `${result.stdout}\n${result.stderr}`;
      const deploymentUrl = extractDeploymentUrl(output, build.project_name);
      if (!deploymentUrl) throw new Error(`Cloudflare deploy succeeded but no Pages URL was found in wrangler output: ${output.slice(-1200)}`);
      return {
        cloudflare_project_name: build.project_name,
        deployment_url: deploymentUrl,
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(1_500 * attempt);
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Cloudflare Pages deployment failed after 3 attempts: ${message}`);
}
