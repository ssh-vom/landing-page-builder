import { DEFAULT_STAGES, type Stage, type StageId, type StageStatus } from './types';

export interface ApiGeneration {
  id: string;
  prompt: string;
  stage: StageId | 'complete';
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  brief: unknown | null;
  copy: any | null;
  generated_page_id: string;
  cloudflare_project_name: string | null;
  deployment_url: string | null;
  retry_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE = (import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export function createGeneration(prompt: string) {
  return request<ApiGeneration>('/generations', { method: 'POST', body: JSON.stringify({ prompt, run: true }) });
}

export function getGeneration(id: string) {
  return request<ApiGeneration>(`/generations/${encodeURIComponent(id)}`);
}

export function listGenerations() {
  return request<{ generations: ApiGeneration[] }>('/generations');
}

export function runGeneration(id: string) {
  return request<{ accepted: boolean; generation_id: string }>(`/generations/${encodeURIComponent(id)}/run`, { method: 'POST' });
}

export function regenerateGeneration(id: string, prompt: string) {
  return request<{ accepted: boolean; generation_id: string }>(`/generations/${encodeURIComponent(id)}/regenerate`, { method: 'POST', body: JSON.stringify({ prompt }) });
}

export function generationUrl(generation?: Pick<ApiGeneration, 'deployment_url'> | null) {
  return generation?.deployment_url ?? '';
}

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function stagesFromGeneration(generation?: ApiGeneration | null): Stage[] {
  if (!generation) return DEFAULT_STAGES;
  const currentIndex = generation.stage === 'complete'
    ? DEFAULT_STAGES.length
    : DEFAULT_STAGES.findIndex((stage) => stage.id === generation.stage);

  return DEFAULT_STAGES.map((stage, index) => {
    let status: StageStatus = 'pending';
    if (generation.status === 'failed' && index === currentIndex) status = 'failed';
    else if (generation.status === 'complete' || currentIndex === DEFAULT_STAGES.length || index < currentIndex) status = 'complete';
    else if (index === currentIndex && generation.status === 'in_progress') status = 'in_progress';
    else if (index === currentIndex && generation.status === 'pending') status = 'pending';
    return { ...stage, status };
  });
}
