import { useState } from 'react';
import {
  Sparkles,
  Send,
  Type,
  Users,
  Wand2,
  History as HistoryIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface Suggestion {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const suggestions: Suggestion[] = [
  {
    icon: <Type className="size-3.5" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'Improve headline',
    description: 'Make it more compelling and benefit-driven',
  },
  {
    icon: <Users className="size-3.5" />,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    title: 'Add social proof',
    description: 'Add customer logos or testimonials',
  },
  {
    icon: <Wand2 className="size-3.5" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Refine features',
    description: 'Highlight different benefits or use cases',
  },
];

interface RecentChange {
  label: string;
  age: string;
}

const recentChanges: RecentChange[] = [
  { label: 'Updated hero headline', age: 'Just now' },
  { label: 'Adjusted pricing section', age: '2 min ago' },
  { label: 'Changed hero background', age: '5 min ago' },
];

export function AssistantPanel() {
  const [message, setMessage] = useState('');

  return (
    <aside className="w-[340px] shrink-0 border-l border-gray-100 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-4 text-ember" />
          <span className="text-[13px] font-semibold text-ink">AI Assistant</span>
        </div>

        <div className="mb-4">
          <div className="text-[13px] font-semibold text-ink mb-0.5">Hi Jon! 👋</div>
          <div className="text-[12px] text-ink-muted">I built your page.</div>
          <div className="text-[12px] text-ink-muted">Here are a few ways I can help.</div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-4 border-b border-gray-100">
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s.title}>
              <button className="w-full text-left bg-white border border-gray-100 rounded-[var(--radius-md)] px-3 py-2.5 hover:border-gray-200 hover:shadow-[var(--shadow-sketch)] transition-all focus-ember group flex items-start gap-2.5">
                <span className={`size-7 rounded-[var(--radius-sm)] ${s.iconBg} ${s.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                  {s.icon}
                </span>
                <div>
                  <span className="text-[13px] font-medium text-ink">{s.title}</span>
                  <p className="text-[11.5px] text-ink-muted leading-snug">{s.description}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent changes */}
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex items-center gap-2 mb-3">
          <HistoryIcon className="size-3.5 text-ink-faint" />
          <div className="text-[11px] font-medium text-ink-faint uppercase tracking-wide">Recent changes</div>
        </div>
        <ul className="space-y-2">
          {recentChanges.map((c, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="text-[12.5px] text-ink-soft">{c.label}</span>
              <span className="text-[11px] text-ink-faint">{c.age}</span>
            </li>
          ))}
        </ul>
        <button className="mt-3 text-[11.5px] text-ink-faint hover:text-ink transition-colors">
          View change history
        </button>
      </div>

      {/* Chat input */}
      <div className="p-4 border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage('');
          }}
          className="relative"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything about your site…"
            className="w-full bg-gray-50 border border-gray-100 rounded-[var(--radius-md)] px-3 py-2.5 pr-10 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-gray-200 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            aria-label="send"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-[var(--radius-xs)] flex items-center justify-center transition-colors focus-ember',
              message
                ? 'bg-ember text-white hover:bg-ember-deep'
                : 'bg-gray-100 text-ink-faint',
            )}
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
