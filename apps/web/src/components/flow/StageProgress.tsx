import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Stage } from '@/lib/types';

interface StageProgressProps {
  stages: Stage[];
  prompt: string;
}

export function StageProgress({ stages, prompt }: StageProgressProps) {
  const completed = stages.filter((s) => s.status === 'complete').length;
  const total = stages.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="mx-auto max-w-[720px] px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] mb-3">
        Generating your page
      </h1>
      <p className="text-[14px] text-ink-muted leading-relaxed mb-8 max-w-[480px]">
        “{prompt}”
      </p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-[11px] font-medium text-ink-faint uppercase tracking-wide">
          <span>Progress</span>
          <span>
            {completed}/{total} · {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-ember transition-[width] duration-500 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <ol className="border border-gray-100 rounded-[var(--radius-lg)] divide-y divide-gray-100 overflow-hidden bg-white">
        {stages.map((stage, i) => (
          <StageRow key={stage.id} stage={stage} index={i} />
        ))}
      </ol>

      <p className="mt-5 text-[12px] text-ink-faint">
        Failures retry automatically · You can leave this page and come back
      </p>
    </div>
  );
}

function StageRow({ stage, index }: { stage: Stage; index: number }) {
  const inProgress = stage.status === 'in_progress';
  const complete = stage.status === 'complete';
  const failed = stage.status === 'failed';

  return (
    <li
      className={cn(
        'flex items-start gap-4 px-5 py-4 transition-colors',
        inProgress && 'bg-amber-50/50',
      )}
    >
      <div className="shrink-0 pt-0.5">
        {complete ? (
          <span className="size-6 rounded-full bg-moss text-white flex items-center justify-center">
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : failed ? (
          <span className="size-6 rounded-full bg-red-500 text-white flex items-center justify-center">
            <X className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : (
          <span
            className={cn(
              'size-6 rounded-full flex items-center justify-center text-[11px] font-medium border',
              inProgress
                ? 'border-amber-300 bg-white text-amber-700'
                : 'border-gray-200 bg-white text-ink-faint',
            )}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-[14px] font-medium', complete || inProgress ? 'text-ink' : 'text-ink-muted')}>
            {stage.label}
          </span>
          {inProgress && (
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">{stage.description}</p>
      </div>

      <span className="text-[11px] font-medium text-ink-faint pt-1 shrink-0 uppercase tracking-wide">
        {complete ? 'done' : inProgress ? 'running' : failed ? 'failed' : 'queued'}
      </span>
    </li>
  );
}
