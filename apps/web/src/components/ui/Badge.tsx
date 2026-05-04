import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'ember' | 'moss' | 'azure' | 'ink';

const tones: Record<Tone, string> = {
  neutral: 'bg-paper-deep text-ink-soft border-ink/15',
  ember: 'bg-ember-tint text-ember-deep border-ember/30',
  moss: 'bg-moss-tint text-moss border-moss/30',
  azure: 'bg-[#DDE5EE] text-azure border-azure/30',
  ink: 'bg-ink text-bone border-ink',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ tone = 'neutral', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 mono-label px-2 py-1 border rounded-[var(--radius-xs)]',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
