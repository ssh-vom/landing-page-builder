import { Sparkles, Check, Eye, Monitor, Calendar, Clock, Zap } from 'lucide-react';

export function PreviewMockup() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-[680px] mx-auto">
      <div className="absolute inset-0 rounded-[var(--radius-lg)] border border-gray-200 bg-white shadow-[var(--shadow-lift)] overflow-hidden">
        <div className="relative h-full flex">
          {/* Left — prompt panel */}
          <div className="w-[36%] border-r border-gray-100 p-3.5 flex flex-col bg-white shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="size-5 rounded-[var(--radius-xs)] bg-ember text-white flex items-center justify-center">
                <Sparkles className="size-2.5" />
              </div>
              <span className="text-[10px] font-semibold text-ink">1. Describe your product</span>
            </div>
            <p className="text-[9px] text-ink-muted mb-2 leading-relaxed">Be specific about your product, audience and value proposition.</p>

            <div className="flex-1 rounded-[var(--radius-sm)] border border-gray-200 bg-gray-50 p-2 mb-2.5">
              <p className="text-[9.5px] text-ink-soft leading-relaxed">
                An AI scheduling assistant for busy teams that automatically finds the best meeting times across calendars.
              </p>
              <div className="mt-1.5 text-right">
                <span className="text-[8px] text-ink-faint mono">93/500</span>
              </div>
            </div>

            <button className="w-full h-7 rounded-[var(--radius-sm)] bg-ember text-white text-[10px] font-semibold flex items-center justify-center gap-1 mb-3">
              <Sparkles className="size-2.5" />
              Generate site
            </button>

            <div className="space-y-1.5">
              {['Analyzing your product', 'Generating copy', 'Building layout', 'Selecting images', 'Finalizing sections'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check className="size-2.5 text-moss shrink-0" />
                  <span className="text-[9.5px] text-ink-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center — generated page preview */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {/* Mini browser chrome */}
            <div className="h-6 border-b border-gray-100 flex items-center px-2.5 gap-1.5 bg-white shrink-0">
              <div className="flex gap-1">
                <span className="size-1 rounded-full bg-gray-200" />
                <span className="size-1 rounded-full bg-gray-200" />
                <span className="size-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1 mx-1.5 h-4 rounded-sm bg-gray-50 border border-gray-100 flex items-center px-1.5">
                <span className="text-[7px] text-ink-faint mono truncate">meetday.launchpad.ai</span>
              </div>
              <Eye className="size-2.5 text-ink-faint shrink-0" />
              <Monitor className="size-2.5 text-ink-faint shrink-0" />
            </div>

            <div className="flex-1 overflow-hidden px-3 py-3">
              {/* Meetday header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 shrink-0">
                  <div className="size-3.5 rounded-[2px] bg-ink text-white flex items-center justify-center">
                    <Zap className="size-2" fill="currentColor" />
                  </div>
                  <span className="text-[9px] font-semibold text-ink">Meetday</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[7.5px] text-ink-muted">Features</span>
                  <span className="text-[7.5px] text-ink-muted">Pricing</span>
                  <span className="text-[7.5px] text-ink-muted">How it works</span>
                  <span className="h-4 px-1.5 rounded-sm bg-ink text-white text-[7px] font-medium flex items-center">Get started</span>
                </div>
              </div>

              {/* Hero */}
              <div className="text-center mb-3">
                <div className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-600 text-[6.5px] font-semibold uppercase tracking-wider mb-1.5">
                  AI Scheduling Assistant
                </div>
                <h3 className="text-[11px] font-bold text-ink leading-tight mb-1">
                  Find the perfect time,<br />automatically
                </h3>
                <p className="text-[7.5px] text-ink-muted max-w-[180px] mx-auto mb-2 leading-relaxed">
                  Meetday scans everyone's calendar and suggests the best meeting times—so you can focus on what matters.
                </p>
                <div className="flex items-center justify-center gap-1.5 mb-2.5">
                  <span className="h-4 px-2 rounded-sm bg-ink text-white text-[7px] font-medium flex items-center">Get started free</span>
                  <span className="h-4 px-2 rounded-sm border border-gray-200 text-[7px] font-medium flex items-center text-ink-soft">See how it works</span>
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <span className="inline-flex items-center gap-1 text-[6.5px] text-ink-muted">
                    <Zap className="size-2" /> Smart suggestions
                  </span>
                  <span className="inline-flex items-center gap-1 text-[6.5px] text-ink-muted">
                    <Calendar className="size-2" /> Calendar sync
                  </span>
                  <span className="inline-flex items-center gap-1 text-[6.5px] text-ink-muted">
                    <Clock className="size-2" /> Time savings
                  </span>
                </div>
              </div>

              {/* How it works */}
              <div className="border-t border-gray-100 pt-2.5">
                <div className="text-[6.5px] font-semibold text-blue-600 uppercase tracking-wider text-center mb-1.5">Features</div>
                <h4 className="text-[9.5px] font-bold text-ink text-center mb-2">Three simple steps</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon: <Calendar className="size-2.5" />, title: 'Connect calendars', desc: 'Securely connect your calendar accounts.' },
                    { icon: <Zap className="size-2.5" />, title: 'AI finds the best times', desc: 'Our AI checks availability and preferences.' },
                    { icon: <Clock className="size-2.5" />, title: 'Book with one click', desc: 'Add to calendar and send invites.' },
                  ].map((f) => (
                    <div key={f.title} className="text-center">
                      <div className="size-5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-1 text-ink-muted">
                        {f.icon}
                      </div>
                      <div className="text-[7px] font-semibold text-ink mb-0.5 leading-tight">{f.title}</div>
                      <div className="text-[6px] text-ink-muted leading-snug">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — analytics panel */}
          <div className="w-[26%] border-l border-gray-100 p-2.5 flex flex-col bg-white shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-ink leading-tight">Built-in PostHog analytics</span>
              <span className="text-[10px] text-ink-muted">›</span>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <span className="size-1 rounded-full bg-moss" />
              <span className="text-[8px] text-ink-muted">Live</span>
            </div>

            <div className="mb-0.5">
              <span className="text-[8px] text-ink-muted">Visitors</span>
              <div className="text-[18px] font-bold text-ink leading-none mt-0.5">12,458</div>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <span className="text-[8px] text-moss font-medium">↑ 18.6%</span>
              <span className="text-[7px] text-ink-faint">vs last 7 days</span>
            </div>

            <svg viewBox="0 0 100 30" className="w-full h-6 mb-2" aria-hidden>
              <path
                d="M0 24 L8 22 L16 20 L24 21 L32 17 L40 18 L48 14 L56 15 L64 10 L72 11 L80 7 L88 8 L100 4"
                stroke="var(--color-ember)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M0 24 L8 22 L16 20 L24 21 L32 17 L40 18 L48 14 L56 15 L64 10 L72 11 L80 7 L88 8 L100 4 V30 H0 Z"
                fill="var(--color-ember)"
                opacity="0.08"
              />
            </svg>

            <div className="flex items-center justify-between text-[7px] text-ink-faint mb-2">
              <span>May 9</span>
              <span>May 15</span>
            </div>

            <div className="text-[8px] font-semibold text-ink mb-1.5">Top events</div>
            <div className="space-y-1">
              {[
                { label: 'Page viewed', count: '8,326', width: '80%' },
                { label: 'CTA clicked', count: '2,103', width: '50%' },
                { label: 'Sign up', count: '512', width: '20%' },
                { label: 'Plan selected', count: '231', width: '10%' },
              ].map((e) => (
                <div key={e.label} className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-ink rounded-full" style={{ width: e.width }} />
                  </div>
                  <span className="text-[7px] text-ink-muted w-7 text-right tabular-nums">{e.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-2 border-t border-gray-100">
              <span className="text-[8px] text-ink-muted flex items-center gap-1">
                View full analytics <span className="text-[9px]">→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
