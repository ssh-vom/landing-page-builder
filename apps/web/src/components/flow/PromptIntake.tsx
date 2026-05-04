import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PromptIntakeProps {
  initialPrompt?: string;
  onSubmit: (prompt: string) => void;
}

const examples = [
  'A landing page for an AI assistant that helps recruiters screen candidates faster',
  'A waitlist page for an indie minimalist note-taking app with sync and end-to-end encryption',
  'A product page for a B2B revenue analytics tool aimed at Series A founders',
];

export function PromptIntake({ initialPrompt = '', onSubmit }: PromptIntakeProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 lg:px-8 py-16 lg:py-24">
      <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08] mb-3">
        What should we build?
      </h1>
      <p className="text-[15px] text-ink-muted leading-relaxed mb-10 max-w-[480px]">
        Describe the product or page you want. We'll plan, write, build, and deploy it in minutes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            autoFocus
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the page you want…"
            rows={5}
            className="w-full rounded-[var(--radius-md)] border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-faint resize-none focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember/20 transition-all pr-28 pb-14"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[11px] text-ink-faint mono hidden sm:inline">
              {prompt.length} chars
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!prompt.trim()}
              iconRight={<ArrowUpRight className="size-4" />}
            >
              Generate
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-3.5 text-ink-faint" />
            <span className="text-[12px] font-medium text-ink-faint">Try one of these</span>
          </div>
          <ul className="space-y-2">
            {examples.map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left px-4 py-3 rounded-[var(--radius-md)] border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 transition-colors focus-ember text-[13.5px] text-ink-soft"
                >
                  <span className="text-ink-faint mr-2">→</span>
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}
