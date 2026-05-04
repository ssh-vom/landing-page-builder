import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full bg-bone border border-ink/15 rounded-[var(--radius-sm)] px-3 text-[14px]',
        'placeholder:text-ink-faint text-ink',
        'transition-colors focus:outline-none focus:border-ink/55 focus-ember',
        invalid && 'border-ember/60 focus:border-ember',
        className,
      )}
      {...props}
    />
  );
});
