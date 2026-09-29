import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Container, LogoImage } from "./ui";

/**
 * Hero — panggung gelap di kedua tema (data-theme="dark" memakai token gelap
 * hanya di section ini). Logo merek jadi key visual, lalu rel tiga lini bisnis.
 */
export default function Hero({ t, kits }: SectionProps) {
  const rail = [
    {
      href: "#kits",
      label: t.nav.kits,
      detail: kits.length ? kits.map((k) => k.name).join(" · ") : t.hero.eyebrow,
    },
    { href: "#studio", label: t.nav.studio, detail: "ARRR Studio · HTML → Roblox" },
    // cukup dua layanan ujung supaya muat satu baris
    { href: "#services", label: t.nav.services, detail: [t.services.offers[0]?.title, t.services.offers[2]?.title].filter(Boolean).join(" · ") },
  ];

  return (
    <section data-theme="dark" className="relative isolate flex min-h-[min(100svh,980px)] flex-col overflow-hidden bg-bg text-fg">
      {/* satu sumber cahaya hangat di belakang logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(40% 55% at 75% 45%, rgb(226 184 87 / 0.14), transparent 70%)" }}
      />

      {/* ─── COPY + KEY VISUAL: satu grid, tepi sejajar dengan navbar ─── */}
      <Container className="grid flex-1 items-center gap-10 pb-12 pt-28 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16 lg:pb-16">
        {/* animasi masuk pakai CSS murni (bukan <Reveal>) — hero di atas lipatan tidak boleh
            menunggu JavaScript untuk tampil, kalau tidak LCP di HP jadi lambat */}
        <div className="order-2 animate-[pagein_0.7s_ease-out_both] lg:order-1">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.35em] text-gold">{t.hero.eyebrow}</p>

          <h1 className="mt-5 font-display text-[3rem] font-bold uppercase leading-[0.9] tracking-[-0.01em] text-balance sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            {t.hero.titleA} <span className="text-gold">{t.hero.titleB}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">{t.hero.desc}</p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#kits"
              className="group inline-flex h-14 items-center gap-3 bg-gold px-8 font-display text-base font-bold uppercase tracking-[0.16em] text-on-gold transition-colors hover:bg-gold-hover"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#license"
              className="font-display text-base font-semibold uppercase tracking-[0.16em] text-fg underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="order-1 flex animate-[pagein_0.9s_ease-out_both] justify-center lg:order-2 lg:justify-end">
          <LogoImage
            size={460}
            eager
            className="h-auto w-[58vw] max-w-[260px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] sm:max-w-[320px] lg:w-full lg:max-w-[460px]"
          />
        </div>
      </Container>

      {/* ─── REL: tiga lini bisnis ─── */}
      <nav aria-label="ArrStudio" className="border-t border-line">
        <Container>
          <ul className="grid md:grid-cols-3">
            {rail.map((r, i) => (
              <li key={r.href} className={i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}>
                <a href={r.href} className={`group relative flex items-center gap-5 py-6 ${i === 0 ? "md:pr-6" : "md:px-6"}`}>
                  {/* garis emas yang mengisi dari kiri saat hover */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-[-1px] h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <span className="font-display text-sm font-semibold text-dim">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-2xl font-bold uppercase tracking-wide transition-colors group-hover:text-gold">
                      {r.label}
                    </span>
                    <span className="block truncate text-sm text-muted">{r.detail}</span>
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="shrink-0 text-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </section>
  );
}
