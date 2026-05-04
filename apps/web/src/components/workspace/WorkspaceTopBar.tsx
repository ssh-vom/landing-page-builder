import { Link } from 'react-router-dom';
import { ChevronDown, Eye, Share2, Rocket } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

interface WorkspaceTopBarProps {
  projectName: string;
  status?: 'draft' | 'live' | 'building';
}

export function WorkspaceTopBar({ projectName, status = 'draft' }: WorkspaceTopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-5 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/" aria-label="Launchpad AI home" className="focus-ember -mx-1 px-1 shrink-0">
          <Logo showWordmark={false} size={24} />
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-[13px] text-ink-muted min-w-0">
          <span className="text-ink-faint">Project</span>
          <button className="flex items-center gap-1 text-ink font-medium hover:text-ink-soft transition-colors truncate">
            <span className="truncate">{projectName} landing page</span>
            <ChevronDown className="size-3.5 text-ink-faint shrink-0" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" iconLeft={<Eye className="size-3.5" />}>
          Preview
        </Button>
        <Button variant="ghost" size="sm" iconLeft={<Share2 className="size-3.5" />}>
          Share
        </Button>
        <Button variant="primary" size="sm" iconLeft={<Rocket className="size-3.5" />}>
          Publish
        </Button>
      </div>
    </header>
  );
}
