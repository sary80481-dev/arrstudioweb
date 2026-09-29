"use client";

import { Check } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatIDRShort, type Kit } from "@/lib/kits";
import { selectKits, selectPricing, useAppSelector } from "@/lib/store/store";
import { plans } from "../_data/landing";
import { Button, Panel, Section, SectionHeading } from "./ui";

/** "Rp 299rb–449rb" dari harga kit aktif */
function priceRange(kits: Kit[]) {
  const prices = kits.filter((k) => k.status === "active").map((k) => k.price);
  if (prices.length === 0) return "—";
  const [min, max] = [Math.min(...prices), Math.max(...prices)];
  return min === max ? `Rp ${formatIDRShort(min)}` : `Rp ${formatIDRShort(min)}–${formatIDRShort(max)}`;
}

/** "ClubKit Pro & Summit Kit", "A, B & C" */
const joinNames = (names: string[]) =>
  names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;

export default function Pricing({ t }: { t: Dictionary["pricing"] }) {
  // harga & isi bundle diatur di /admin/pricing, kit dari /admin/kits — keduanya realtime
  const kits = useAppSelector(selectKits);
  const pricing = useAppSelector(selectPricing);
  const activeNames = kits.filter((k) => k.status === "active").map((k) => k.name);

  const visible = plans
    .map((p, i) => ({ plan: p, text: t.plans[i] }))
    .filter(({ plan }) => plan.price !== "bundle" || pricing.bundleEnabled);

  const priceOf = (p: (typeof plans)[number], fallback?: string) =>
    p.price === "range" ? priceRange(kits) : p.price === "bundle" ? `Rp ${formatIDRShort(pricing.bundlePrice)}` : (fallback ?? "");

  const features = (list: string[]) =>
    list
      .map((f) => fmt(f, { kits: joinNames(activeNames), n: pricing.bundlePlaces }))
      .filter((f) => f.trim() !== "");

  return (
    <Section id="pricing" className="border-y border-line bg-surface/40">
      <SectionHeading
        index="05"
        eyebrow={t.eyebrow}
        title={<>{t.titleA} <span className="text-gold-metal">{t.titleGold}</span></>}
        desc={t.desc}
        center
      />

      <div className={`grid items-stretch gap-5 ${visible.length === 3 ? "lg:grid-cols-3" : "mx-auto max-w-4xl md:grid-cols-2"}`}>
        {visible.map(({ plan: p, text }) => (
          <Panel
            key={text.name}
            highlight={p.highlighted}
            className={p.highlighted ? "shadow-card lg:-my-4" : ""}
            innerClassName="flex h-full flex-col p-7 md:p-9"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-fg">{text.name}</h3>
              {p.highlighted && (
                <span className="chamfer-sm shrink-0 bg-gold-grad px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.2em] text-on-gold">
                  {t.bestValue}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">{text.desc}</p>

            <p className="mt-8 flex flex-wrap items-baseline gap-x-2">
              <span className={`font-display text-5xl font-bold tracking-tight md:text-[3.25rem] ${p.highlighted ? "text-gold-metal" : "text-fg"}`}>
                {priceOf(p, text.price)}
              </span>
              {text.period && <span className="text-sm uppercase tracking-wider text-dim">{text.period}</span>}
            </p>

            <ul className="mt-8 flex-1 space-y-3 border-t border-line pt-7">
              {features(text.features).map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-fg">
                  <Check size={16} className="mt-0.5 shrink-0 text-gold" strokeWidth={2.25} />
                  {f}
                </li>
              ))}
            </ul>

            <Button href={p.href} variant={p.highlighted ? "gold" : "outline"} className="mt-9 w-full">
              {text.cta}
            </Button>
          </Panel>
        ))}
      </div>
    </Section>
  );
}
