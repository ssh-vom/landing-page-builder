import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3001'),
  SQLITE_PATH: z.string().min(1).default('./data/kiloforge.sqlite'),
  PUBLIC_CORS_ORIGINS: z.string().default(''),
  POSTHOG_KEY: z.string().default(''),
  POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),
  ANTHROPIC_API_KEY: z.string().default(''),
  MANAGED_AGENTS_ENVIRONMENT_ID: z.string().default(process.env.ENV_ID ?? ''),
  MANAGED_AGENTS_MODEL: z.string().default('claude-sonnet-4-6'),
  GENERATED_SITES_DIR: z.string().min(1).default('./generated-sites'),
  CLOUDFLARE_API_TOKEN: z.string().default(''),
  CLOUDFLARE_ACCOUNT_ID: z.string().default(''),
  CLOUDFLARE_PAGES_BRANCH: z.string().min(1).default('main'),
  DEPLOYMENT_MODE: z.enum(['cloudflare', 'local']).default('cloudflare'),
  PERSISTENCE_API_URL: z.string().url().optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  appUrl: env.APP_URL,
  apiUrl: env.API_URL,
  sqlitePath: env.SQLITE_PATH,
  publicCorsOrigins: env.PUBLIC_CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  posthogKey: env.POSTHOG_KEY,
  posthogHost: env.POSTHOG_HOST,
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  managedAgentsEnvironmentId: env.MANAGED_AGENTS_ENVIRONMENT_ID,
  managedAgentsModel: env.MANAGED_AGENTS_MODEL,
  generatedSitesDir: env.GENERATED_SITES_DIR,
  cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
  cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
  cloudflarePagesBranch: env.CLOUDFLARE_PAGES_BRANCH,
  deploymentMode: env.DEPLOYMENT_MODE,
  persistenceApiUrl: env.PERSISTENCE_API_URL,
};
