"use client";

import type { CSSProperties } from "react";
import { ArrowRight, KeyRound, MapPin, Star, Zap } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import type { SectionProps } from "@/components/type/landing";
import { selectKits, useAppSelector } from "@/lib/store/store";
import HeroStage from "./HeroStage";
import { CountUp, Reveal } from "./Motion";
import { Container, buttonClass } from "./ui";

/** Waktu cek lisensi rata-rata (detik) — sama dengan angka di section License */
const CHECK_SECONDS = 0.21;

/* ─── HIASAN ─── */

/** Panah coretan tangan dari teks menuju panggung */
function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 70" fill="none" className={className}>
      <path
        d="M4 52c18-30 40-36 52-22 10 12-6 24-12 12-6-12 18-30 66-24"
        stroke="var(--fg)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <path d="M100 10l12 8-13 6" stroke="var(--fg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── BENTO STATISTIK ─── */

/** Speedometer setengah lingkaran: kanan = cepat. Jarum berayun saat terlihat (CSS .needle). */
function Gauge({ seconds }: { seconds: number }) {
  const score = Math.max(0, Math.min(1, 1 - seconds)); // 0.21s → 0.79
  const len = Math.PI * 50; // panjang busur r=50
  return (
    <svg viewBox="0 0 120 68" className="w-full max-w-[260px]" aria-hidden>
      <path d="M10 62a50 50 0 0 1 100 0" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path
        d="M10 62a50 50 0 0 1 100 0"
        className="gauge-fill"
        stroke="var(--ink)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={len}
        style={{ "--len": len, "--off": len * (1 - score) } as CSSProperties}
      />
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const a = Math.PI * (1 - p);
        return <circle key={p} cx={60 + Math.cos(a) * 36} cy={62 - Math.sin(a) * 36} r="2" fill="var(--ink)" />;
      })}
      <line x1="60" y1="62" x2="60" y2="22" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" className="needle" style={{ "--to": `${-90 + 180 * score}deg` } as CSSProperties} />
      <circle cx="60" cy="62" r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
    </svg>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((s) => {
        const fill = Math.max(0, Math.min(1, value - s));
        return (
          <span key={s} className="relative h-5 w-5">
            <Star size={20} strokeWidth={2} className="absolute inset-0 text-fg/25" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={20} strokeWidth={2} className="fill-brand text-brand" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const tile = "group pop relative overflow-hidden rounded-card p-5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 sm:p-6";
const iconTile = "flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-ink shadow-[2px_2px_0_0_var(--ink)] transition-transform duration-300 group-hover:-rotate-12";

function StatsBento({ t, places, licenses, rating }: { t: SectionProps["t"]["stats"]; places: number; licenses: number; rating: number }) {
  const small = [
    places > 0 && { key: "places", Icon: MapPin, value: places, decimals: 0, unit: "", label: t.places, viz: "dots" as const },
    licenses > 0 && { key: "licenses", Icon: KeyRound, value: licenses, decimals: 0, unit: "", label: t.licenses, viz: "keys" as const },
    rating > 0 && { key: "rating", Icon: Star, value: rating, decimals: 1, unit: "/5", label: t.rating, viz: "stars" as const },
  ].filter((x): x is Exclude<typeof x, false> => !!x);

  // satu baris: kartu kecepatan lebih lebar (berisi speedometer), sisanya sama lebar
  const cols = ["", "lg:grid-cols-[1.6fr_1fr]", "lg:grid-cols-[1.6fr_1fr_1fr]", "lg:grid-cols-[1.6fr_1fr_1fr_1fr]"][small.length];

  return (
    <Reveal className={`mt-20 grid grid-cols-2 gap-4 sm:gap-5 md:mt-24 ${cols}`}>
      {/* kecepatan cek lisensi */}
      <div data-theme="light" className={`${tile} bg-dots col-span-2 flex items-center gap-5 bg-brand text-fg lg:col-span-1`}>
        <div className="min-w-0 flex-1">
          <span className={`${iconTile} bg-surface`}>
            <Zap size={20} strokeWidth={2.25} className="fill-current" />
          </span>
          <p className="t-stat mt-5">
            <CountUp value={CHECK_SECONDS} decimals={2} />
            <span className="text-2xl text-fg/60">s</span>
          </p>
          <p className="mt-2 text-sm font-bold text-fg/75">{t.check}</p>
        </div>
        <div className="w-[42%] max-w-[170px] shrink-0 self-end">
          <Gauge seconds={CHECK_SECONDS} />
        </div>
      </div>

      {small.map((s, i) => (
        <div
          key={s.key}
          className={`${tile} flex flex-col bg-surface text-fg ${small.length % 2 === 1 && i === small.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`${iconTile} bg-brand text-on-brand`}>
              <s.Icon size={20} strokeWidth={2.25} />
            </span>
            {s.viz === "stars" ? (
              <Stars value={s.value} />
            ) : (
              <span aria-hidden className="flex flex-wrap justify-end gap-1">
                {Array.from({ length: Math.min(6, Math.round(s.value)) }, (_, k) => (
                  <span
                    key={k}
                    className={`h-2.5 w-2.5 border-2 border-ink transition-transform duration-300 group-hover:-translate-y-0.5 ${s.viz === "dots" ? "rounded-full" : "rounded-[3px]"} ${k === 0 ? "bg-brand" : "bg-surface-2"}`}
                    style={{ transitionDelay: `${k * 40}ms` }}
                  />
                ))}
              </span>
            )}
          </div>
          <p className="t-stat mt-5">
            <CountUp value={s.value} decimals={s.decimals} />
            {s.unit && <span className="ml-0.5 text-xl text-dim">{s.unit}</span>}
          </p>
          <p className="mt-2 text-sm font-bold text-muted">{s.label}</p>
        </div>
      ))}
    </Reveal>
  );
}

/**
 * Hero dua kolom + bento statistik:
 * - kiri : stiker eyebrow, judul berstabilo, CTA
 * - kanan: <HeroStage> — kartu kit interaktif + gelembung integrasi + parallax
 * - bawah: baris statistik (speedometer, titik place, key, bintang)
 */
export default function Hero({ t, stats }: Pick<SectionProps, "t" | "stats">) {
  // realtime dari Redux: video baru dari admin langsung tampil
  const kits = useAppSelector(selectKits);

  // rata-rata rating kit yang punya rating
  const rated = kits.filter((k) => k.rating != null);
  const rating = rated.length ? rated.reduce((s, k) => s + (k.rating ?? 0), 0) / rated.length : 0;

  return (
    <section className="bg-dots relative overflow-hidden bg-bg pb-16 pt-28 md:pb-20 md:pt-36">
      {/* hiasan latar */}

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* ─── TEKS ─── */}
          <div className="relative animate-[pagein_0.7s_ease-out_both] text-center lg:text-left">
            <p className="pop-sm inline-flex -rotate-2 items-center gap-2 rounded-full bg-surface px-4 py-1.5 font-display text-sm font-semibold text-fg">
              <span className="h-2 w-2 rounded-full bg-brand ring-2 ring-ink" />
              {t.hero.eyebrow}
            </p>
            <h1 className="t-hero mx-auto mt-6 max-w-2xl text-fg lg:mx-0">
              {t.hero.titleA}{" "}
              <span className="marker">{t.hero.titleB}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">{t.hero.desc}</p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <a href="#kits" className={buttonClass("gold", "lg")}>
                {t.hero.ctaPrimary}
                <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover/btn:translate-x-1" />
              </a>
              <a href="#license" className={buttonClass("outline", "lg")}>
                {t.hero.ctaSecondary}
              </a>
            </div>

            {stats.placesActive > 0 && (
              <p className="pop mt-8 inline-flex -rotate-1 items-center gap-2.5 rounded-card bg-surface px-3.5 py-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-green opacity-60" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-green" />
                </span>
                <span className="rounded-full border-2 border-ink bg-brand px-2 py-0.5 font-display text-[11px] font-bold text-on-brand">LIVE</span>
                <span className="text-sm font-bold text-fg">{fmt(t.hero.liveIn, { n: stats.placesActive.toLocaleString() })}</span>
              </p>
            )}

            <Squiggle className="absolute -right-10 bottom-6 hidden w-28 xl:block" />
          </div>

          {/* ─── PANGGUNG: ilustrasi kartu kit interaktif (tanpa video) ─── */}
          <div className="relative animate-[rise-in_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both]">
            <HeroStage kits={kits} t={t.kits} />
          </div>
        </div>

        <StatsBento t={t.stats} places={stats.placesActive} licenses={stats.licensesIssued} rating={rating} />
      </Container>

    </section>
  );
}
