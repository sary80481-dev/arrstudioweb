"use client";

import { useEffect, useState } from "react";
import { Check, Clock, FileCode2, PackageOpen, Plug, Star } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { KitIcon } from "@/components/common/KitIcon";
import { formatIDR, type Kit } from "@/lib/kits";
import { selectKits, useAppSelector } from "@/lib/store/store";
import { Reveal, Spotlight } from "./Motion";
import { Button, Panel, Section, SectionHeading } from "./ui";

const attributeKeys = ["systems", "integration", "setup"] as const;

export default function Marketplace({ t }: { t: Dictionary["kits"] }) {
  // katalog dari Redux — diperbarui realtime oleh PublicSync saat /admin mengubah kit
  const kits = useAppSelector(selectKits);
  const [activeId, setActiveId] = useState<string | null>(kits[0]?.id ?? null);
  const kit = kits.find((k) => k.id === activeId) ?? kits[0];

  // link "#kit-<id>" dari hero → pilih kit tersebut
  useEffect(() => {
    const sync = () => {
      const match = kits.find((k) => `#kit-${k.id}` === window.location.hash);
      if (match) setActiveId(match.id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [kits]);

  return (
    <Section id="kits">
      <SectionHeading
        index="01"
        eyebrow={t.eyebrow}
        title={<>{t.titleA}<br />{t.titleB} <span className="text-gold-metal">{t.titleGold}</span></>}
        desc={t.desc}
      />

      {!kit ? (
        <Panel innerClassName="flex flex-col items-center px-6 py-16 text-center">
          <PackageOpen size={36} strokeWidth={1.5} className="text-gold" />
          <p className="mt-4 text-muted">{t.empty}</p>
        </Panel>
      ) : (
        <Reveal className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* ─── KIT LIST: geser horizontal di mobile, kolom di desktop ─── */}
          <div
            role="tablist"
            aria-label={t.eyebrow}
            className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
          >
            {kits.map((k, i) => {
              const selected = k.id === kit.id;
              return (
                <button
                  key={k.id}
                  id={`kit-${k.id}`}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="kit-panel"
                  onClick={() => setActiveId(k.id)}
                  className={`group relative flex min-w-[240px] snap-start items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 lg:min-w-0 ${
                    selected
                      ? "border-gold/60 bg-gold-soft shadow-card"
                      : "border-line bg-surface hover:border-line-strong lg:hover:translate-x-1"
                  }`}
                >
                  <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full bg-gold-grad transition-opacity ${selected ? "opacity-100" : "opacity-0"}`} />
                  <span className={`font-display text-3xl font-bold leading-none tabular-nums ${selected ? "text-gold" : "text-line-strong group-hover:text-dim"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-display text-xl font-bold uppercase leading-tight tracking-wide ${selected ? "text-fg" : "text-muted group-hover:text-fg"}`}>
                      {k.name}
                    </span>
                    <span className="block text-xs text-dim">
                      {k.status === "coming_soon" ? t.comingSoon : `${k.tag} · v${k.version}`}
                    </span>
                  </span>
                  <KitIcon icon={k.icon} size={18} strokeWidth={1.75} className={`shrink-0 ${selected ? "text-gold" : "text-dim"}`} />
                </button>
              );
            })}
          </div>

          {/* ─── DETAIL ─── */}
          <KitDetail kit={kit} t={t} />
        </Reveal>
      )}
    </Section>
  );
}

function KitDetail({ kit, t }: { kit: Kit; t: Dictionary["kits"] }) {
  const soon = kit.status === "coming_soon";

  return (
    <Panel className="shadow-card" innerClassName="grid md:grid-cols-[0.9fr_1.1fr]">
      <div id="kit-panel" role="tabpanel" className="contents">
        {/* key art */}
        <Spotlight className="group/art relative flex min-h-[280px] items-center justify-center overflow-hidden border-b border-line bg-bg md:border-b-0 md:border-r">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--line) 0 1px, transparent 1px 14px)" }}
          />
          <span aria-hidden className="absolute -bottom-2 left-3 select-none font-display text-7xl font-bold uppercase leading-none text-fg/[0.06] md:text-8xl">
            {kit.name.split(" ")[0]}
          </span>
          <div key={kit.id} className="relative animate-[float_6s_ease-in-out_infinite]">
            <div className="rounded-[2rem] bg-gold-grad p-px shadow-[0_20px_50px_-24px_var(--gold)] transition-transform duration-500 group-hover/art:-rotate-3 group-hover/art:scale-105">
              <div className="flex h-32 w-32 items-center justify-center rounded-[calc(2rem-1px)] bg-surface text-gold md:h-40 md:w-40">
                <KitIcon icon={kit.icon} size={64} strokeWidth={1.25} />
              </div>
            </div>
          </div>
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
            <span className={`h-1.5 w-1.5 rounded-full ${soon ? "bg-gold" : "bg-green"}`} />
            v{kit.version} · {soon ? t.comingSoon : fmt(t.liveIn, { n: kit.stats.activePlaces })}
          </span>
        </Spotlight>

        {/* info */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-gold">{kit.tag}</p>
            {kit.rating != null && (
              <span className="flex items-center gap-1 text-sm text-fg">
                <Star size={14} className="fill-gold text-gold" /> {kit.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-4xl font-bold uppercase leading-none tracking-wide text-fg md:text-5xl">{kit.name}</h3>
          {kit.tagline && <p className="mt-1 text-muted">{kit.tagline}</p>}
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{kit.description}</p>

          {/* attribute bars — mengisi ulang setiap ganti kit */}
          <dl className="mt-6 space-y-3">
            {attributeKeys.map((key) => (
              <div key={key} className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm">
                <dt className="font-display font-semibold uppercase tracking-[0.15em] text-muted">{t.attributes[key]}</dt>
                <dd className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span
                    key={kit.id}
                    className="block h-full origin-left animate-[grow_0.9s_cubic-bezier(0.2,0.7,0.2,1)] rounded-full bg-gold-grad"
                    style={{ width: `${kit.attributes[key]}%` }}
                  />
                </dd>
                <dd className="text-right font-mono text-xs text-dim">{kit.attributes[key]}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {kit.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-fg">
                <Check size={15} className="mt-0.5 shrink-0 text-gold" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
            {kit.integrations.length > 0 && (
              <p className="flex flex-wrap items-center gap-2">
                <Plug size={14} className="text-dim" />
                <span className="text-dim">{t.plugsInto}</span>
                {kit.integrations.map((i) => (
                  <span key={i} className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-fg">{i}</span>
                ))}
              </p>
            )}
            <p className="flex flex-wrap items-center gap-2">
              <FileCode2 size={14} className="text-dim" />
              <span className="text-dim">{t.licenseGoesIn}</span>
              <code className="rounded-md bg-gold-soft px-1.5 py-0.5 font-mono text-xs text-gold">{kit.configPath}</code>
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
            <p>
              <span className="font-display text-4xl font-bold text-fg">{formatIDR(kit.price)}</span>
              <span className="ml-2 text-sm text-dim">{t.oneTime}</span>
            </p>
            {soon ? (
              <span className="flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                <Clock size={15} /> {t.comingSoon}
              </span>
            ) : (
              <Button href="/register">{fmt(t.get, { name: kit.name.split(" ")[0] })}</Button>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
