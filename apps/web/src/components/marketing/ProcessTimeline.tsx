import { MessageSquare, Sparkles, Rocket, BarChart3 } from 'lucide-react';
import { type ReactNode } from 'react';

interface Step {
  n: string;
  title: string;
  body: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

const steps: Step[] = [
  {
    n: '1',
    title: 'Prompt',
    body: 'Describe your product, audience and goals.',
    icon: <MessageSquare className="size-4" />,
    iconBg: 'bg-gray-100',
    iconColor: 'text-ink-muted',
  },
  {
    n: '2',
    title: 'Generate',
    body: 'AI creates copy, layout and sections instantly.',
    icon: <Sparkles className="size-4" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    n: '3',
    title: 'Publish',
    body: 'Review and publish your landing page in one click.',
    icon: <Rocket className="size-4" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    n: '4',
    title: 'Measure',
    body: 'Track performance with built-in analytics.',
    icon: <BarChart3 className="size-4" />,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
];

export function ProcessTimeline() {
  return (
    <section id="process" className="py-20 lg:py-24 bg-paper-deep">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-ink text-center mb-14">
          From idea to impact in four simple steps
        </h2>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              {/* Dotted arrow between steps */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(100%+12px)] w-[calc(100%-24px)]">
                  <div className="border-t-2 border-dashed border-gray-200" />
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className={`size-10 rounded-full ${step.iconBg} ${step.iconColor} flex items-center justify-center mb-4`}>
                  {step.icon}
                </div>
                <div className="text-[13px] font-semibold text-ink mb-1">
                  {step.n}. {step.title}
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed max-w-[200px]">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
