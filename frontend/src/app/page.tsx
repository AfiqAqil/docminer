import { FeatureSections } from "@/components/landing/feature-sections";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="perspective-grid" aria-hidden="true" />

      <div className="relative z-10">
        <HeroSection />
        <FeatureSections />
        <Footer />
      </div>
    </div>
  );
}
