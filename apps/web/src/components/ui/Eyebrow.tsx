import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  marker?: boolean;
}

export function Eyebrow({ children, className, marker = false }: EyebrowProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted', className)}>
      {marker && (
        <span className="inline-flex items-center gap-1" aria-hidden>
          <span className="block w-4 h-px bg-ember" />
          <span className="block size-1 rounded-full bg-ember" />
        </span>
      )}
      {children}
    </span>
  );
}
