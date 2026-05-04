import { Calendar, Sparkles, Clock, Users, Briefcase, Shield, Pencil } from 'lucide-react';

function SectionWrapper({ children, id, label }: { children: React.ReactNode; id: string; label: string }) {
  return (
    <div data-section={id} className="relative group">
      <button className="absolute top-3 right-3 size-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:text-ink hover:border-gray-300">
        <Pencil className="size-3" />
      </button>
      {children}
    </div>
  );
}

export function MockLandingPreview() {
  return (
    <div className="bg-white text-ink min-h-full">
      {/* Mock site header */}
      <div className="border-b border-gray-100 px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-[3px] bg-ink text-white flex items-center justify-center">
            <Sparkles className="size-3" fill="currentColor" />
          </div>
          <span className="text-[14px] font-semibold text-ink">Meetday</span>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-[12.5px] text-ink-muted">
          <span>Features</span>
          <span>How it works</span>
          <span>Pricing</span>
          <span>Resources</span>
          <span className="ml-1 h-7 px-3 rounded-[var(--radius-sm)] bg-ember text-white text-[12px] font-medium flex items-center">Get started</span>
        </nav>
      </div>

      {/* Hero */}
      <SectionWrapper id="hero" label="Hero">
        <section className="px-8 py-14 text-center">
          <div className="text-[11px] font-semibold text-ember uppercase tracking-wider mb-4">AI Scheduling Assistant</div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] max-w-[560px] mx-auto mb-4">
            Find the perfect time, automatically
          </h1>
          <p className="text-[14px] text-ink-muted max-w-[440px] mx-auto mb-6 leading-relaxed">
            Meetday scans everyone's calendar and suggests the best meeting times — so you can focus on what matters.
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <button className="h-9 px-4 rounded-[var(--radius-sm)] bg-ember text-white text-[13px] font-medium">
              Get started free
            </button>
            <button className="h-9 px-4 rounded-[var(--radius-sm)] border border-gray-200 text-[13px] font-medium text-ink-soft">
              See how it works
            </button>
          </div>
          <div className="flex items-center justify-center gap-5 text-[11.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3" /> Smart suggestions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3" /> Calendar sync
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" /> Time savings
            </span>
          </div>
        </section>
      </SectionWrapper>

      {/* Features */}
      <SectionWrapper id="features" label="Features">
        <section className="px-8 py-14 border-t border-gray-100">
          <div className="text-[11px] font-semibold text-azure uppercase tracking-wider text-center mb-3">Features</div>
          <h2 className="text-[1.5rem] font-bold text-center mb-10 max-w-[480px] mx-auto leading-tight">
            Everything you need to run meetings better
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-[720px] mx-auto">
            {[
              { icon: <Calendar className="size-4" />, iconBg: 'bg-violet-50', iconColor: 'text-violet-500', title: 'AI finds the best times', body: 'We analyze calendars, time zones, and preferences to suggest optimal meeting slots.' },
              { icon: <Briefcase className="size-4" />, iconBg: 'bg-green-50', iconColor: 'text-green-500', title: 'Syncs with your tools', body: 'Connect Google Calendar, Outlook, and more—everything stays in sync.' },
              { icon: <Users className="size-4" />, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', title: 'Built for teams', body: 'Coordinate across teams with shared availability and smart scheduling rules.' },
            ].map((f) => (
              <div key={f.title}>
                <div className={`size-9 rounded-[var(--radius-sm)] ${f.iconBg} ${f.iconColor} flex items-center justify-center mb-3`}>
                  {f.icon}
                </div>
                <h3 className="text-[13.5px] font-semibold mb-1">{f.title}</h3>
                <p className="text-[12.5px] text-ink-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionWrapper>

      {/* CTA / form */}
      <SectionWrapper id="cta" label="CTA">
        <section className="px-8 py-14 border-t border-gray-100 bg-gray-50">
          <div className="max-w-[400px] mx-auto text-center">
            <h2 className="text-[1.35rem] font-bold mb-2">Ready to streamline your meetings?</h2>
            <p className="text-[13px] text-ink-muted mb-5">
              Join thousands of teams saving hours every week.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 h-9 px-3 rounded-[var(--radius-sm)] border border-gray-200 bg-white text-[13px] focus:outline-none focus:border-ember"
              />
              <button type="button" className="h-9 px-4 rounded-[var(--radius-sm)] bg-ember text-white text-[13px] font-medium">
                Get started
              </button>
            </form>
            <p className="text-[11px] text-ink-faint mt-3 inline-flex items-center gap-1.5">
              <Shield className="size-3" /> Your email stays private
            </p>
          </div>
        </section>
      </SectionWrapper>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-gray-100 flex items-center justify-between text-[11.5px] text-ink-faint">
        <span>© Meetday 2026</span>
        <span className="flex items-center gap-1">
          <Sparkles className="size-3" /> Built with Launchpad AI
        </span>
      </footer>
    </div>
  );
}
