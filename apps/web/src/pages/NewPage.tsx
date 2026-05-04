import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PromptIntake } from '@/components/flow/PromptIntake';
import { Logo } from '@/components/ui/Logo';

export default function NewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') ?? '';

  function handleSubmit(prompt: string) {
    const id = `gen_${Math.random().toString(36).slice(2, 10)}`;
    navigate(`/g/${id}?status=in_progress&prompt=${encodeURIComponent(prompt)}`);
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
      <PromptIntake initialPrompt={initialPrompt} onSubmit={handleSubmit} />
    </div>
  );
}
