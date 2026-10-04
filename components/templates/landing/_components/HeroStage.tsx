"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Check, KeyRound, Star } from "lucide-react";
import { KitIcon } from "@/components/common/KitIcon";
import { fmt } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatIDR, type Kit } from "@/lib/kits";
import { integrations } from "../_data/landing";

/** lama satu kit tampil sebelum berganti otomatis */
const ROTATE_MS = 4500;

/** Pembungkus lapisan panggung (statis — tanpa parallax agar tenang saat kursor di atasnya) */
function Layer({ className = "", children }: { depth?: number; className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

/**
 * Panggung hero tanpa video: kartu produk kit di atas tumpukan kartu, gelembung integrasi
 * yang tersambung (menyala bila dipakai kit aktif) & chip key terverifikasi.
 * Kit berganti otomatis; berhenti saat di-hover; bisa dipilih lewat chip.
 */
export default function HeroStage({ kits, t }: { kits: Kit[]; t: Dictionary["kits"] }) {
  const list = kits.filter((k) => k.status === "active").slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const kit = list[index % Math.max(1, list.length)];

  useEffect(() => {
    if (paused || list.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % list.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, list.length]);

  if (!kit) return null;
  const uses = new Set<string>(kit.integrations);

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative mx-auto w-full max-w-[540px] pb-6 pt-8 lg:max-w-none lg:pr-20"
    >
      {/* ─── KARTU PRODUK (dengan tumpukan di belakang) ─── */}
      <Layer className="relative mx-auto w-full max-w-[400px] lg:mr-0">
        <span aria-hidden className="pop absolute inset-0 rotate-[4deg] rounded-panel bg-brand" />
        <span aria-hidden className="pop absolute inset-0 -rotate-[3deg] rounded-panel bg-surface-2" />

        <article key={kit.id} className="pop-lg relative rounded-panel bg-surface p-6 animate-[rise-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <span className="pop-sm flex h-14 w-14 shrink-0 -rotate-6 items-center justify-center rounded-media bg-brand text-on-brand">
              <KitIcon icon={kit.icon} size={28} strokeWidth={2} />
            </span>
            <span className="flex flex-col items-end gap-1.5">
              {kit.tag && <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-fg">{kit.tag}</span>}
              {kit.rating != null && (
                <span className="flex items-center gap-1 text-xs font-bold text-fg">
                  <Star size={13} strokeWidth={2.25} className="fill-brand text-ink" /> {kit.rating.toFixed(1)}
                </span>
              )}
            </span>
          </div>

          <h3 className="t-sub mt-5 text-fg">{kit.name}</h3>
          {kit.tagline && <p className="mt-1.5 text-base text-muted">{kit.tagline}</p>}

          {kit.features.length > 0 && (
            <ul className="mt-5 space-y-2">
              {kit.features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm font-semibold text-fg">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand text-on-brand">
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                  <span className="line-clamp-1">{f}</span>
                </li>
              ))}
            </ul>
          )}

          {/* baris Config — tempat key ditempel */}
          <p data-theme="dark" className="mt-5 truncate rounded-media border-2 border-[#241a0b] bg-bg px-3.5 py-2.5 font-mono text-xs text-muted">
            <span className="text-fg">LicenseKey</span> = <span className="text-brand">&quot;ARR-7F2K-••••&quot;</span>
            <span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-[blink_1s_steps(1)_infinite] bg-brand" />
          </p>

          <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-ink/15 pt-4">
            <span className="font-display text-xl font-bold text-fg tabular-nums">{formatIDR(kit.price)}</span>
            <span className="text-xs font-bold text-dim">{fmt(t.placesPerKey, { n: kit.placesPerLicense })}</span>
          </div>
        </article>
      </Layer>

      {/* ─── GELEMBUNG INTEGRASI: kolom kanan (≥ lg), baris di bawah (HP) ─── */}
      <div className="mt-8 lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2">
      <Layer>
        <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-wider text-dim lg:hidden">{t.plugsInto}</p>
        <ul className="flex justify-center gap-3 lg:flex-col">
          {integrations.map((it) => {
            const on = uses.has(it.name);
            const I = it.icon;
            return (
              <li key={it.name} className="relative flex items-center">
                {/* penyambung ke kartu */}
                <span
                  aria-hidden
                  className={`absolute right-full hidden h-0.5 w-8 rounded-full transition-colors duration-300 lg:block ${on ? "bg-ink" : "bg-line-strong"}`}
                />
                <span
                  title={it.name}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform,box-shadow] duration-300 ${
                    on
                      ? "scale-100 border-ink bg-brand text-on-brand shadow-[2px_2px_0_0_var(--ink)]"
                      : "scale-90 border-line-strong bg-surface text-dim"
                  }`}
                >
                  <I size={20} strokeWidth={2} />
                  <span className="sr-only">{it.name}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Layer>
      </div>

      {/* ─── CHIP KEY TERVERIFIKASI ─── */}
      <Layer className="absolute left-0 top-0 hidden sm:block lg:-left-6">
        <div className="pop flex -rotate-3 items-center gap-2.5 rounded-card bg-surface px-3.5 py-2.5 animate-[pop-in_0.6s_ease-out_0.5s_both]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-ink bg-brand text-on-brand">
            <KeyRound size={15} strokeWidth={2.5} />
          </span>
          <span className="font-mono text-xs font-bold text-fg">ARR-7F2K-••••</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green text-white">
            <Check size={12} strokeWidth={3.5} />
          </span>
        </div>
      </Layer>

      {/* ─── PEMILIH KIT ─── */}
      {list.length > 1 && (
        <ul className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Kits">
          {list.map((k, i) => {
            const on = i === index % list.length;
            return (
              <li key={k.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setIndex(i)}
                  className={`btn-pop relative overflow-hidden rounded-full px-4 py-1.5 font-display text-sm font-semibold ${
                    on ? "bg-brand text-on-brand" : "bg-surface text-fg"
                  }`}
                >
                  {k.name}
                  {/* progres ganti otomatis */}
                  {on && !paused && (
                    <span
                      aria-hidden
                      key={index}
                      className="absolute inset-x-0 bottom-0 h-1 origin-left bg-ink/40"
                      style={{ animation: `step-progress ${ROTATE_MS}ms linear both` } as CSSProperties}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
