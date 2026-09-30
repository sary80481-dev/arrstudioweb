"use client";

import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import type { SectionProps } from "@/components/type/landing";
import { KitVideoPlayer, VideoLightbox } from "@/components/video/KitVideoPlayer";
import { selectKits, useAppSelector } from "@/lib/store/store";
import { Container, LogoImage, buttonClass } from "./ui";

/**
 * Hero sinematik setinggi layar (selalu gelap):
 * - ada video kit → video penuh di belakang, judul raksasa di kiri bawah,
 *   pemilih kit di kanan bawah (seperti pemilih model di situs mobil sport)
 * - belum ada video → logo "diungkap" oleh sorot cahaya dari atas + pantulan lantai
 */
export default function Hero({ t, stats }: Pick<SectionProps, "t" | "stats">) {
  // realtime dari Redux: video baru dari admin langsung tampil
  const kits = useAppSelector(selectKits);
  // maks. 5 di pemilih hero — katalog lengkap ada di section Kits
  const reel = kits.filter((k) => k.video).slice(0, 5);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const active = reel.find((k) => k.id === activeId) ?? reel[0];

  return (
    <section data-theme="dark" className="relative isolate h-[100svh] min-h-[620px] max-h-[1100px] overflow-hidden bg-black text-fg">
      {/* ─── LATAR ─── */}
      {active?.video ? (
        <KitVideoPlayer
          key={active.video.url}
          video={active.video}
          title={active.name}
          mode="view"
          expandable={false}
          className="absolute! inset-0 -z-20 animate-[kenburns_2.4s_cubic-bezier(0.2,0.7,0.2,1)_both] bg-black"
        />
      ) : (
        // HP: logo di atas judul · desktop: logo di kanan, judul di kiri — tidak pernah bertumpuk
        <div aria-hidden className="absolute inset-0 -z-20 flex justify-center lg:items-center lg:justify-end lg:pr-[max(2rem,calc((100vw-1200px)/2+2rem))]">
          <div
            className="absolute inset-0 hidden lg:block"
            style={{ background: "radial-gradient(28% 60% at 76% 0%, rgb(255 236 190 / 0.22), transparent 70%)" }}
          />
          <div
            className="absolute inset-0 lg:hidden"
            style={{ background: "radial-gradient(60% 45% at 50% 0%, rgb(255 236 190 / 0.22), transparent 70%)" }}
          />
          <div className="relative mt-[12svh] w-[min(50vw,300px)] animate-[pagein_1.4s_ease-out_both] lg:mt-0 lg:w-[min(32vw,440px)] lg:-translate-y-[12%]">
            <LogoImage size={420} eager className="relative h-auto w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]" />
            {/* pantulan di "lantai" */}
            <LogoImage
              size={420}
              className="absolute left-0 top-full h-auto w-full -scale-y-100 opacity-[0.12] [mask-image:linear-gradient(to_bottom,black,transparent_45%)]"
            />
          </div>
        </div>
      )}

      {/* teks selalu terbaca di atas video apa pun */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-2/3 bg-gradient-to-r from-black/60 to-transparent" />

      {/* ─── KONTEN ─── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <Container className="grid items-end gap-10 pb-12 md:pb-16 lg:grid-cols-[1fr_auto]">
          <div className="animate-[pagein_0.9s_ease-out_0.2s_both]">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-gold">{t.hero.eyebrow}</p>
            <h1 className={`text-hero mt-5 text-[2.75rem] text-white sm:text-7xl ${active?.video ? "max-w-5xl lg:text-[7rem]" : "max-w-3xl lg:text-[5.75rem]"}`}>
              {t.hero.titleA} <span className="text-white/45">{t.hero.titleB}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">{t.hero.desc}</p>

            <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-3">
              <a href="#kits" className={buttonClass("gold", "lg")}>
                {t.hero.ctaPrimary}
                <ArrowRight size={17} className="transition-transform group-hover/btn:translate-x-0.5" />
              </a>
              {active?.video ? (
                <button type="button" onClick={() => setWatching(true)} className={buttonClass("light", "lg")}>
                  <Play size={15} className="fill-current" /> {active.name}
                </button>
              ) : (
                <a href="#license" className={buttonClass("light", "lg")}>
                  {t.hero.ctaSecondary}
                </a>
              )}
            </div>

            {stats.placesActive > 0 && (
              <p className="mt-7 flex items-center gap-2 text-sm text-white/55">
                <span className="h-1.5 w-1.5 animate-[pulse-dot_1.6s_ease-out_infinite] rounded-full bg-green" />
                {fmt(t.hero.liveIn, { n: stats.placesActive.toLocaleString() })}
              </p>
            )}
          </div>

          {/* ─── PEMILIH KIT ─── */}
          {reel.length > 1 && (
            <ul className="pointer-events-auto flex gap-6 lg:flex-col lg:items-end lg:gap-3" aria-label="Kits">
              {reel.map((k, i) => {
                const on = k.id === active?.id;
                return (
                  <li key={k.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActiveId(k.id)}
                      className={`flex items-baseline gap-3 text-left transition-colors ${on ? "text-white" : "text-white/40 hover:text-white/75"}`}
                    >
                      <span className="font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-lg font-semibold tracking-[-0.02em] md:text-2xl">{k.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </div>

      {watching && active?.video && <VideoLightbox video={active.video} title={active.name} onClose={() => setWatching(false)} />}
    </section>
  );
}
