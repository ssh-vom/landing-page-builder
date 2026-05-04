import { Sparkles, Calendar, Clock, Zap, Users, Briefcase, Shield } from 'lucide-react';

export function GeneratedSitePreview() {
  return (
    <div className="bg-white text-ink rounded-[var(--radius-md)] overflow-hidden border border-gray-100">
      {/* Mock site header */}
      <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="size-4 rounded-[2px] bg-ink text-white flex items-center justify-center">
            <Sparkles className="size-2" fill="currentColor" />
          </div>
          <span className="text-[11px] font-semibold text-ink">Meetday</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-ink-muted">
          <span>Features</span>
          <span>Pricing</span>
          <span>How it works</span>
          <span className="h-5 px-1.5 rounded-sm bg-ink text-white text-[9px] font-medium flex items-center">Get started</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 py-6 text-center">
        <div className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider mb-2">AI Scheduling Assistant</div>
        <h1 className="text-[15px] font-bold text-ink leading-tight max-w-[280px] mx-auto mb-2">
          Find the perfect time, automatically
        </h1>
        <p className="text-[11px] text-ink-muted max-w-[260px] mx-auto mb-3 leading-relaxed">
          Meetday scans everyone's calendar and suggests the best meeting times — so you can focus on what matters.
        </p>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="h-6 px-2.5 rounded-sm bg-ink text-white text-[10px] font-medium flex items-center">Get started free</span>
          <span className="h-6 px-2.5 rounded-sm border border-gray-200 text-[10px] font-medium flex items-center text-ink-soft">See how it works</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1 text-[9px] text-ink-muted">
            <Zap className="size-2.5" /> Smart suggestions
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-ink-muted">
            <Calendar className="size-2.5" /> Calendar sync
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-ink-muted">
            <Clock className="size-2.5" /> Time savings
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-5 border-t border-gray-100">
        <div className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider text-center mb-1">Features</div>
        <h2 className="text-[13px] font-bold text-center mb-4 max-w-[240px] mx-auto leading-tight">
          Everything you need to run meetings better
        </h2>
        <div className="grid grid-cols-3 gap-3 max-w-[360px] mx-auto">
          {[
            { icon: <Calendar className="size-3" />, iconBg: 'bg-violet-50', iconColor: 'text-violet-500', title: 'AI finds the best times', body: 'We analyze calendars, time zones, and preferences to suggest optimal meeting slots.' },
            { icon: <Briefcase className="size-3" />, iconBg: 'bg-green-50', iconColor: 'text-green-500', title: 'Syncs with your tools', body: 'Connect Google Calendar, Outlook, and more—everything stays in sync.' },
            { icon: <Users className="size-3" />, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', title: 'Built for teams', body: 'Coordinate across teams with shared availability and smart scheduling rules.' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className={`size-6 rounded-[var(--radius-xs)] ${f.iconBg} ${f.iconColor} flex items-center justify-center mx-auto mb-1.5`}>
                {f.icon}
              </div>
              <h3 className="text-[9.5px] font-semibold mb-0.5 leading-tight">{f.title}</h3>
              <p className="text-[8px] text-ink-muted leading-snug">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-5 border-t border-gray-100 bg-gray-50">
        <div className="max-w-[280px] mx-auto text-center">
          <h2 className="text-[12px] font-bold mb-1.5">Ready to streamline your meetings?</h2>
          <p className="text-[10px] text-ink-muted mb-3">
            Join thousands of teams saving hours every week.
          </p>
          <div className="flex gap-2 max-w-[220px] mx-auto">
            <div className="flex-1 h-7 px-2 rounded-sm border border-gray-200 bg-white text-[9px] text-ink-faint flex items-center">
              you@company.com
            </div>
            <div className="h-7 px-2.5 rounded-sm bg-ember text-white text-[9px] font-medium flex items-center">
              Get started
            </div>
          </div>
          <p className="text-[8px] text-ink-faint mt-2 inline-flex items-center gap-1">
            <Shield className="size-2" /> Your email stays private
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-ink-faint">
        <span>© Meetday 2026</span>
        <span className="flex items-center gap-1">
          <Sparkles className="size-2" /> Built with Launchpad AI
        </span>
      </footer>
    </div>
  );
}
