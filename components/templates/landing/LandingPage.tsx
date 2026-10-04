import type { SectionProps } from "@/components/type/landing";
import StoreProvider from "@/lib/store/StoreProvider";
import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import Ribbon from "./_components/Ribbon";
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
import SmoothScroll from "@/components/common/SmoothScroll";
import { BackToTop, ScrollProgress } from "./_components/Motion";

/*
  Alur halaman: kenalan (Hero) → pilih kit → cara pasang → cara kerja lisensi →
  produk & jasa lain → bukti sosial → harga → tanya-jawab → ajakan akhir.
  Latar bergantian plain / tile / dark agar tiap bagian jelas batasnya.
*/
export default function LandingPage(props: SectionProps) {
  return (
    // data server jadi state Redux; halaman statis (ISR) — /admin membuangnya dari cache saat kit/harga berubah
    <StoreProvider preloaded={{ catalog: { kits: props.kits, live: false }, stats: props.stats, pricing: props.pricing }}>
      <SmoothScroll />
      <ScrollProgress />
      <Navbar lang={props.lang} t={props.t.nav} />
      <main>
        <Hero t={props.t} stats={props.stats} />
        <Ribbon kits={props.kits} />
        <Marketplace t={props.t.kits} lang={props.lang} />
        <HowItWorks {...props} />
        <License {...props} />
        <Studio {...props} />
        <Services t={props.t.services} />
        <Testimonials t={props.t.testimonials} />
        <Pricing t={props.t.pricing} lang={props.lang} />
        <FAQ {...props} />
        <CTAFinal {...props} />
      </main>
      <Footer {...props} />
      <BackToTop />
    </StoreProvider>
  );
}
