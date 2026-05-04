import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_STAGES, type Stage, type StageStatus } from '@/lib/types';
import { StageProgress } from '@/components/flow/StageProgress';
import { ResultDisplay } from '@/components/flow/ResultDisplay';
import { Logo } from '@/components/ui/Logo';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { WorkspaceTopBar } from '@/components/workspace/WorkspaceTopBar';
import { SectionSidebar } from '@/components/workspace/SectionSidebar';
import { PreviewCanvas } from '@/components/workspace/PreviewCanvas';
import { AssistantPanel } from '@/components/workspace/AssistantPanel';
import { MockLandingPreview } from '@/components/workspace/MockLandingPreview';

type View = 'progress' | 'result' | 'editor';

export default function GenerationPage() {
  const { id = 'gen_demo' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialStatus = searchParams.get('status') ?? 'complete';
  const prompt = searchParams.get('prompt') ?? 'An autoscheduling assistant that finds the best meeting times.';

  const [view, setView] = useState<View>(
    initialStatus === 'in_progress' ? 'progress' : 'editor',
  );
  const [stages, setStages] = useState<Stage[]>(() =>
    initialStatus === 'in_progress'
      ? DEFAULT_STAGES.map((s, i) =>
          i === 0 ? { ...s, status: 'in_progress' as StageStatus } : s,
        )
      : DEFAULT_STAGES.map((s) => ({ ...s, status: 'complete' as StageStatus })),
  );
  const [activeSection, setActiveSection] = useState('hero');

  // Simulated stage progression — replace with real polling against backend
  useEffect(() => {
    if (view !== 'progress') return;

    const interval = setInterval(() => {
      setStages((prev) => {
        const idx = prev.findIndex((s) => s.status === 'in_progress');
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], status: 'complete' };
        if (idx + 1 < next.length) {
          next[idx + 1] = { ...next[idx + 1], status: 'in_progress' };
        } else {
          setTimeout(() => setView('result'), 800);
        }
        return next;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [view]);

  if (view === 'progress') {
    return (
      <div className="bg-white text-ink min-h-screen">
        <FlowHeader id={id} />
        <StageProgress stages={stages} prompt={prompt} />
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="bg-white text-ink min-h-screen">
        <FlowHeader id={id} />
        <ResultDisplay
          url={`meetday-${id.slice(-4)}.launchpad.ai`}
          onEdit={() => setView('editor')}
        />
      </div>
    );
  }

  // Editor view
  return (
    <WorkspaceShell
      topBar={<WorkspaceTopBar projectName="Meetday" status="live" />}
      sidebar={<SectionSidebar active={activeSection} onSelect={setActiveSection} />}
      canvas={
        <PreviewCanvas url={`meetday-${id.slice(-4)}.launchpad.ai`}>
          <MockLandingPreview />
        </PreviewCanvas>
      }
      assistant={<AssistantPanel />}
    />
  );
}

function FlowHeader({ id }: { id: string }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="focus-ember -mx-1 px-1">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[11.5px] text-ink-faint hidden sm:inline mono">{id}</span>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="size-3.5" /> History
          </Link>
        </div>
      </div>
    </header>
  );
}
