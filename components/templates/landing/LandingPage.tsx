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
import PublicSync from "./_components/PublicSync";

export default function LandingPage(props: SectionProps) {
  return (
    // data server jadi state awal Redux; PublicSync lalu menyambung onSnapshot
    <StoreProvider preloaded={{ catalog: { kits: props.kits, live: false }, stats: props.stats, pricing: props.pricing }}>
      <PublicSync />
      <Navbar lang={props.lang} t={props.t.nav} />
      <main>
        <Hero {...props} />
        <Marketplace t={props.t.kits} />
        <License {...props} />
        <HowItWorks {...props} />
        <Studio {...props} />
        <Services t={props.t.services} />
        <Testimonials {...props} />
        <Pricing t={props.t.pricing} />
        <FAQ {...props} />
        <CTAFinal {...props} />
      </main>
      <Footer {...props} />
    </StoreProvider>
  );
}
