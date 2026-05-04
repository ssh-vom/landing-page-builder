import { Logo } from '@/components/ui/Logo';

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Templates'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Privacy'],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 py-12 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-[13.5px] text-ink-muted leading-relaxed max-w-[260px]">
              Generate, edit, and publish high-converting landing pages autonomously.
            </p>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold text-ink mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13.5px] text-ink-muted hover:text-ink transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-ink-faint">© 2026 Launchpad AI</p>
          <p className="text-[12px] text-ink-faint">v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
