import { HeroSection } from '@/components/home/HeroSection';
import { SituationCards } from '@/components/home/SituationCards';
import { FeatureCards } from '@/components/home/FeatureCards';
import { ProcessSteps } from '@/components/home/ProcessSteps';
import { CtaBanner } from '@/components/home/CtaBanner';
import { TrustIndicators } from '@/components/home/TrustIndicators';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SituationCards />
      <FeatureCards />
      <ProcessSteps />
      <CtaBanner />
      <TrustIndicators />
    </>
  );
}
