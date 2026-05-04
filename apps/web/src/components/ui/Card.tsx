import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'bone' | 'ink' | 'outlined';
  flush?: boolean;
}

const variants = {
  paper: 'bg-paper-deep border border-ink/10',
  bone: 'bg-bone border border-ink/10 shadow-[var(--shadow-card)]',
  ink: 'bg-ink text-bone border border-ink',
  outlined: 'bg-transparent border border-ink/15',
};

export function Card({ variant = 'bone', flush, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)]',
        !flush && 'p-5',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
