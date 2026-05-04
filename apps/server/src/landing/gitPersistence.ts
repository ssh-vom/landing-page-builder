import fs from 'node:fs/promises';
import path from 'node:path';
import { execa } from 'execa';
import { config } from '../config.js';

export type GitMetadata = {
  git_repo_url: string;
  git_branch: string;
  git_commit_sha: string;
};

function ensureGitConfigured() {
  if (!config.generatedSitesGitUrl) {
    if (config.deploymentMode === 'cloudflare') {
      throw new Error('GENERATED_SITES_GIT_URL is required for Cloudflare deployment/regeneration source persistence.');
    }
    return false;
  }
  return true;
}

function sanitizeBranchPart(value: string) {
  const safe = value
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^-+|-+$/g, '')
    .replace(/\.lock$/i, '')
    .slice(0, 120);
  return safe || 'site';
}

export function gitBranchForGeneratedPage(generatedPageId: string) {
  return `page_${sanitizeBranchPart(generatedPageId)}`;
}

function authenticatedGitUrl() {
  const raw = config.generatedSitesGitUrl;
  if (!config.generatedSitesGitToken || !raw.startsWith('https://')) return raw;
  const url = new URL(raw);
  url.username = 'x-access-token';
  url.password = config.generatedSitesGitToken;
  return url.toString();
}

async function git(cwd: string, args: string[]) {
  return execa('git', args, { cwd, timeout: 120_000 });
}

async function configureIdentity(cwd: string) {
  await git(cwd, ['config', 'user.name', config.generatedSitesGitUserName]);
  await git(cwd, ['config', 'user.email', config.generatedSitesGitUserEmail]);
}

async function ensureGitignore(projectDir: string) {
  await fs.writeFile(path.join(projectDir, '.gitignore'), ['node_modules/', 'dist/', '.env', '.DS_Store', ''].join('\n'));
}

async function hasCommit(cwd: string) {
  const result = await execa('git', ['rev-parse', '--verify', 'HEAD'], { cwd, reject: false });
  return result.exitCode === 0;
}

async function commitIfNeeded(cwd: string, message: string) {
  await git(cwd, ['add', 'package.json', 'index.html', 'src', '.gitignore']);
  const status = await git(cwd, ['status', '--porcelain']);
  if (status.stdout.trim()) {
    await git(cwd, ['commit', '-m', message]);
  } else if (!(await hasCommit(cwd))) {
    await git(cwd, ['commit', '--allow-empty', '-m', message]);
  }
  const sha = await git(cwd, ['rev-parse', 'HEAD']);
  return sha.stdout.trim();
}

export async function persistGeneratedSiteToGit(input: {
  projectDir: string;
  generatedPageId: string;
  message?: string;
}): Promise<GitMetadata | null> {
  if (!ensureGitConfigured()) return null;
  const branch = gitBranchForGeneratedPage(input.generatedPageId);
  await ensureGitignore(input.projectDir);
  await git(input.projectDir, ['init']);
  await configureIdentity(input.projectDir);
  await git(input.projectDir, ['checkout', '-B', branch]);
  await execa('git', ['remote', 'remove', 'origin'], { cwd: input.projectDir, reject: false });
  await git(input.projectDir, ['remote', 'add', 'origin', authenticatedGitUrl()]);
  const sha = await commitIfNeeded(input.projectDir, input.message ?? `Generate ${input.generatedPageId}`);
  await git(input.projectDir, ['push', '-u', 'origin', branch]);
  return { git_repo_url: config.generatedSitesGitUrl, git_branch: branch, git_commit_sha: sha };
}

export async function cloneGeneratedSiteFromGit(input: {
  gitRepoUrl: string;
  gitBranch: string;
  generatedPageId: string;
}) {
  if (!ensureGitConfigured()) throw new Error('Git persistence is not configured.');
  const root = path.resolve(config.generatedSitesDir, `checkout-${sanitizeBranchPart(input.generatedPageId)}-${Date.now()}`);
  await fs.rm(root, { recursive: true, force: true });
  await fs.mkdir(path.dirname(root), { recursive: true });
  await execa('git', ['clone', '--single-branch', '--branch', input.gitBranch, authenticatedGitUrl(), root], { all: true, timeout: 120_000 });
  await configureIdentity(root);
  return { projectDir: root };
}

export async function commitGeneratedSiteChanges(input: {
  projectDir: string;
  message: string;
}): Promise<Pick<GitMetadata, 'git_commit_sha'>> {
  if (!ensureGitConfigured()) throw new Error('Git persistence is not configured.');
  await ensureGitignore(input.projectDir);
  const sha = await commitIfNeeded(input.projectDir, input.message);
  await git(input.projectDir, ['push', 'origin', 'HEAD']);
  return { git_commit_sha: sha };
}
