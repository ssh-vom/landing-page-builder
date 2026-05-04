import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface HistoryItem {
  id: string;
  prompt: string;
  url?: string;
  status: 'complete' | 'in_progress' | 'failed';
  createdAt: string;
  duration?: string;
}

const items: HistoryItem[] = [
  {
    id: 'gen_8f3c2a91',
    prompt: 'An autoscheduling assistant called Meetday that finds the best meeting times.',
    url: 'meetday.launchpad.ai',
    status: 'complete',
    createdAt: '2026-05-04 · 10:31',
    duration: '1m 32s',
  },
  {
    id: 'gen_7a1d4e08',
    prompt: 'A waitlist page for an indie minimalist note-taking app with end-to-end encryption.',
    url: 'quietnotes.launchpad.ai',
    status: 'complete',
    createdAt: '2026-05-03 · 22:14',
    duration: '1m 18s',
  },
  {
    id: 'gen_6b22f0c4',
    prompt: 'A landing page for an AI screening tool for recruiters.',
    status: 'in_progress',
    createdAt: '2026-05-03 · 18:06',
  },
  {
    id: 'gen_5e09a217',
    prompt: 'A product page for a B2B revenue analytics dashboard for Series A founders.',
    url: 'revscope.launchpad.ai',
    status: 'failed',
    createdAt: '2026-05-02 · 16:48',
  },
];

export function HistoryList() {
  return (
    <div className="mx-auto max-w-[1080px] px-6 lg:px-8 py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold leading-[1.1] mb-1">
            Past generations
          </h1>
          <p className="text-[14px] text-ink-muted">View and manage your generated pages.</p>
        </div>
        <Link to="/new">
          <Button variant="primary" size="md" iconRight={<ArrowRight className="size-4" />}>
            New generation
          </Button>
        </Link>
      </div>

      <div className="border border-gray-100 rounded-[var(--radius-lg)] overflow-hidden bg-white shadow-[var(--shadow-sketch)]">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_120px_120px_60px] gap-4 px-5 py-3 text-[11px] font-medium text-ink-faint uppercase tracking-wide border-b border-gray-100 bg-gray-50">
          <div>Prompt</div>
          <div>Deployed URL</div>
          <div>Status</div>
          <div>Created</div>
          <div></div>
        </div>

        {/* Rows */}
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[1.5fr_1fr_120px_120px_60px] gap-3 md:gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[14px] text-ink line-clamp-2 leading-snug">{item.prompt}</div>
                <div className="text-[10.5px] text-ink-faint mono mt-1">{item.id}</div>
              </div>
              <div className="text-[13px] text-ink-soft truncate hidden md:flex items-center">
                {item.url ? (
                  <a
                    href={`https://${item.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mono inline-flex items-center gap-1 hover:text-ember transition-colors"
                  >
                    {item.url}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="mono text-ink-faint">—</span>
                )}
              </div>
              <div className="hidden md:flex items-center">
                <Badge
                  tone={
                    item.status === 'complete' ? 'moss' : item.status === 'in_progress' ? 'ember' : 'neutral'
                  }
                  dot
                >
                  {item.status === 'complete' ? 'Live' : item.status === 'in_progress' ? 'Building' : 'Failed'}
                </Badge>
              </div>
              <div className="hidden md:flex items-center text-[11.5px] text-ink-muted mono">
                {item.createdAt}
              </div>
              <div className="flex items-center justify-end">
                <Link
                  to={`/g/${item.id}`}
                  aria-label={`open ${item.id}`}
                  className="size-8 rounded-[var(--radius-xs)] flex items-center justify-center text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors focus-ember"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-[12px] text-ink-faint">
        Showing {items.length} · Failures retain logs for debugging
      </p>
    </div>
  );
}
