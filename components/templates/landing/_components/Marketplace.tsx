"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, PackageOpen, Search, Star, X } from "lucide-react";
import { BuyButton } from "@/components/checkout/BuyButton";
import { PromoCode, Price, type AppliedPromo } from "@/components/checkout/PromoCode";
import { KitIcon } from "@/components/common/KitIcon";
import { KitSlideshow } from "@/components/video/KitSlideshow";
import { KitVideoPlayer } from "@/components/video/KitVideoPlayer";
import { fmt, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Kit } from "@/lib/kits";
import { selectKits, useAppSelector } from "@/lib/store/store";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading, buttonClass } from "./ui";

type T = Dictionary["kits"];

/** Kartu yang tampil sebelum "Lihat semua" — dua baris di layar lebar */
const INITIAL = 8;
/** Pencarian & kategori baru muncul bila katalog cukup banyak untuk butuh itu */
const FILTER_FROM = 5;

/**
 * Katalog kit sebagai grid kartu ringkas (skala ke puluhan kit):
 * media + nama + harga di kartu, detail lengkap di dialog.
 */
export default function Marketplace({ t, lang }: { t: T; lang: Locale }) {
  // katalog dari Redux — dari render server; /admin membuang cache landing saat kit berubah
  const kits = useAppSelector(selectKits);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const tags = useMemo(() => [...new Set(kits.map((k) => k.tag).filter(Boolean))], [kits]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kits.filter(
      (k) =>
        (!tag || k.tag === tag) &&
        (!q || [k.name, k.tag, k.tagline, k.description, ...k.features].some((s) => s.toLowerCase().includes(q)))
    );
  }, [kits, query, tag]);

  const filtering = query.trim() !== "" || tag !== null;
  const visible = expanded || filtering ? filtered : filtered.slice(0, INITIAL);
  const open = kits.find((k) => k.id === openId) ?? null;

  // tutup → buang "#kit-…" dari URL supaya tidak terbuka lagi saat refresh
  const closeDialog = useCallback(() => {
    if (window.location.hash.startsWith("#kit-")) history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpenId(null);
  }, []);

  // link "#kit-<id>" (hero, footer) → buka detail kit itu
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.match(/^#kit-(.+)$/)?.[1];
      if (id && kits.some((k) => k.id === id)) setOpenId(id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [kits]);

  return (
    <Section id="kits">
      <SectionHeading index={1} label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleB} {t.titleGold}</Muted></>} desc={t.desc} />

      {kits.length === 0 ? (
        <div className="pop flex flex-col items-center rounded-card bg-surface px-6 py-20 text-center">
          <span className="pop-sm flex h-16 w-16 animate-[bob_4s_ease-in-out_infinite] items-center justify-center rounded-2xl bg-brand text-on-brand"><PackageOpen size={30} strokeWidth={2} /></span>
          <p className="mt-5 font-display text-xl font-medium text-muted">{t.empty}</p>
        </div>
      ) : (
        <>
          {kits.length >= FILTER_FROM && (
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div
                className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1.5 pr-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label={t.eyebrow}
              >
                {[null, ...tags].map((g) => (
                  <button
                    key={g ?? "all"}
                    type="button"
                    aria-pressed={tag === g}
                    onClick={() => setTag(g)}
                    className={`btn-pop my-1 shrink-0 rounded-full px-4 py-1.5 font-display text-sm font-semibold ${
                      tag === g ? "bg-brand text-on-brand" : "bg-surface text-fg"
                    }`}
                  >
                    {g ?? t.all}
                  </button>
                ))}
              </div>
              <label className="relative block md:w-72">
                <Search size={17} strokeWidth={2.25} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                  aria-label={t.search}
                  className="pop-sm h-11 w-full rounded-full bg-surface pl-11 pr-4 text-[15px] font-semibold text-fg placeholder:text-dim transition-shadow focus:shadow-[3px_3px_0_0_var(--brand)] focus:outline-none"
                />
              </label>
            </div>
          )}

          {visible.length === 0 ? (
            <p className="pop rounded-card bg-surface px-6 py-16 text-center font-display text-lg text-muted">{t.noResults}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((kit, i) => (
                <Reveal as="li" key={kit.id} delay={Math.min(i, 7) * 60} className="h-full">
                  <KitCard kit={kit} t={t} lang={lang} onOpen={() => setOpenId(kit.id)} />
                </Reveal>
              ))}
            </ul>
          )}

          {!filtering && filtered.length > INITIAL && (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setExpanded((e) => !e)} className={buttonClass("outline", "md")}>
                {expanded ? t.showLess : fmt(t.showAll, { n: filtered.length })}
                <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
        </>
      )}

      {open && <KitDialog kit={open} t={t} lang={lang} onClose={closeDialog} />}
    </Section>
  );
}

/* ─── KARTU RINGKAS ─── */
function KitCard({ kit, t, lang, onOpen }: { kit: Kit; t: T; lang: Locale; onOpen: () => void }) {
  const soon = kit.status === "coming_soon";
  const [promo, setPromo] = useState<AppliedPromo | null>(null);

  return (
    <article
      id={`kit-${kit.id}`}
      className="group/card pop pop-hover relative flex h-full scroll-mt-28 flex-col rounded-card bg-surface p-1.5 sm:rounded-card sm:p-2"
    >
      {/* tombol pembuka detail ada DI DALAM media, supaya hover tetap sampai ke pemutar video */}
      {kit.video ? (
        <KitVideoPlayer video={kit.video} title={kit.name} mode="hover" controls={false} expandable={false} className="aspect-[16/10] rounded-media border-2 border-ink sm:rounded-media [&_img]:transition-transform [&_img]:duration-500 group-hover/card:[&_img]:scale-105 [&_video]:transition-transform [&_video]:duration-500 group-hover/card:[&_video]:scale-105">
          <MediaOverlay label={`${t.learnMore}: ${kit.name}`} badge={soon ? t.comingSoon : null} onOpen={onOpen} />
        </KitVideoPlayer>
      ) : kit.gallery.length > 0 ? (
        <KitSlideshow photos={kit.gallery} title={kit.name} mode="hover" controls={false} className="aspect-[16/10] rounded-media border-2 border-ink sm:rounded-media [&_img]:transition-transform [&_img]:duration-500 group-hover/card:[&_img]:scale-105 [&_video]:transition-transform [&_video]:duration-500 group-hover/card:[&_video]:scale-105">
          <MediaOverlay label={`${t.learnMore}: ${kit.name}`} badge={soon ? t.comingSoon : null} onOpen={onOpen} />
        </KitSlideshow>
      ) : (
        <KitArt kit={kit} className="aspect-[16/10] rounded-media border-2 border-ink sm:rounded-media [&_img]:transition-transform [&_img]:duration-500 group-hover/card:[&_img]:scale-105 [&_video]:transition-transform [&_video]:duration-500 group-hover/card:[&_video]:scale-105">
          <MediaOverlay label={`${t.learnMore}: ${kit.name}`} badge={soon ? t.comingSoon : null} onOpen={onOpen} />
        </KitArt>
      )}

      <div className="flex flex-1 flex-col px-2 pb-1 pt-3 sm:px-2.5 sm:pb-1.5 sm:pt-4">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-[13px]">
          <span className="truncate rounded-full bg-gold-soft px-2 py-0.5 font-bold text-fg">{kit.tag}</span>
          {kit.rating != null && (
            <span className="flex shrink-0 items-center gap-1 font-bold text-fg">
              <Star size={13} strokeWidth={2.25} className="fill-brand text-ink" /> {kit.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="mt-2 truncate t-card text-fg">
          <button type="button" onClick={onOpen} className="max-w-full truncate text-left decoration-brand decoration-[3px] underline-offset-4 hover:underline">
            {kit.name}
          </button>
        </h3>
        {/* HP: kartu diringkas (2 kolom) — tagline & slot ada di dialog detail */}
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted max-sm:hidden">{kit.tagline || kit.description}</p>
        <p className="mt-2 text-xs font-semibold text-dim max-sm:hidden">{fmt(t.placesPerKey, { n: kit.placesPerLicense })}</p>

        {/* garis sobekan tiket + lekukan di kedua sisi */}
        <div aria-hidden className="relative -mx-3.5 mt-auto pt-3 sm:-mx-4.5 sm:pt-4">
          <span className="absolute -left-[11px] top-[calc(50%+6px)] h-5 w-5 -translate-y-1/2 rounded-full border-2 border-ink bg-bg [clip-path:inset(0_0_0_50%)] sm:top-[calc(50%+8px)]" />
          <span className="absolute -right-[11px] top-[calc(50%+6px)] h-5 w-5 -translate-y-1/2 rounded-full border-2 border-ink bg-bg [clip-path:inset(0_50%_0_0)] sm:top-[calc(50%+8px)]" />
          <span className="mx-4 block border-t-2 border-dashed border-line-strong sm:mx-5" />
        </div>

        <div className="pt-3 sm:pt-4">
          {soon ? (
            <span className="inline-flex rounded-full bg-surface-2 px-3 py-1 text-[13px] font-bold text-muted sm:text-sm">{t.comingSoon}</span>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <Price
                  price={kit.price}
                  applied={promo}
                  className="font-display text-base font-semibold text-fg tabular-nums sm:text-lg"
                  oldClassName="text-xs font-normal text-dim"
                />
                <BuyButton
                  item={{ type: "kit", kitId: kit.id }}
                  code={promo?.code}
                  returnTo={`/${lang}#kit-${kit.id}`}
                  className={buttonClass("gold", "sm", "max-sm:w-full")}
                  wrapperClassName="flex flex-col gap-1.5 sm:items-end"
                >
                  {t.buy}
                </BuyButton>
              </div>
              <PromoCode item={{ type: "kit", kitId: kit.id }} applied={promo} onChange={setPromo} className="mt-2.5" />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function MediaOverlay({ label, badge, onOpen }: { label: string; badge: string | null; onOpen: () => void }) {
  return (
    <>
      <button type="button" onClick={onOpen} aria-label={label} className="absolute inset-0 z-[5]" />
      {badge && (
        <span className="pop-sm pointer-events-none absolute left-2.5 top-2.5 z-10 -rotate-3 rounded-full bg-brand px-2.5 py-0.5 font-display text-xs font-semibold text-on-brand max-sm:hidden">
          {badge}
        </span>
      )}
    </>
  );
}

/** Kit tanpa video: ikon kit sebagai stiker di atas blok kuning bertitik */
function KitArt({ kit, className = "", children }: { kit: Kit; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`bg-dots relative isolate flex items-center justify-center overflow-hidden bg-brand ${className}`}>
      <span className="pop relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-fg transition-transform duration-300 group-hover/card:-rotate-6 group-hover/card:scale-110 sm:h-20 sm:w-20">
        <KitIcon icon={kit.icon} size={36} strokeWidth={1.9} />
      </span>
      {children}
    </div>
  );
}

/* ─── DIALOG DETAIL ─── */
function KitDialog({ kit, t, lang, onClose }: { kit: Kit; t: T; lang: Locale; onClose: () => void }) {
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const soon = kit.status === "coming_soon";

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose]);

  const facts = [
    kit.rating != null && {
      label: "Rating",
      value: (
        <span className="flex items-center gap-1.5">
          <Star size={14} strokeWidth={2.25} className="fill-brand text-ink" />
          {kit.rating.toFixed(1)}
          {kit.stats.activePlaces > 0 && <span className="font-semibold text-dim">· {fmt(t.liveIn, { n: kit.stats.activePlaces })}</span>}
        </span>
      ),
    },
    { label: "Version", value: <span className="font-mono">v{kit.version}</span> },
    { label: t.licenseGoesIn, value: <span className="break-all font-mono">{kit.configPath}</span> },
  ].filter((f) => f !== false);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-dialog-title"
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#241a0b]/60 animate-[pagein_0.2s_ease-out] sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-lg relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-panel bg-surface text-fg animate-[sheet-up_0.3s_cubic-bezier(0.2,0.7,0.2,1)] max-sm:border-b-0 sm:animate-[rise-in_0.45s_cubic-bezier(0.34,1.56,0.64,1)] sm:rounded-panel"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn-pop absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdf7] text-[#241a0b] hover:rotate-90 sm:right-6 sm:top-6 lg:right-6 lg:top-6"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* ─── ISI (scroll): kiri media + detail (menempel), kanan teks ─── */}
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid lg:grid-cols-[1.1fr_1fr] lg:items-start">
            {/* kiri */}
            <div className="space-y-4 p-3 sm:p-4 lg:sticky lg:top-0 lg:p-6 lg:pr-3">
              {kit.video ? (
                <KitVideoPlayer video={kit.video} title={kit.name} mode="view" className="aspect-video overflow-hidden rounded-card border-2 border-ink" />
              ) : kit.gallery.length > 0 ? (
                <KitSlideshow photos={kit.gallery} title={kit.name} mode="view" className="aspect-video overflow-hidden rounded-card border-2 border-ink" />
              ) : (
                <KitArt kit={kit} className="aspect-video rounded-card border-2 border-ink" />
              )}

              <dl className="divide-y-2 divide-ink/10 rounded-card border-2 border-ink bg-surface-2 px-5 text-sm max-lg:hidden">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="shrink-0 text-label">{f.label}</dt>
                    <dd className="text-right font-bold text-fg">{f.value}</dd>
                  </div>
                ))}
                {kit.integrations.length > 0 && (
                  <div className="py-3">
                    <dt className="text-label">{t.plugsInto}</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {kit.integrations.map((i) => (
                        <span key={i} className="rounded-full border-2 border-ink bg-surface px-2.5 py-0.5 text-xs font-bold text-fg">{i}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* kanan */}
            <div className="px-5 pb-8 pt-3 sm:px-8 lg:py-8 lg:pl-5 lg:pr-8">
              <span className="pop-sm inline-flex -rotate-2 rounded-full bg-brand px-3 py-0.5 font-display text-sm font-semibold text-on-brand">
                {soon ? t.comingSoon : kit.tag}
              </span>
              <h3 id="kit-dialog-title" className="t-sub mt-4 pr-12 text-fg">{kit.name}</h3>
              {kit.tagline && <p className="mt-1.5 text-lg text-muted">{kit.tagline}</p>}

              <p className="mt-6 text-base leading-relaxed text-muted">{kit.description}</p>

              {kit.features.length > 0 && (
                <div className="mt-8 border-t-2 border-ink/10 pt-6">
                  <p className="text-label">{t.features}</p>
                  <ul className="mt-3.5 grid gap-3">
                    {kit.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[15px] font-semibold text-fg">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand text-on-brand">
                          <Check size={11} strokeWidth={3.5} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* detail versi HP (di layar lebar ada di kolom kiri) */}
              <dl className="mt-8 divide-y-2 divide-ink/10 rounded-card border-2 border-ink bg-surface-2 px-5 text-sm lg:hidden">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="shrink-0 text-label">{f.label}</dt>
                    <dd className="text-right font-bold text-fg">{f.value}</dd>
                  </div>
                ))}
                {kit.integrations.length > 0 && (
                  <div className="py-3">
                    <dt className="text-label">{t.plugsInto}</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {kit.integrations.map((i) => (
                        <span key={i} className="rounded-full border-2 border-ink bg-surface px-2.5 py-0.5 text-xs font-bold text-fg">{i}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* ─── BAR BELI (selalu terlihat): harga + promo kiri, tombol kanan ─── */}
        <div className="flex items-center justify-between gap-4 border-t-2 border-ink bg-surface-2 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-4">
          <div className="min-w-0">
            {soon ? (
              <p className="t-card text-fg">{t.comingSoon}</p>
            ) : (
              <p className="font-display text-xl font-bold text-fg tabular-nums sm:text-2xl">
                <Price price={kit.price} applied={promo} oldClassName="text-sm font-semibold text-dim" />
              </p>
            )}
            <p className="mt-0.5 truncate text-xs font-bold text-dim">
              {soon ? fmt(t.placesPerKey, { n: kit.placesPerLicense }) : `${t.oneTime} · ${fmt(t.placesPerKey, { n: kit.placesPerLicense })}`}
            </p>
            {!soon && <PromoCode item={{ type: "kit", kitId: kit.id }} applied={promo} onChange={setPromo} className="mt-1.5" />}
          </div>
          {!soon && (
            <BuyButton
              item={{ type: "kit", kitId: kit.id }}
              code={promo?.code}
              returnTo={`/${lang}#kit-${kit.id}`}
              className={buttonClass("gold", "lg", "min-w-28 sm:min-w-44")}
              wrapperClassName="flex shrink-0 flex-col items-end gap-1.5"
            >
              {t.buy}
            </BuyButton>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
