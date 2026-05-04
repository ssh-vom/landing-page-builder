import { Eyebrow } from '@/components/ui/Eyebrow';

const stack = [
  { name: 'Claude', role: 'agent runtime' },
  { name: 'Cloudflare Pages', role: 'deployment' },
  { name: 'PostHog', role: 'analytics' },
  { name: 'React + Vite', role: 'page scaffold' },
  { name: 'Postgres', role: 'lead capture' },
];

export function BuiltWith() {
  return (
    <section id="stack" className="py-20 lg:py-24">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <Eyebrow>The stack we lean on</Eyebrow>
          <p className="text-[13px] text-ink-faint mono">no fabricated logos · just what's running</p>
        </div>

        <div className="border border-rule rounded-[var(--radius-md)] divide-y divide-rule overflow-hidden">
          {stack.map((item, i) => (
            <div
              key={item.name}
              className="flex items-baseline gap-6 px-6 lg:px-8 py-5 hover:bg-paper-deep/60 transition-colors"
            >
              <span className="mono-label text-ink-faint w-8">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="display text-[1.4rem] font-medium text-ink flex-1">
                {item.name}
              </span>
              <span className="text-[13.5px] text-ink-muted">{item.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
