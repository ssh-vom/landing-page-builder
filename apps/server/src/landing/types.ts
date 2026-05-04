export type GenerationStage = 'planning' | 'writing' | 'copying' | 'building' | 'deploying' | 'complete';
export type GenerationStatus = 'pending' | 'in_progress' | 'complete' | 'failed';

export type LandingBrief = {
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

export type LandingCopy = {
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

export type BuildResult = {
  project_dir: string;
  dist_dir: string;
  project_name: string;
};

export type DeployResult = {
  deployment_url: string;
  cloudflare_project_name: string;
};
