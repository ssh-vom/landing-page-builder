import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export function MarketingNav() {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" aria-label="Launchpad AI home" className="focus-ember -mx-1 px-1">
                    <Logo />
                </Link>

                <div className="flex items-center gap-3">
                    <Link to="/history">
                        <Button variant="ghost" size="sm">
                            Builds
                        </Button>
                    </Link>
                    <Link to="/new">
                        <Button variant="primary" size="sm">
                            Start building free
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
