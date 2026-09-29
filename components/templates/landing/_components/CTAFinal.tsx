import { ChevronRight } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Button, Container, LogoImage } from "./ui";

export default function CTAFinal({ t: { cta: t } }: SectionProps) {
  return (
    <section className="relative isolate overflow-hidden border-t border-line py-28 md:py-40">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: "radial-gradient(50% 60% at 50% 50%, var(--glow), transparent 70%)" }} />
        <div className="absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
        <div className="absolute inset-x-0 top-0 h-px hairline-gold opacity-60" />
      </div>

      <Container className="flex flex-col items-center text-center">
        <LogoImage size={160} className="h-auto w-28 md:w-36" />
        <h2 className="mt-8 font-display text-5xl font-bold uppercase leading-[0.9] text-fg md:text-8xl">
          {t.titleA}
          <br />
          <span className="text-gold-metal">{t.titleGold}</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted">{t.desc}</p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Button href="/register" size="lg">
            {t.primary}
            <ChevronRight size={18} />
          </Button>
          <Button href="#kits" variant="outline" size="lg">
            {t.secondary}
          </Button>
        </div>
      </Container>
    </section>
  );
}
