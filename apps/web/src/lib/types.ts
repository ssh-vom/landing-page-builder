export type StageId =
  | 'planning'
  | 'writing'
  | 'copying'
  | 'building'
  | 'deploying';

export type StageStatus = 'pending' | 'in_progress' | 'complete' | 'failed';

export interface Stage {
  id: StageId;
  label: string;
  description: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface Generation {
  id: string;
  prompt: string;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  currentStage: StageId;
  stages: Stage[];
  generatedPageId?: string;
  cloudflareProjectName?: string;
  deploymentUrl?: string;
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageSection {
  id: string;
  label: string;
  type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'footer';
}

export const DEFAULT_STAGES: Stage[] = [
  { id: 'planning', label: 'Planning', description: 'Expanding the brief from your prompt', status: 'pending' },
  { id: 'writing', label: 'Writing', description: 'Drafting hero, sections, and CTA copy', status: 'pending' },
  { id: 'copying', label: 'Composing', description: 'Mapping copy into the page scaffold', status: 'pending' },
  { id: 'building', label: 'Building', description: 'Compiling the React + Vite bundle', status: 'pending' },
  { id: 'deploying', label: 'Deploying', description: 'Shipping to Cloudflare Pages', status: 'pending' },
];
