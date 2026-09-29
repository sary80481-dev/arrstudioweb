import { ChevronDown, ChevronRight, KeyRound } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { LiveKitMenu, LiveStatsBand } from "./LiveHero";
import { Button, Container, LogoImage } from "./ui";

// posisi bara emas — deterministik agar markup server & client sama
const embers = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 3),
  delay: -((i * 1.7) % 14),
  duration: 12 + (i % 5) * 2,
}));

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* sorot cahaya dari atas */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(55% 45% at 50% 18%, var(--glow), transparent 70%)" }}
      />
      <div
        className="absolute left-1/2 top-0 h-[70%] w-[min(900px,120vw)] -translate-x-1/2 opacity-60"
        style={{
          background: "conic-gradient(from 180deg at 50% 0%, transparent 160deg, var(--glow) 180deg, transparent 200deg)",
        }}
      />

      {/* lantai arena berperspektif */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] [perspective:600px]">
        <div
          className="absolute inset-x-[-50%] bottom-0 h-[160%] origin-bottom [transform:rotateX(62deg)]"
          style={{
            backgroundImage:
              "linear-gradient(var(--line-strong) 1px, transparent 1px), linear-gradient(90deg, var(--line-strong) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to top, black 0%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 75%)",
          }}
        />
      </div>

      {/* bara emas naik */}
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-[-10px] rounded-full bg-gold"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            boxShadow: "0 0 8px var(--gold)",
            animation: `rise ${e.duration}s linear ${e.delay}s infinite`,
          }}
        />
      ))}

      {/* grain + vignette */}
      <div className="absolute inset-0 grain opacity-[0.06] mix-blend-overlay" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, var(--bg) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}

export default function Hero({ t }: SectionProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <Backdrop />

      <Container className="flex min-h-[100svh] flex-col items-center pb-10 pt-28 text-center md:pt-32">
        {/* logo */}
        <div className="relative animate-[float_7s_ease-in-out_infinite]">
          <div aria-hidden className="absolute inset-[15%] rounded-full blur-3xl" style={{ background: "var(--glow)" }} />
          <LogoImage
            size={320}
            eager
            className="relative h-auto w-[180px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] sm:w-[230px] md:w-[270px]"
          />
        </div>

        <p className="mt-4 flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.4em] text-gold">
          <span className="h-px w-10 hairline-gold" />
          {t.hero.eyebrow}
          <span className="h-px w-10 hairline-gold" />
        </p>

        <h1 className="mt-5 font-display text-[3.4rem] font-bold uppercase leading-[0.88] tracking-[-0.01em] text-fg sm:text-7xl md:text-8xl lg:text-[7.5rem]">
          {t.hero.titleA}
          <br />
          <span className="text-gold-metal">{t.hero.titleB}</span>
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted text-pretty md:text-lg">
          {t.hero.desc}
        </p>

        <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Button href="#kits" size="lg">
            {t.hero.ctaPrimary}
            <ChevronRight size={18} />
          </Button>
          <Button href="#license" variant="outline" size="lg">
            <KeyRound size={17} />
            {t.hero.ctaSecondary}
          </Button>
        </div>

        {/* ─── KIT SELECT — ala menu game ─── */}
        <nav aria-label="Kits" className="mt-auto w-full pt-16">
          <LiveKitMenu liveIn={t.hero.liveIn} comingSoon={t.kits.comingSoon} />

          <a href="#stats" aria-label="Scroll down" className="mx-auto mt-6 flex w-fit flex-col items-center gap-1 text-dim transition-colors hover:text-gold">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em]">{t.hero.scroll}</span>
            <ChevronDown size={16} className="animate-bounce" />
          </a>
        </nav>
      </Container>

      {/* ─── STATS BAND (realtime) ─── */}
      <LiveStatsBand labels={t.stats} />
    </section>
  );
}
