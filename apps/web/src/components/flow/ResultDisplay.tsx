import { useState } from 'react';
import { Check, Copy, ExternalLink, Pencil, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GeneratedSitePreview } from './GeneratedSitePreview';

interface ResultDisplayProps {
  url: string;
  onEdit: () => void;
}

export function ResultDisplay({ url, onEdit }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto max-w-[1080px] px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
        {/* Left — preview */}
        <div>
          <div className="mb-4">
            <h1 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] mb-2">
              Your page is live
            </h1>
            <p className="text-[14px] text-ink-muted leading-relaxed max-w-[480px]">
              Shipped to Cloudflare Pages. Review the preview below, then refine in the editor or share the link.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-ink-faint uppercase tracking-wide">Preview</span>
              <button
                onClick={onEdit}
                className="text-[12px] font-medium text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1"
              >
                <Pencil className="size-3" /> Open in editor
              </button>
            </div>
            <GeneratedSitePreview />
          </div>
        </div>

        {/* Right — URL + actions + stats */}
        <div className="lg:sticky lg:top-24">
          {/* URL display */}
          <div className="bg-white border border-gray-100 rounded-[var(--radius-lg)] p-5 mb-4 shadow-[var(--shadow-sketch)]">
            <div className="text-[11px] font-medium text-ink-faint uppercase tracking-wide mb-2">Live URL</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 text-[13px] text-ink mono truncate">{url}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={copy} iconLeft={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <a href={`https://${url}`} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="ink" size="sm" className="w-full" iconRight={<ExternalLink className="size-3.5" />}>
                  Open
                </Button>
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mb-6">
            <Button variant="primary" size="lg" onClick={onEdit} iconLeft={<Pencil className="size-4" />}>
              Open in editor
            </Button>
            <a href="/new">
              <Button variant="secondary" size="lg" className="w-full" iconRight={<ArrowUpRight className="size-4" />}>
                Build another
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="bg-white border border-gray-100 rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sketch)]">
            <div className="px-4 py-3 border-b border-gray-100 text-[11px] font-medium text-ink-faint uppercase tracking-wide">
              Generation details
            </div>
            <div className="divide-y divide-gray-100">
              <StatRow label="Generation time" value="1m 32s" />
              <StatRow label="Sections" value="5" />
              <StatRow label="Cloudflare project" value="meetday-9f3a" mono />
              <StatRow label="PostHog project" value="lp-shared" mono />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className={mono ? 'text-[12px] text-ink mono' : 'text-[13px] font-semibold text-ink'}>
        {value}
      </span>
    </div>
  );
}
