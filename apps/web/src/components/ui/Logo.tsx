import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function Logo({ className, size = 28, showWordmark = true, wordmarkClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Mark size={size} />
      {showWordmark && (
        <span className={cn('text-[1.15rem] font-semibold tracking-tight text-ink leading-none', wordmarkClassName)}>
          Launchpad AI
        </span>
      )}
    </div>
  );
}

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[var(--radius-sm)] bg-ember text-white"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 4L42 14L24 24L6 14L24 4Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M24 24V44" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
  );
}
