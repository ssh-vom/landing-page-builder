# MVP Plan

## Goal
Build an application that takes a short prompt and autonomously generates, deploys, and returns a live landing page URL.

## Core MVP Requirements
- Input is a short user prompt
- Generated site is a single-page landing page
- Generated site uses React + Vite
- Deployment goes to Cloudflare Pages via direct API/CLI/SDK deploy flow
- Do not use Vercel for deployment, preview hosting, or token management in MVP
- Each generated landing page should most likely get its own Cloudflare Pages project
- Analytics use one shared PostHog project
- PostHog events must be segmentable by generated page ID / generation ID
- Primary CTA is an email capture form
- Generated pages must have a working backend form submit endpoint
- Captured emails are stored in the app database
- Content generation should be conservative and should not fabricate business facts, testimonials, stats, or logos
- Branding defaults should be minimal and neutral
- Users should be able to revisit past generations in the app
- Deployment failures should retry automatically
- Frontend should show generation progress stages

## User-Facing Workflow
1. User enters a short prompt
2. System creates a generation record
3. UI shows progress across stages:
   - planning
   - writing
   - copying
   - building
   - deploying
4. System deploys the generated landing page
5. User receives a live deployed URL
6. User can revisit previous generations later

## Recommended System Workflow

### 1. Prompt Intake
User submits a short prompt such as:
> Create a landing page for an AI assistant for recruiters

Create a generation record containing:
- generation ID
- prompt
- status
- current stage
- timestamps
- generated page ID
- Cloudflare project name
- deployment URL
- error state if any

### 2. Planning Stage
Agent: Planner

Expand the short prompt into a structured brief:
- product or offering category
- target audience
- pain point
- value proposition
- CTA goal
- page sections
- tone
- simple visual direction

Rules:
- Fill gaps conservatively
- Do not invent testimonials, logos, customer counts, claims, or metrics

### 3. Writing Stage
Agent: Writer

Generate page copy from the brief:
- hero headline
- hero subheadline
- section copy
- CTA copy
- email form labels
- footer copy

Rules:
- No fabricated trust signals
- No fake business details
- Keep copy clear and conversion-oriented

### 4. Copying Stage
This stage should represent assembling generated copy/content into the application scaffold.

Agent responsibility:
- map the structured copy into the page structure
- prepare content artifacts for the builder step

Note: this can later be renamed if desired, but for MVP it can remain a distinct visible step in the UI.

### 5. Building Stage
Agent: Builder

Responsibilities:
- scaffold a React + Vite landing page
- keep it single-page
- use a deterministic, reliable layout structure
- wire generated copy into components
- use minimal, neutral styling
- create email capture form UI
- add page metadata
- integrate PostHog analytics
- ensure the app builds successfully

Recommended page structure:
- Hero
- Benefits or Features
- How it works / supporting section
- CTA email capture form
- Footer

### 6. Backend Form Submission
Each generated landing page should submit to a working backend endpoint.

Responsibilities:
- accept email capture submissions
- associate submission with generated page ID / generation ID
- validate input
- store email and metadata in the app database
- optionally track submission result analytics

### 7. Analytics Instrumentation
PostHog should be integrated during the build step.

Use one shared PostHog project with page-level segmentation.

Suggested events:
- landing_page_viewed
- cta_email_submit_clicked
- email_capture_submitted
- email_capture_failed

Common event properties:
- generated_page_id
- generation_id
- project_name
- environment
- prompt summary or prompt hash

### 8. Deploying Stage
Agent: Deployer

Responsibilities:
- create a new Cloudflare Pages project for the generated landing page
- deploy the built output
- return and store the deployed URL
- use Cloudflare-only deployment infrastructure; no Vercel integration should exist in the MVP path

Failure handling:
- automatically retry deployment failures
- if retries fail, mark generation as failed and preserve logs/error details

### 9. Final Result
Return to the user:
- deployed landing page URL
- generation status
- stored generation record for later revisit

## Agent Structure (Claude Managed Agents SDK)
Use a simplified 4-agent setup for MVP:

### 1. Planner Agent
Input:
- raw user prompt

Output:
- structured brief

### 2. Writer Agent
Input:
- structured brief

Output:
- complete landing page copy

### 3. Builder Agent
Input:
- brief + copy

Output:
- React + Vite app
- PostHog instrumentation
- form wiring
- build artifact

### 4. Deploy Agent
Input:
- built app

Output:
- Cloudflare Pages deployment URL

## Frontend App Requirements
The app that users interact with should include:
- prompt submission screen
- progress screen with stage-by-stage status
- result screen with deployed URL
- history/list view for past generations

Each stage should support statuses like:
- pending
- in_progress
- complete
- failed

## Recommended Data Model

### Generation record
Fields:
- id
- prompt
- stage
- status
- brief_json
- copy_json
- generated_page_id
- cloudflare_project_name
- deployment_url
- retry_count
- error_message
- created_at
- updated_at

### Lead / email capture record
Fields:
- id
- generation_id
- generated_page_id
- email
- submission_metadata
- created_at

## MVP Constraints and Principles
- Keep generated pages single-page only
- Prefer reliability over open-ended generation
- Use a constrained page scaffold even if copy/content is generated from scratch
- Keep styling neutral and minimal
- Avoid advanced customization in v1
- Avoid auth and custom domains in v1
- Keep hosting/deployment vendor scope limited to Cloudflare only
- Support iteration / reprompting later in v2
- Support richer responsiveness/QA improvements later in v2

## Retry and Failure Strategy
- Retry Cloudflare deployment automatically
- Preserve build/deploy logs where possible
- Surface failure state in generation history and progress UI

## Likely V2 Additions
- reprompt/edit workflow
- stronger visual customization
- richer branding controls
- reusable templates/components
- improved responsiveness and QA checks
- custom domains
- auth and multi-user ownership
- more advanced analytics and dashboarding
