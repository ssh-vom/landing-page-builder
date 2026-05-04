import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { config } from '../config.js';
import type { BuildResult, LandingBrief, LandingCopy } from './types.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function safeProjectName(id: string) {
  return `kiloforge-${id.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 32)}`.toLowerCase();
}

function js(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export async function buildLandingApp(input: {
  generationId: string;
  generatedPageId: string;
  brief: LandingBrief;
  copy: LandingCopy;
}): Promise<BuildResult> {
  const projectName = safeProjectName(input.generatedPageId);
  const root = path.resolve(config.generatedSitesDir, projectName);
  await fs.rm(root, { recursive: true, force: true });
  await fs.mkdir(path.join(root, 'src'), { recursive: true });

  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    scripts: { build: 'vite build' },
    dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1', 'posthog-js': '^1.203.2' },
    devDependencies: { '@vitejs/plugin-react': '^4.3.4', vite: '^6.0.1', typescript: '^5.6.3' },
  }, null, 2));

  await fs.writeFile(path.join(root, 'index.html'), `<!doctype html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${input.brief.prompt_summary}</title><meta name="description" content="${input.copy.hero_subheadline.replace(/"/g, '&quot;')}"/></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`);

  await fs.writeFile(path.join(root, 'src/main.jsx'), `import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import posthog from 'posthog-js';
import './styles.css';

const copy = ${js(input.copy)};
const meta = ${js({ generation_id: input.generationId, generated_page_id: input.generatedPageId, project_name: projectName, environment: config.nodeEnv })};
const apiUrl = import.meta.env.VITE_API_URL || ${js(config.apiUrl)};
const posthogKey = import.meta.env.VITE_POSTHOG_KEY || ${js(config.posthogKey)};
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || ${js(config.posthogHost)};

function track(event, properties = {}) {
  const payload = { ...meta, ...properties };
  if (posthogKey) posthog.capture(event, payload);
  fetch(apiUrl + '/analytics/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event, ...payload }) }).catch(() => {});
}

function App() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  useEffect(() => {
    if (posthogKey) posthog.init(posthogKey, { api_host: posthogHost, capture_pageview: false });
    track('landing_page_viewed');
  }, []);

  async function submit(e) {
    e.preventDefault();
    setState('submitting');
    track('cta_email_submit_clicked');
    const response = await fetch(apiUrl + '/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...meta, email, metadata: { source: 'generated_landing_page' } }) }).catch(() => null);
    if (response?.ok) { setState('success'); track('email_capture_submitted'); }
    else { setState('error'); track('email_capture_failed'); }
  }

  return <main>
    <section className="hero"><p className="eyebrow">Early access</p><h1>{copy.hero_headline}</h1><p>{copy.hero_subheadline}</p><a href="#join" className="button">{copy.submit_label}</a></section>
    <section className="grid">{copy.benefits.map((item) => <article className="card" key={item.title}><h2>{item.title}</h2><p>{item.body}</p></article>)}</section>
    <section className="steps"><h2>How it works</h2>{copy.how_it_works.map((item, i) => <div className="step" key={item.title}><span>{i + 1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></div>)}</section>
    <section id="join" className="cta"><h2>{copy.cta_heading}</h2><p>{copy.cta_body}</p><form onSubmit={submit}><label>{copy.email_label}<input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder={copy.email_placeholder}/></label><button>{state === 'submitting' ? 'Submitting…' : copy.submit_label}</button></form>{state === 'success' && <p className="success">Thanks — you are on the list.</p>}{state === 'error' && <p className="error">Something went wrong. Please try again.</p>}</section>
    <footer>{copy.footer}</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);`);

  await fs.writeFile(path.join(root, 'src/styles.css'), `:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#111827;background:#f8fafc}body{margin:0}main{max-width:1120px;margin:0 auto;padding:32px 20px 56px}.hero{padding:88px 0;text-align:center}.eyebrow{color:#4f46e5;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:700}h1{font-size:clamp(42px,8vw,82px);line-height:.95;margin:16px 0}p{color:#4b5563;font-size:18px;line-height:1.7}.button,button{background:#111827;color:white;border:0;border-radius:999px;padding:14px 22px;font-weight:700;text-decoration:none;cursor:pointer}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}.card,.cta,.steps{background:white;border:1px solid #e5e7eb;border-radius:28px;padding:28px;box-shadow:0 20px 60px #0f172a0d}.steps,.cta{margin-top:20px}.step{display:flex;gap:16px;border-top:1px solid #e5e7eb;padding:18px 0}.step span{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#eef2ff;color:#4f46e5;font-weight:800;flex:0 0 auto}form{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px}label{text-align:left;color:#374151;font-weight:700}input{display:block;margin-top:8px;min-width:280px;border:1px solid #d1d5db;border-radius:999px;padding:14px 16px;font:inherit}.success{color:#047857}.error{color:#b91c1c}footer{text-align:center;margin-top:40px;color:#6b7280}`);

  await execa('pnpm', ['exec', 'vite', 'build', root, '--outDir', path.join(root, 'dist')], { cwd: serverRoot, stdio: 'pipe', timeout: 120_000 });

  return { project_dir: root, dist_dir: path.join(root, 'dist'), project_name: projectName };
}
