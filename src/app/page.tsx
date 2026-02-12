import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCards } from '@/components/home/FeatureCards';
import { TrustIndicators } from '@/components/home/TrustIndicators';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <TrustIndicators />
    </>
  );
}
