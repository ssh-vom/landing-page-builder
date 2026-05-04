import { cn } from '@/lib/cn';
import type { StageStatus } from '@/lib/types';

interface StatusDotProps {
  status: StageStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  if (status === 'in_progress') {
    return (
      <span className={cn('relative inline-flex size-2.5', className)} aria-label="in progress">
        <span className="absolute inset-0 rounded-full bg-ember animate-ember-pulse" />
        <span className="relative size-2.5 rounded-full bg-ember" />
      </span>
    );
  }
  if (status === 'complete') {
    return (
      <span
        className={cn('inline-flex items-center justify-center size-2.5 rounded-full bg-moss', className)}
        aria-label="complete"
      />
    );
  }
  if (status === 'failed') {
    return (
      <span
        className={cn('inline-flex items-center justify-center size-2.5 rounded-full bg-ember-deep', className)}
        aria-label="failed"
      />
    );
  }
  return (
    <span
      className={cn('inline-flex size-2.5 rounded-full border border-ink/30', className)}
      aria-label="pending"
    />
  );
}
