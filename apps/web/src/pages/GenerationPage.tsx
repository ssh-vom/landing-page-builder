import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StageProgress } from '@/components/flow/StageProgress';
import { ResultDisplay } from '@/components/flow/ResultDisplay';
import { Logo } from '@/components/ui/Logo';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { WorkspaceTopBar } from '@/components/workspace/WorkspaceTopBar';
import { SectionSidebar } from '@/components/workspace/SectionSidebar';
import { PreviewCanvas } from '@/components/workspace/PreviewCanvas';
import { MockLandingPreview } from '@/components/workspace/MockLandingPreview';
import { type ApiGeneration, displayUrl, generationUrl, getGeneration, regenerateGeneration, stagesFromGeneration } from '@/lib/api';

type View = 'progress' | 'result' | 'editor';

export default function GenerationPage() {
  const { id = '' } = useParams();
  const [view, setView] = useState<View>('progress');
  const [generation, setGeneration] = useState<ApiGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const next = await getGeneration(id);
    setGeneration(next);
    if (next.status === 'complete') setView((current) => current === 'progress' ? 'result' : current);
    if (next.status === 'failed') setView('progress');
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const next = await getGeneration(id);
        if (cancelled) return;
        setGeneration(next);
        if (next.status === 'complete') setView((current) => current === 'progress' ? 'result' : current);
        if (next.status === 'failed') setView('progress');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load generation');
      }
    }
    tick();
    const interval = setInterval(tick, generation?.status === 'in_progress' || !generation ? 2000 : 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id, generation?.status]);

  const handleRegenerate = useCallback(async (prompt: string) => {
    if (!id) return;
    setIsRegenerating(true);
    setError(null);
    try {
      await regenerateGeneration(id, prompt);
      setView('progress');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  }, [id]);

  const prompt = generation?.prompt ?? 'Loading generation…';
  const liveUrl = generationUrl(generation);
  const displayLiveUrl = liveUrl ? displayUrl(liveUrl) : 'Deployment pending';
  const projectName = generation?.cloudflare_project_name ?? generation?.copy?.hero_headline ?? 'Generated page';
  const workspaceStatus = generation?.status === 'complete' ? 'live' : generation?.status === 'failed' ? 'draft' : 'building';

  if (view === 'progress') {
    return (
      <div className="bg-white text-ink min-h-screen">
        <FlowHeader id={id} />
        {error || generation?.error_message ? (
          <div className="mx-auto max-w-[760px] px-6 pt-8 text-sm text-red-600">{error ?? generation?.error_message}</div>
        ) : null}
        <StageProgress stages={stagesFromGeneration(generation)} prompt={prompt} />
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="bg-white text-ink min-h-screen">
        <FlowHeader id={id} />
        <ResultDisplay
          url={liveUrl}
          displayUrl={displayLiveUrl}
          cloudflareProject={generation?.cloudflare_project_name ?? '—'}
          onEdit={() => setView('editor')}
        />
      </div>
    );
  }

  return (
    <WorkspaceShell
      topBar={<WorkspaceTopBar projectName={projectName} status={workspaceStatus} />}
      sidebar={
        <SectionSidebar
          active={activeSection}
          onSelect={setActiveSection}
          onRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
        />
      }
      canvas={
        <PreviewCanvas url={displayLiveUrl}>
          {liveUrl ? (
            <iframe title="Generated landing page" src={liveUrl} className="w-full h-[760px] border-0 bg-white" />
          ) : (
            <MockLandingPreview />
          )}
        </PreviewCanvas>
      }
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
