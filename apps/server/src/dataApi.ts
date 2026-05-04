import { config } from './config.js';

export type ApiGeneration = {
  id: string;
  prompt: string;
  stage: string;
  status: string;
  brief?: unknown;
  copy?: unknown;
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

function baseUrl() {
  return config.persistenceApiUrl?.replace(/\/$/, '');
}

export function hasPersistenceApi() {
  return Boolean(baseUrl());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = baseUrl();
  if (!base) throw new Error('PERSISTENCE_API_URL is not configured');
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Persistence API ${init?.method ?? 'GET'} ${path} failed: ${response.status} ${text}`);
  }
  return response.json() as Promise<T>;
}

export function createGeneration(input: { prompt: string; generated_page_id?: string; cloudflare_project_name?: string }) {
  return request<ApiGeneration>('/generations', { method: 'POST', body: JSON.stringify(input) });
}

export function listGenerations() {
  return request<{ generations: ApiGeneration[] }>('/generations');
}

export function getGeneration(id: string) {
  return request<ApiGeneration>(`/generations/${encodeURIComponent(id)}`);
}

export function patchGeneration(id: string, input: Record<string, unknown>) {
  return request<ApiGeneration>(`/generations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function createLead(input: { generation_id: string; generated_page_id: string; email: string; metadata?: Record<string, unknown> }) {
  return request('/leads', { method: 'POST', body: JSON.stringify(input) });
}

export function trackAnalyticsEvent(input: Record<string, unknown>) {
  return request('/analytics/events', { method: 'POST', body: JSON.stringify(input) });
}
