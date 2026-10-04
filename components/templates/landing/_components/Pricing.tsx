"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BuyButton } from "@/components/checkout/BuyButton";
import { PromoCode, type AppliedPromo } from "@/components/checkout/PromoCode";
import { fmt, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatIDRShort, type Kit } from "@/lib/kits";
import { selectKits, selectPricing, useAppSelector } from "@/lib/store/store";
import { ORDER_WHATSAPP, plans } from "../_data/landing";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading, buttonClass } from "./ui";

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

export default function Pricing({ t, lang }: { t: Dictionary["pricing"]; lang: Locale }) {
  // harga & isi bundle diatur di /admin/pricing, kit dari /admin/kits — keduanya realtime
  const kits = useAppSelector(selectKits);
  const pricing = useAppSelector(selectPricing);
  const [bundlePromo, setBundlePromo] = useState<AppliedPromo | null>(null);
  const active = kits.filter((k) => k.status === "active");
  const activeNames = active.map((k) => k.name);
  // "hingga {p} place" untuk lisensi single — pakai angka terkecil supaya janjinya berlaku di semua kit
  const singlePlaces = active.length ? Math.min(...active.map((k) => k.placesPerLicense)) : 1;

  const visible = plans
    .map((p, i) => ({ plan: p, text: t.plans[i] }))
    .filter(({ plan }) => plan.price !== "bundle" || pricing.bundleEnabled);

  const priceOf = (p: (typeof plans)[number], fallback?: string) =>
    p.price === "range" ? priceRange(kits) : p.price === "bundle" ? `Rp ${formatIDRShort(pricing.bundlePrice)}` : (fallback ?? "");

  const features = (list: string[]) =>
    list
      .map((f) => fmt(f, { kits: joinNames(activeNames), n: pricing.bundlePlaces, p: singlePlaces }))
      .filter((f) => f.trim() !== "");

  const action = (p: (typeof plans)[number], cta: string, highlighted?: boolean) => {
    // kartu unggulan berlatar kuning → tombolnya krem agar tetap menonjol
    const cls = buttonClass(highlighted ? "outline" : "gold", "lg", "mt-8 w-full");
    if (p.price === "bundle") {
      return (
        <>
          <BuyButton item={{ type: "bundle" }} code={bundlePromo?.code} returnTo={`/${lang}#pricing`} className={cls} block>
            {cta}
          </BuyButton>
          <PromoCode item={{ type: "bundle" }} applied={bundlePromo} onChange={setBundlePromo} className="mt-3 text-center" />
        </>
      );
    }
    // paket custom → ngobrol langsung
    const href = p.price === "text" ? `https://wa.me/${ORDER_WHATSAPP}` : p.href;
    return (
      <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} className={cls}>
        {cta}
      </a>
    );
  };

  return (
    <Section id="pricing" tone="tile">
      <SectionHeading index={7} label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} desc={t.desc} />

      <div className={`grid items-stretch gap-6 ${visible.length === 3 ? "lg:grid-cols-3" : "mx-auto max-w-4xl md:grid-cols-2"}`}>
        {visible.map(({ plan: p, text }, idx) => (
          <Reveal key={text.name} delay={idx * 90} className="h-full">
            <div
              data-theme={p.highlighted ? "light" : undefined}
              className={`pop-lg relative flex h-full flex-col rounded-panel p-7 md:p-9 ${p.highlighted ? "bg-dots bg-brand text-fg lg:-translate-y-3" : "bg-surface"}`}
            >
              <div className="relative flex flex-1 flex-col">
                {p.highlighted && (
                  <span className="pop-sm absolute -top-11 right-0 rotate-3 rounded-full bg-surface px-3.5 py-1 font-display text-sm font-semibold text-fg md:-top-13">
                    {t.bestValue}
                  </span>
                )}
                <h3 className="t-card text-fg">{text.name}</h3>
                <p className="mt-2 text-[15px] text-muted">{text.desc}</p>

                <p className="mt-8 flex flex-wrap items-baseline gap-x-2">
                  {p.price === "bundle" && bundlePromo && (
                    <s className="text-2xl text-dim tabular-nums" aria-label={`Was Rp ${formatIDRShort(bundlePromo.originalAmount)}`}>
                      Rp {formatIDRShort(bundlePromo.originalAmount)}
                    </s>
                  )}
                  <span className="font-display text-[length:clamp(1.9rem,1.3rem+1.4vw,2.6rem)] font-bold leading-none text-fg tabular-nums">
                    {p.price === "bundle" && bundlePromo ? `Rp ${formatIDRShort(bundlePromo.amount)}` : priceOf(p, text.price)}
                  </span>
                  {text.period && <span className="text-[15px] font-semibold text-muted">{text.period}</span>}
                </p>

                {action(p, text.cta, p.highlighted)}

                <ul className="mt-8 flex-1 space-y-3 border-t-2 border-ink/15 pt-7">
                  {features(text.features).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[15px] font-semibold text-fg">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface text-fg"><Check size={12} strokeWidth={3.5} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
