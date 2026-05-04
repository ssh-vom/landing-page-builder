import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-bone border border-ink/15 rounded-[var(--radius-md)] px-4 py-3 text-[15px] leading-relaxed',
        'placeholder:text-ink-faint text-ink resize-none',
        'transition-colors focus:outline-none focus:border-ink/55 focus-ember',
        className,
      )}
      {...props}
    />
  );
});
