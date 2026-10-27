import { AppPreview } from "@/components/landing/sections/app-preview";
import { ArtisansSection } from "@/components/landing/sections/artisans-section";
import { ClosingSection } from "@/components/landing/sections/closing-section";
import { FaqSection } from "@/components/landing/sections/faq-section";
import { Hero } from "@/components/landing/sections/hero";
import { LandingHeader } from "@/components/landing/sections/landing-header";
import { HowItWorks } from "@/components/landing/sections/how-it-works";
import { ProofSection } from "@/components/landing/sections/proof-section";
import { TradesSection } from "@/components/landing/sections/trades-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { WRAP } from "@/components/landing/styles";

/** Marketing landing page that tells the ajudar story from problem to payday. */
export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="overflow-x-clip">
        <Hero />
        <AppPreview />
        <TradesSection />
        <HowItWorks />
        <ProofSection />
        <ArtisansSection />
        <FaqSection />
        <ClosingSection />
        <SiteFooter wrap={WRAP} />
      </main>
    </>
  );
}
