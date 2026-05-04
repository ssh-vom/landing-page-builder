import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { type ApiGeneration, displayUrl, listGenerations } from '@/lib/api';

function formatCreated(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function HistoryList() {
  const [items, setItems] = useState<ApiGeneration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listGenerations()
      .then((result) => { if (!cancelled) setItems(result.generations); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load history'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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

      {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

      <div className="border border-gray-100 rounded-[var(--radius-lg)] overflow-hidden bg-white shadow-[var(--shadow-sketch)]">
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_120px_120px_60px] gap-4 px-5 py-3 text-[11px] font-medium text-ink-faint uppercase tracking-wide border-b border-gray-100 bg-gray-50">
          <div>Prompt</div>
          <div>Deployed URL</div>
          <div>Status</div>
          <div>Created</div>
          <div></div>
        </div>

        <ul>
          {loading ? (
            <li className="px-5 py-8 text-sm text-ink-muted">Loading generations…</li>
          ) : items.length === 0 ? (
            <li className="px-5 py-8 text-sm text-ink-muted">No generations yet.</li>
          ) : items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[1.5fr_1fr_120px_120px_60px] gap-3 md:gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[14px] text-ink line-clamp-2 leading-snug">{item.prompt}</div>
                <div className="text-[10.5px] text-ink-faint mono mt-1">{item.id}</div>
              </div>
              <div className="text-[13px] text-ink-soft truncate hidden md:flex items-center">
                {item.deployment_url ? (
                  <a
                    href={item.deployment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mono inline-flex items-center gap-1 hover:text-ember transition-colors"
                  >
                    {displayUrl(item.deployment_url)}
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
                  {item.status === 'complete' ? 'Live' : item.status === 'in_progress' ? 'Building' : item.status === 'failed' ? 'Failed' : 'Queued'}
                </Badge>
              </div>
              <div className="hidden md:flex items-center text-[11.5px] text-ink-muted mono">
                {formatCreated(item.created_at)}
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
