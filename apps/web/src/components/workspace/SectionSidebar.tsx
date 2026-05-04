import { useState } from 'react';
import {
  ChevronDown,
  Layout,
  Sparkles,
  Briefcase,
  Tag,
  MessageCircle,
  ArrowRightCircle,
  Plus,
  Loader2,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: Section[] = [
  { id: 'hero', label: 'Hero', icon: <Sparkles className="size-3.5" /> },
  { id: 'features', label: 'Features', icon: <Briefcase className="size-3.5" /> },
  { id: 'pricing', label: 'Pricing', icon: <Tag className="size-3.5" /> },
  { id: 'testimonials', label: 'Testimonials', icon: <MessageCircle className="size-3.5" /> },
  { id: 'cta', label: 'CTA', icon: <ArrowRightCircle className="size-3.5" /> },
];

interface SectionSidebarProps {
  active: string;
  onSelect: (id: string) => void;
  onRegenerate?: (prompt: string) => void;
  isRegenerating?: boolean;
}

export function SectionSidebar({ active, onSelect, onRegenerate, isRegenerating }: SectionSidebarProps) {
  const [pageOpen, setPageOpen] = useState(true);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [showRegenInput, setShowRegenInput] = useState(false);

  function handleRegenerate() {
    if (!showRegenInput) {
      setShowRegenInput(true);
      return;
    }
    if (!regenPrompt.trim()) return;
    onRegenerate?.(regenPrompt.trim());
    setRegenPrompt('');
    setShowRegenInput(false);
  }

  return (
    <aside className="w-[260px] shrink-0 border-r border-gray-100 bg-white flex flex-col">
      {/* Generation info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="size-3.5 text-ember" />
          <span className="text-[12px] font-semibold text-ember">Autonomously generated</span>
        </div>
        <div className="text-[12px] text-ink-muted mb-3">May 15, 2025 at 10:30 AM</div>

        {showRegenInput && (
          <div className="mb-2">
            <textarea
              value={regenPrompt}
              onChange={(e) => setRegenPrompt(e.target.value)}
              placeholder="What would you like to change?"
              rows={3}
              className="w-full rounded-[var(--radius-sm)] border border-gray-200 bg-white px-2.5 py-2 text-[12px] text-ink placeholder:text-ink-faint resize-none focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember/20 transition-all"
            />
          </div>
        )}

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating || (showRegenInput && !regenPrompt.trim())}
          className="w-full h-8 rounded-[var(--radius-sm)] border border-gray-200 text-[12px] font-medium text-ink-soft hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Regenerating…
            </>
          ) : showRegenInput ? (
            <>
              <Send className="size-3" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="size-3" />
              Regenerate
            </>
          )}
        </button>
      </div>

      {/* Pages tree */}
      <div className="p-3 flex-1 overflow-auto">
        <div className="text-[11px] font-medium text-ink-faint uppercase tracking-wide px-2 mb-2">Pages</div>

        <button
          onClick={() => setPageOpen((v) => !v)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-ink rounded-[var(--radius-xs)] hover:bg-gray-50 transition-colors focus-ember"
        >
          <ChevronDown
            className={cn('size-3 text-ink-muted transition-transform', !pageOpen && '-rotate-90')}
          />
          <Layout className="size-3.5 text-ink-muted" />
          <span className="font-medium">Landing page</span>
        </button>

        {pageOpen && (
          <ul className="mt-1 ml-2 pl-3 border-l border-gray-100 space-y-px">
            {sections.map((s) => {
              const isActive = s.id === active;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => onSelect(s.id)}
                    className={cn(
                      'w-full flex items-center gap-2 pl-3 pr-2 py-1.5 text-[13px] rounded-[var(--radius-xs)] transition-colors focus-ember relative',
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-medium'
                        : 'text-ink-soft hover:bg-gray-50 hover:text-ink',
                    )}
                  >
                    {isActive && (
                      <span className="absolute -left-[13px] top-1 bottom-1 w-px bg-amber-500" aria-hidden />
                    )}
                    {s.icon}
                    {s.label}
                  </button>
                </li>
              );
            })}
            <li>
              <button className="w-full flex items-center gap-2 pl-3 pr-2 py-1.5 text-[13px] text-ink-faint hover:text-ink hover:bg-gray-50 rounded-[var(--radius-xs)] transition-colors focus-ember">
                <Plus className="size-3.5" />
                Add section
              </button>
            </li>
          </ul>
        )}
      </div>
    </aside>
  );
}
