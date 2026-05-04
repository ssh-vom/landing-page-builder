import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let db: Database.Database | undefined;

function resolveSqlitePath(sqlitePath: string) {
  return path.isAbsolute(sqlitePath) ? sqlitePath : path.resolve(serverRoot, sqlitePath);
}

export function getDb() {
  if (!db) {
    const dbPath = resolveSqlitePath(config.sqlitePath);
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function migrate() {
  const database = getDb();
  database.exec(`
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
      project_dir TEXT,
      git_repo_url TEXT,
      git_branch TEXT,
      git_commit_sha TEXT,
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
  `);

  for (const column of ['project_dir', 'git_repo_url', 'git_branch', 'git_commit_sha']) {
    const exists = database
      .prepare("SELECT 1 FROM pragma_table_info('generations') WHERE name = ?")
      .get(column);
    if (!exists) database.exec(`ALTER TABLE generations ADD COLUMN ${column} TEXT`);
  }
}
