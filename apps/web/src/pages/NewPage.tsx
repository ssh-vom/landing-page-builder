import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PromptIntake } from '@/components/flow/PromptIntake';
import { Logo } from '@/components/ui/Logo';
import { createGeneration } from '@/lib/api';

export default function NewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') ?? '';
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(prompt: string) {
    setError(null);
    try {
      const generation = await createGeneration(prompt);
      navigate(`/g/${generation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
    }
  }

  return (
    <div className="bg-white text-ink min-h-screen">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="focus-ember -mx-1 px-1">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Cancel
          </Link>
        </div>
      </header>
      {error ? <div className="mx-auto max-w-[720px] px-6 pt-6 text-sm text-red-600">{error}</div> : null}
      <PromptIntake initialPrompt={initialPrompt} onSubmit={handleSubmit} />
    </div>
  );
}
