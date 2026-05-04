CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'planning',
  status TEXT NOT NULL DEFAULT 'pending',
  brief_json TEXT,
  copy_json TEXT,
  generated_page_id TEXT NOT NULL,
  cloudflare_project_name TEXT,
  deployment_url TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_generated_page_id ON generations(generated_page_id);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,
  generated_page_id TEXT NOT NULL,
  email TEXT NOT NULL,
  submission_metadata TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leads_generation_id ON leads(generation_id);
CREATE INDEX IF NOT EXISTS idx_leads_generated_page_id ON leads(generated_page_id);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  generation_id TEXT,
  generated_page_id TEXT,
  project_name TEXT,
  environment TEXT NOT NULL,
  properties_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_generation_id ON analytics_events(generation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_generated_page_id ON analytics_events(generated_page_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
