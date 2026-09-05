import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/features/landing/hero";
import { FeaturesSection } from "@/features/landing/features-section";
import { PreviewShowcase } from "@/features/landing/preview-showcase";
import { CtaSection } from "@/features/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturesSection />
        <PreviewShowcase />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
