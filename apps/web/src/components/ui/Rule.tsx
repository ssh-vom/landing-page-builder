import { cn } from '@/lib/cn';

export function Rule({ className }: { className?: string }) {
  return <div className={cn('hairline', className)} aria-hidden />;
}

export function VRule({ className }: { className?: string }) {
  return <div className={cn('hairline-v', className)} aria-hidden />;
}
