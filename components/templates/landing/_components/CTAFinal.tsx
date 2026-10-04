import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Reveal } from "./Motion";
import { Container, LogoImage, buttonClass } from "./ui";

/**
 * Penutup: blok kuning besar berbingkai stiker. Selalu memakai token terang
 * (teks ink di atas kuning) di kedua tema.
 */
export default function CTAFinal({ t: { cta: t } }: SectionProps) {
  return (
    <section className="bg-bg pb-20 md:pb-28">
      <Container>
        <Reveal>
          <div
            data-theme="light"
            className="pop-lg bg-dots relative isolate overflow-hidden rounded-panel bg-brand px-6 py-16 text-center text-fg sm:px-12 md:py-24"
          >
            <span aria-hidden className="absolute -left-16 -top-16 -z-10 h-56 w-56 rounded-full border-2 border-ink bg-brand-hover" />

            <span className="pop mx-auto mb-8 flex h-20 w-20 animate-[bob_5s_ease-in-out_infinite] items-center justify-center rounded-3xl bg-[#241a0b]">
              <LogoImage size={56} className="h-14 w-14 object-contain" />
            </span>
            <h2 className="t-hero mx-auto max-w-3xl text-fg">
              {t.titleA} {t.titleGold}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg font-semibold leading-relaxed text-fg/80 md:text-xl">{t.desc}</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className={buttonClass("ink", "lg")}>
                {t.primary}
                <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
              <a href="#kits" className={buttonClass("outline", "lg")}>
                {t.secondary}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
