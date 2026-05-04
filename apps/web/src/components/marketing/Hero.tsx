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

            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-ink leading-[1.08] tracking-tight mb-6">
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
              <Button variant="secondary" size="lg" iconLeft={<Play className="size-3.5 fill-current" />}>
                See how it works
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-500"
                    style={{
                      backgroundImage: `linear-gradient(135deg, #${['E5E7EB', 'D1D5DB', '9CA3AF', '6B7280'][i - 1]} 0%, #${['F3F4F6', 'E5E7EB', 'D1D5DB', '9CA3AF'][i - 1]} 100%)`,
                    }}
                  >
                    <span className="sr-only">User {i}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[13px] text-ink-muted">
                  Trusted by <span className="font-semibold text-ink-soft">2,500+</span> founders and marketers
                </span>
              </div>
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
