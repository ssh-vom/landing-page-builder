import { Monitor, Tablet, Smartphone, Maximize2, RefreshCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportWidths: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '760px',
  mobile: '380px',
};

interface PreviewCanvasProps {
  url?: string;
  children: ReactNode;
}

export function PreviewCanvas({ url = 'meetday.launchpad.ai', children }: PreviewCanvasProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  return (
    <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
      {/* Canvas toolbar */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((v) => {
            const Icon = v === 'desktop' ? Monitor : v === 'tablet' ? Tablet : Smartphone;
            return (
              <button
                key={v}
                onClick={() => setViewport(v)}
                aria-label={`${v} viewport`}
                className={cn(
                  'size-7 rounded-[var(--radius-xs)] flex items-center justify-center transition-colors focus-ember',
                  viewport === v
                    ? 'bg-ink text-white'
                    : 'text-ink-muted hover:bg-gray-50 hover:text-ink',
                )}
              >
                <Icon className="size-3.5" />
              </button>
            );
          })}
          <span className="mx-2 h-4 w-px bg-gray-100" aria-hidden />
          <button
            aria-label="refresh preview"
            className="size-7 rounded-[var(--radius-xs)] flex items-center justify-center text-ink-muted hover:bg-gray-50 hover:text-ink transition-colors focus-ember"
          >
            <RefreshCcw className="size-3.5" />
          </button>
        </div>

        {/* Mock URL bar */}
        <div className="flex-1 max-w-[420px] mx-4 hidden sm:flex items-center gap-2 h-7 px-3 rounded-[var(--radius-sm)] bg-gray-50 border border-gray-100">
          <span className="size-1.5 rounded-full bg-moss" />
          <span className="text-[11.5px] text-ink-muted mono truncate">{url}</span>
        </div>

        <Button variant="ghost" size="sm" iconLeft={<Maximize2 className="size-3.5" />}>
          Full screen
        </Button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div
          className="mx-auto bg-white rounded-[var(--radius-md)] overflow-hidden border border-gray-100 shadow-[var(--shadow-card)] transition-[max-width] duration-300 ease-out"
          style={{ maxWidth: viewportWidths[viewport] }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
