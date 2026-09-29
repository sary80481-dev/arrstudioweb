import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Reveal } from "./Motion";
import { Container, LogoImage } from "./ui";

/** Banner emas penuh ala halaman esports — satu blok tegas sebelum footer */
export default function CTAFinal({ t: { cta: t } }: SectionProps) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gold-grad px-6 py-14 text-on-gold sm:px-12 md:py-20 lg:px-16">
            {/* tekstur */}
            <div aria-hidden className="absolute inset-0 -z-10 grain opacity-[0.12] mix-blend-multiply" />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-25"
              style={{ backgroundImage: "repeating-linear-gradient(135deg, rgb(0 0 0 / 0.12) 0 1px, transparent 1px 18px)" }}
            />
            <LogoImage
              size={420}
              className="pointer-events-none absolute -bottom-16 -right-16 -z-10 h-auto w-72 rotate-12 opacity-25 mix-blend-multiply md:w-[26rem]"
            />

            <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="font-display text-5xl font-bold uppercase leading-[0.88] sm:text-6xl md:text-8xl">
                  {t.titleA}
                  <br />
                  <span className="opacity-70">{t.titleGold}</span>
                </h2>
                <p className="mt-6 max-w-lg text-base font-medium opacity-80 md:text-lg">{t.desc}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                {/* tombol gelap khusus — kontras di atas blok emas, di kedua tema */}
                <Link
                  href="/register"
                  className="group inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-[#17120a] px-8 font-display text-base font-semibold uppercase tracking-[0.14em] text-[#f6dd9a] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {t.primary}
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#kits"
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-on-gold/30 px-8 font-display text-base font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-on-gold/10"
                >
                  {t.secondary}
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
