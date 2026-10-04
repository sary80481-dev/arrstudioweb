"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, PackageOpen, Search, Star, X } from "lucide-react";
import { BuyButton } from "@/components/checkout/BuyButton";
import { PromoCode, Price, type AppliedPromo } from "@/components/checkout/PromoCode";
import { KitIcon } from "@/components/common/KitIcon";
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
  // katalog dari Redux — diperbarui realtime oleh PublicSync saat /admin mengubah kit
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
      <SectionHeading label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleB} {t.titleGold}</Muted></>} desc={t.desc} />

      {kits.length === 0 ? (
        <div className="flex flex-col items-center rounded-[28px] bg-surface-2 px-6 py-24 text-center">
          <PackageOpen size={30} strokeWidth={1.5} className="text-dim" />
          <p className="mt-4 text-lg text-muted">{t.empty}</p>
        </div>
      ) : (
        <>
          {kits.length >= FILTER_FROM && (
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div
                className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label={t.eyebrow}
              >
                {[null, ...tags].map((g) => (
                  <button
                    key={g ?? "all"}
                    type="button"
                    aria-pressed={tag === g}
                    onClick={() => setTag(g)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                      tag === g ? "bg-fg text-bg" : "bg-surface-2 text-muted hover:text-fg"
                    }`}
                  >
                    {g ?? t.all}
                  </button>
                ))}
              </div>
              <label className="relative block md:w-72">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                  aria-label={t.search}
                  className="h-11 w-full rounded-full bg-surface-2 pl-11 pr-4 text-[15px] text-fg placeholder:text-dim transition-shadow focus:shadow-[0_0_0_2px_var(--gold)] focus:outline-none"
                />
              </label>
            </div>
          )}

          {visible.length === 0 ? (
            <p className="rounded-[24px] bg-surface-2 px-6 py-16 text-center text-muted">{t.noResults}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
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
      className="group/card flex h-full scroll-mt-24 flex-col rounded-[20px] bg-surface-2 p-1.5 transition-shadow hover:shadow-card sm:rounded-[24px] sm:p-2"
    >
      {/* tombol pembuka detail ada DI DALAM media, supaya hover tetap sampai ke pemutar video */}
      {kit.video ? (
        <KitVideoPlayer video={kit.video} title={kit.name} mode="hover" controls={false} expandable={false} className="aspect-[16/10] rounded-[15px] sm:rounded-[18px]">
          <MediaOverlay label={`${t.learnMore}: ${kit.name}`} badge={soon ? t.comingSoon : null} onOpen={onOpen} />
        </KitVideoPlayer>
      ) : (
        <KitArt kit={kit} className="aspect-[16/10] rounded-[15px] sm:rounded-[18px]">
          <MediaOverlay label={`${t.learnMore}: ${kit.name}`} badge={soon ? t.comingSoon : null} onOpen={onOpen} />
        </KitArt>
      )}

      <div className="flex flex-1 flex-col px-2 pb-1 pt-3 sm:px-2.5 sm:pb-1.5 sm:pt-4">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-[13px]">
          <span className="truncate font-medium text-gold">{kit.tag}</span>
          {kit.rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-muted">
              <Star size={12} className="fill-gold text-gold" /> {kit.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="mt-1 truncate text-[15px] font-semibold tracking-[-0.02em] text-fg sm:text-lg">
          <button type="button" onClick={onOpen} className="max-w-full truncate text-left hover:text-gold">
            {kit.name}
          </button>
        </h3>
        {/* HP: kartu diringkas (2 kolom) — tagline & slot ada di dialog detail */}
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted max-sm:hidden">{kit.tagline || kit.description}</p>
        <p className="mt-2 text-xs text-dim max-sm:hidden">{fmt(t.placesPerKey, { n: kit.placesPerLicense })}</p>

        <div className="mt-auto pt-3 sm:pt-4">
          {soon ? (
            <span className="text-[13px] text-muted sm:text-sm">{t.comingSoon}</span>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <Price
                  price={kit.price}
                  applied={promo}
                  className="text-sm font-semibold tracking-[-0.01em] text-fg tabular-nums sm:text-[15px]"
                  oldClassName="text-xs font-normal text-dim"
                />
                <BuyButton
                  item={{ type: "kit", kitId: kit.id }}
                  code={promo?.code}
                  returnTo={`/${lang}#kit-${kit.id}`}
                  className={buttonClass("gold", "sm", "h-8 px-4 text-[13px] max-sm:w-full")}
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
        <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white ring-1 ring-white/15 backdrop-blur-md max-sm:hidden">
          {badge}
        </span>
      )}
    </>
  );
}

/** Kit tanpa video: ikon kit "dipanggungkan" — sorot dari atas, pantulan di lantai */
function KitArt({ kit, className = "", children }: { kit: Kit; className?: string; children?: React.ReactNode }) {
  return (
    <div data-theme="dark" className={`relative isolate flex items-center justify-center overflow-hidden bg-black ${className}`}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(45% 80% at 50% 0%, rgb(255 236 190 / 0.18), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-[16%] left-1/2 -z-10 h-6 w-2/5 -translate-x-1/2 rounded-[100%] blur-xl"
        style={{ background: "rgb(232 191 98 / 0.3)" }}
      />
      <KitIcon
        icon={kit.icon}
        size={48}
        strokeWidth={1.2}
        className="text-[#e8bf62] drop-shadow-[0_12px_24px_rgba(232,191,98,0.35)] transition-transform duration-500 group-hover/card:scale-110"
      />
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-dialog-title"
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-[pagein_0.2s_ease-out] sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-surface text-fg shadow-float animate-[sheet-up_0.3s_cubic-bezier(0.2,0.7,0.2,1)] sm:animate-[rise-in_0.3s_cubic-bezier(0.2,0.7,0.2,1)] sm:rounded-[28px]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-black/75"
        >
          <X size={17} />
        </button>

        <div className="overflow-y-auto">
          {kit.video ? (
            <KitVideoPlayer video={kit.video} title={kit.name} mode="view" className="aspect-video" />
          ) : (
            <KitArt kit={kit} className="aspect-[21/9]" />
          )}

          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_15rem]">
            <div>
              <p className="text-[15px] font-semibold text-gold">{soon ? t.comingSoon : kit.tag}</p>
              <h3 id="kit-dialog-title" className="text-display mt-1 text-4xl text-fg">{kit.name}</h3>
              {kit.tagline && <p className="mt-2 text-lg text-muted">{kit.tagline}</p>}
              <p className="mt-5 text-[15px] leading-relaxed text-muted">{kit.description}</p>

              {kit.features.length > 0 && (
                <>
                  <p className="mt-7 text-sm font-semibold text-fg">{t.features}</p>
                  <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {kit.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[15px] text-fg">
                        <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-gold" /> {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* ─── kotak beli ─── */}
            <aside className="h-fit rounded-[22px] bg-surface-2 p-5">
              {soon ? (
                <p className="text-display text-2xl text-fg">{t.comingSoon}</p>
              ) : (
                <p className="text-display text-3xl text-fg tabular-nums">
                  <Price price={kit.price} applied={promo} oldClassName="text-lg font-normal text-dim" />
                </p>
              )}
              <p className="mt-1 text-sm text-dim">
                {soon ? fmt(t.placesPerKey, { n: kit.placesPerLicense }) : `${t.oneTime} · ${fmt(t.placesPerKey, { n: kit.placesPerLicense })}`}
              </p>
              {soon ? null : (
                <>
                  <BuyButton
                    item={{ type: "kit", kitId: kit.id }}
                    code={promo?.code}
                    returnTo={`/${lang}#kit-${kit.id}`}
                    className={buttonClass("gold", "md", "mt-5 w-full")}
                    block
                  >
                    {t.buy}
                  </BuyButton>
                  <PromoCode item={{ type: "kit", kitId: kit.id }} applied={promo} onChange={setPromo} className="mt-3 text-center" />
                </>
              )}
              <dl className="mt-5 space-y-3 text-sm">
                {kit.rating != null && (
                  <div className="flex items-center gap-1.5 text-fg">
                    <Star size={13} className="fill-gold text-gold" /> {kit.rating.toFixed(1)}
                    {kit.stats.activePlaces > 0 && <span className="text-dim">· {fmt(t.liveIn, { n: kit.stats.activePlaces })}</span>}
                  </div>
                )}
                {kit.integrations.length > 0 && (
                  <div>
                    <dt className="text-dim">{t.plugsInto}</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {kit.integrations.map((i) => (
                        <span key={i} className="rounded-full bg-bg px-2.5 py-1 text-xs text-muted">{i}</span>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-dim">{t.licenseGoesIn}</dt>
                  <dd className="mt-1 font-mono text-[13px] text-fg">{kit.configPath}</dd>
                </div>
                <div>
                  <dt className="text-dim">Version</dt>
                  <dd className="mt-1 font-mono text-[13px] text-fg">v{kit.version}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
