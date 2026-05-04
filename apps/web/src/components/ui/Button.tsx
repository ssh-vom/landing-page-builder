import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ink';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out select-none focus-ember disabled:opacity-40 disabled:pointer-events-none active:translate-y-[1px]';

const variants: Record<Variant, string> = {
  primary:
    'bg-ember text-white hover:bg-ember-deep shadow-sm',
  secondary:
    'bg-white border border-gray-200 text-ink hover:border-gray-300 hover:bg-gray-50',
  ghost: 'text-ink-muted hover:text-ink hover:bg-gray-50',
  ink: 'bg-ink text-white hover:bg-ink-soft shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-[var(--radius-sm)]',
  md: 'h-9 px-4 text-[14px] rounded-[var(--radius-sm)]',
  lg: 'h-11 px-5 text-[15px] rounded-[var(--radius-md)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', iconLeft, iconRight, loading, className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {loading ? (
        <span className="size-3.5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin-slow" />
      ) : (
        iconLeft
      )}
      <span className="leading-none">{children}</span>
      {!loading && iconRight}
    </button>
  );
});
