import Link from "next/link";
import type { SectionProps } from "@/components/type/landing";
import { KitVideoPlayer } from "@/components/video/KitVideoPlayer";
import { Reveal } from "./Motion";
import { Container, buttonClass } from "./ui";

/**
 * Penutup sinematik selebar layar (selalu gelap). Video kit diredupkan jadi
 * latar; tanpa video cukup satu cahaya hangat dari bawah.
 */
export default function CTAFinal({ t: { cta: t }, kits }: SectionProps) {
  const reel = kits.find((k) => k.video);

  return (
    <section data-theme="dark" className="relative isolate overflow-hidden bg-black text-fg">
      {reel?.video ? (
        <KitVideoPlayer
          video={reel.video}
          title={reel.name}
          mode="view"
          expandable={false}
          className="absolute! inset-0 -z-20 bg-black opacity-50"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-20"
          style={{ background: "radial-gradient(50% 70% at 50% 120%, rgb(232 191 98 / 0.28), transparent 70%)" }}
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-black/40" />

      <Container className="py-32 text-center md:py-48">
        <Reveal>
          <h2 className="text-hero mx-auto max-w-4xl text-5xl text-white sm:text-7xl md:text-[6rem]">
            {t.titleA} <span className="text-white/45">{t.titleGold}</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">{t.desc}</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className={buttonClass("gold", "lg")}>
              {t.primary}
            </Link>
            <a href="#kits" className={buttonClass("light", "lg")}>
              {t.secondary}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
