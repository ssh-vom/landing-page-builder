import { MarketingNav } from '@/components/marketing/MarketingNav';
import { Hero } from '@/components/marketing/Hero';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { ProcessTimeline } from '@/components/marketing/ProcessTimeline';
import { FinalCTA } from '@/components/marketing/FinalCTA';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function MarketingPage() {
  return (
    <div className="bg-white text-ink min-h-screen">
      <MarketingNav />
      <main>
        <Hero />
        <FeatureGrid />
        <ProcessTimeline />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
