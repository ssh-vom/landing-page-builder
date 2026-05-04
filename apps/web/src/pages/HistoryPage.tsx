import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { HistoryList } from '@/components/flow/HistoryList';

export default function HistoryPage() {
  return (
    <div className="bg-white text-ink min-h-screen">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="focus-ember -mx-1 px-1">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            <Link to="/new">
              <Button variant="primary" size="sm">
                New generation
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <HistoryList />
    </div>
  );
}
