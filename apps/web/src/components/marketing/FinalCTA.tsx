import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCTA() {
    return (
        <section className="py-20 lg:py-24 bg-white">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
                <div className="bg-paper-deep rounded-[var(--radius-xl)] p-10 lg:p-16 text-center">
                    <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-ink leading-tight mb-3">
                        Ready to launch?
                    </h2>
                    <p className="text-[15px] text-ink-muted mb-8 max-w-[480px] mx-auto">
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                        <Link to="/new">
                            <Button variant="primary" size="lg">
                                Generate my app now
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
