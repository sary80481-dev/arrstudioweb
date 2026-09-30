"use client";

import { useState } from "react";
import { Check, ChevronDown, PackageOpen, Star } from "lucide-react";
import { BuyButton } from "@/components/checkout/BuyButton";
import { KitIcon } from "@/components/common/KitIcon";
import { KitVideoPlayer } from "@/components/video/KitVideoPlayer";
import { fmt, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatIDR, type Kit } from "@/lib/kits";
import { selectKits, useAppSelector } from "@/lib/store/store";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading, buttonClass } from "./ui";

/** Katalog kit sebagai tile produk: nama besar, dua aksi, lalu visual */
export default function Marketplace({ t, lang }: { t: Dictionary["kits"]; lang: Locale }) {
  // katalog dari Redux — diperbarui realtime oleh PublicSync saat /admin mengubah kit
  const kits = useAppSelector(selectKits);

  return (
    <Section id="kits">
      <SectionHeading label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleB} {t.titleGold}</Muted></>} desc={t.desc} />

      {kits.length === 0 ? (
        <div className="flex flex-col items-center rounded-[28px] bg-surface-2 px-6 py-24 text-center">
          <PackageOpen size={30} strokeWidth={1.5} className="text-dim" />
          <p className="mt-4 text-lg text-muted">{t.empty}</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {kits.map((kit, i) => {
            // jumlah ganjil → kit pertama jadi tile lebar (unggulan), sisanya berpasangan
            const wide = kits.length % 2 === 1 && i === 0;
            return (
              <Reveal key={kit.id} delay={i * 90} className={`h-full ${wide ? "lg:col-span-2" : ""}`}>
                <KitTile kit={kit} t={t} lang={lang} wide={wide} />
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function KitTile({ kit, t, lang, wide }: { kit: Kit; t: Dictionary["kits"]; lang: Locale; wide: boolean }) {
  const [open, setOpen] = useState(false);
  const soon = kit.status === "coming_soon";
  const media = `aspect-[16/10] rounded-[20px] ${wide ? "md:aspect-[21/9]" : ""}`;

  return (
    <article id={`kit-${kit.id}`} className="group/tile flex h-full scroll-mt-20 flex-col overflow-hidden rounded-[28px] bg-surface-2 text-center">
      <div className="px-6 pt-12 md:pt-14">
        <p className="text-[15px] font-semibold text-gold">{soon ? t.comingSoon : kit.tag}</p>
        <h3 className="text-display mt-2 text-5xl text-fg md:text-6xl">{kit.name}</h3>
        {kit.tagline && <p className="mt-3 text-xl text-muted md:text-2xl">{kit.tagline}</p>}

        <p className="mt-4 text-sm text-dim">
          {formatIDR(kit.price)} · {t.oneTime}
          {kit.rating != null && (
            <span className="ml-2 inline-flex items-center gap-1">
              · <Star size={12} className="fill-gold text-gold" /> {kit.rating.toFixed(1)}
            </span>
          )}
          {!soon && kit.stats.activePlaces > 0 && <> · {fmt(t.liveIn, { n: kit.stats.activePlaces })}</>}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {soon ? (
            <span className={buttonClass("outline", "md", "pointer-events-none")}>{t.comingSoon}</span>
          ) : (
            <BuyButton item={{ type: "kit", kitId: kit.id }} returnTo={`/${lang}#kit-${kit.id}`} className={buttonClass("gold", "md")}>
              {fmt(t.get, { name: kit.name.split(" ")[0] })}
            </BuyButton>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={`kit-${kit.id}-details`}
            className="inline-flex items-center gap-1 text-[17px] text-gold hover:underline hover:underline-offset-4"
          >
            {t.learnMore}
            <ChevronDown size={17} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── DETAIL: fitur, integrasi, lokasi key ─── */}
      <div
        id={`kit-${kit.id}-details`}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto max-w-xl px-6 pt-8 text-left">
            <p className="text-[15px] leading-relaxed text-muted">{kit.description}</p>
            <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {kit.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px] text-fg">
                  <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-gold" /> {f}
                </li>
              ))}
            </ul>
            {kit.integrations.length > 0 && (
              <p className="mt-5 text-sm text-dim">
                {t.plugsInto} {kit.integrations.join(" · ")}
              </p>
            )}
            <p className="mt-1.5 text-sm text-dim">
              {t.licenseGoesIn} <code className="font-mono text-fg">{kit.configPath}</code>
            </p>
          </div>
        </div>
      </div>

      {/* ─── VISUAL ─── */}
      <div className="mt-auto p-3 pt-10 md:p-4 md:pt-12">
        {kit.video ? (
          <KitVideoPlayer video={kit.video} title={kit.name} mode="hover" className={media} />
        ) : (
          // belum ada video: ikon kit "dipanggungkan" — sorot dari atas, pantulan di lantai
          <div data-theme="dark" className={`relative isolate flex items-center justify-center overflow-hidden bg-black ${media}`}>
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "radial-gradient(40% 75% at 50% 0%, rgb(255 236 190 / 0.2), transparent 70%)" }}
            />
            <div
              aria-hidden
              className="absolute bottom-[14%] left-1/2 -z-10 h-10 w-1/2 -translate-x-1/2 rounded-[100%] blur-2xl"
              style={{ background: "rgb(232 191 98 / 0.28)" }}
            />
            <KitIcon
              icon={kit.icon}
              size={112}
              strokeWidth={1}
              className="text-[#e8bf62] drop-shadow-[0_20px_40px_rgba(232,191,98,0.35)] transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/tile:scale-110"
            />
            <span aria-hidden className="absolute bottom-3 left-1/2 -translate-x-1/2 select-none text-[11px] uppercase tracking-[0.3em] text-white/30">
              {kit.name}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
