import type { SectionProps } from "@/components/type/landing";
import StoreProvider from "@/lib/store/StoreProvider";
import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import Marketplace from "./_components/Marketplace";
import License from "./_components/License";
import HowItWorks from "./_components/HowItWorks";
import Services from "./_components/Services";
import Studio from "./_components/Studio";
import Testimonials from "./_components/Testimonials";
import Pricing from "./_components/Pricing";
import FAQ from "./_components/FAQ";
import CTAFinal from "./_components/CTAFinal";
import Footer from "./_components/Footer";

export default function LandingPage(props: SectionProps) {
  return (
    // data server jadi state Redux; halaman statis (ISR) — /admin membuangnya dari cache saat kit/harga berubah
    <StoreProvider preloaded={{ catalog: { kits: props.kits, live: false }, stats: props.stats, pricing: props.pricing }}>
      <Navbar lang={props.lang} t={props.t.nav} />
      <main>
        <Hero t={props.t} stats={props.stats} />
        <Marketplace t={props.t.kits} lang={props.lang} />
        <License {...props} />
        <HowItWorks {...props} />
        <Studio {...props} />
        <Services t={props.t.services} />
        <Testimonials t={props.t.testimonials} />
        <Pricing t={props.t.pricing} lang={props.lang} />
        <FAQ {...props} />
        <CTAFinal {...props} />
      </main>
      <Footer {...props} />
    </StoreProvider>
  );
}
