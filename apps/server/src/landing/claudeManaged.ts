import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const MANAGED_BETA = 'managed-agents-2026-04-01';

export type ManagedAgentRole = 'planner' | 'writer' | 'editor';

const rolePrompts: Record<ManagedAgentRole, string> = {
  planner: `You are the Planner Agent for a landing-page generator. Expand a short prompt into a conservative structured brief. Do not invent testimonials, logos, stats, customer counts, or unsupported claims. Return only valid JSON matching: {"product_category":"","target_audience":"","pain_point":"","value_proposition":"","cta_goal":"email_capture","sections":["Hero","Benefits","How it works","CTA","Footer"],"tone":"","visual_direction":"","prompt_summary":""}.`,
  writer: `You are the Writer Agent for a landing-page generator. Write clear conversion-oriented copy from a structured brief. Do not fabricate trust signals, testimonials, stats, logos, or business facts. Return only valid JSON matching: {"hero_headline":"","hero_subheadline":"","benefits":[{"title":"","body":""}],"how_it_works":[{"title":"","body":""}],"cta_heading":"","cta_body":"","email_label":"Email","email_placeholder":"you@example.com","submit_label":"Join the list","footer":""}.`,
  editor: `You are the Editor Agent for a landing-page generator. You receive existing React + JSX code and a change request. Return ONLY the complete updated source code for the files that need changing. Do not wrap the code in markdown fences or add explanations outside the code. Preserve all existing functionality (analytics tracking, form submission, etc.) unless the user explicitly asks to change it.`,
};

const roleNames: Record<ManagedAgentRole, string> = {
  planner: 'Kiloforge Planner Agent',
  writer: 'Kiloforge Writer Agent',
  editor: 'Kiloforge Editor Agent',
};

function stripJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error(`Claude did not return JSON: ${text.slice(0, 500)}`);
  return candidate.slice(start, end + 1);
}

export async function runManagedAgent(role: ManagedAgentRole, task: string): Promise<string> {
  if (!config.anthropicApiKey || !config.managedAgentsEnvironmentId) {
    throw new Error('ANTHROPIC_API_KEY and MANAGED_AGENTS_ENVIRONMENT_ID are required for Claude Managed Agents');
  }

  const client = new Anthropic({ apiKey: config.anthropicApiKey });
  const agent = await client.beta.agents.create({
    name: roleNames[role],
    model: config.managedAgentsModel,
    system: rolePrompts[role],
    tools: [],
  }, { headers: { 'anthropic-beta': MANAGED_BETA } });

  const session = await client.beta.sessions.create({
    agent: agent.id,
    environment_id: config.managedAgentsEnvironmentId,
    title: `${roleNames[role]} run`,
  }, { headers: { 'anthropic-beta': MANAGED_BETA } });

  const stream = await client.beta.sessions.events.stream(session.id);
  await client.beta.sessions.events.send(session.id, {
    events: [{ type: 'user.message', content: [{ type: 'text', text: task }] }],
  }, { headers: { 'anthropic-beta': MANAGED_BETA } });

  let text = '';
  for await (const event of stream) {
    if (event.type === 'agent.message') {
      for (const block of event.content) {
        if (block.type === 'text') text += block.text;
      }
    }
    if (event.type === 'session.status_idle') break;
    if (event.type === 'session.error') throw new Error(event.error?.message ?? 'Managed agent session failed');
  }

  return text;
}

export async function runManagedJsonAgent<T>(role: ManagedAgentRole, task: string): Promise<T> {
  const text = await runManagedAgent(role, task);
  return JSON.parse(stripJson(text)) as T;
}
