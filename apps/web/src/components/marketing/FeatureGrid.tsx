import { Wand2, Pencil, BarChart3 } from 'lucide-react';
import { type ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    icon: <Wand2 className="size-5" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Autonomous site generation',
    body: 'Launchpad AI writes persuasive copy, chooses proven layouts, and builds complete sections tailored to your product and audience.',
  },
  {
    icon: <Pencil className="size-5" />,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    title: 'Edit and customize effortlessly',
    body: 'Fine-tune any section with our visual editor. Swap content, change styles, and make it yours—no code required.',
  },
  {
    icon: <BarChart3 className="size-5" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Built-in PostHog analytics',
    body: 'Track visitors, events and conversions out of the box with built-in PostHog analytics—so you can optimize with confidence.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[var(--radius-lg)] border border-gray-100 bg-white p-6 lg:p-8 hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              <div className={`size-10 rounded-[var(--radius-md)] ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-[1.1rem] font-semibold text-ink mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
