import { Logo } from '@/components/ui/Logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 py-12 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 text-[13.5px] text-ink-muted leading-relaxed max-w-[260px]">
            Generate, edit, and publish high-converting landing pages autonomously.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-ink-faint">© 2026 Launchpad AI</p>
          <p className="text-[12px] text-ink-faint">v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
