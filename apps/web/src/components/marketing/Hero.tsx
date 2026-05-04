import { Link } from 'react-router-dom';
import { Sparkles, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PreviewMockup } from './PreviewMockup';

const tags = ['AI-powered', 'Autonomous', 'Built for results'];

export function Hero() {
    return (
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-white">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — copy */}
                    <div className="animate-rise">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-200 text-[12px] font-medium text-ink-muted bg-white"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-ink leading-[1.08] tracking-tight mb-7">
                            Generate high-converting landing pages autonomously
                        </h1>

                        <p className="text-[17px] leading-[1.6] text-ink-muted max-w-[520px] mb-8">
                            Describe your product and Launchpad AI generates a complete, ready-to-publish landing
                            page—copy, layout, sections and all. One click from idea to live page.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <Link to="/new">
                                <Button variant="primary" size="lg" iconLeft={<Sparkles className="size-4" />}>
                                    Generate my landing page
                                </Button>
                            </Link>
                        </div>

                    </div>

                    {/* Right — mockup */}
                    <div className="relative animate-rise" style={{ animationDelay: '120ms' }}>
                        <PreviewMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}
