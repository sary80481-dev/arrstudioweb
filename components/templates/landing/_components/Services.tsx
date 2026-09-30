"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ORDER_WHATSAPP, portfolio, serviceTags } from "../_data/landing";
import { Reveal } from "./Motion";
import { SitePreview } from "./SitePreview";
import { Muted, Section, SectionHeading, buttonClass } from "./ui";

type T = Dictionary["services"];

/** Jasa pembuatan web & mobile — tile layanan, portofolio live, form order */
export default function Services({ t }: { t: T }) {
  return (
    <Section id="services" tone="tile">
      <SectionHeading label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} desc={t.desc} />

      {/* ─── LAYANAN ─── */}
      <ol className="grid gap-3 md:grid-cols-3">
        {t.offers.map((o, i) => (
          <Reveal as="li" key={o.title} delay={i * 80} className="h-full">
            <div className="flex h-full flex-col rounded-[24px] bg-bg p-7 md:p-8">
              <h3 className="text-2xl font-semibold tracking-[-0.025em] text-fg">{o.title}</h3>
              <p className="mt-3 flex-1 text-[17px] leading-relaxed text-muted">{o.desc}</p>
              <p className="mt-8 text-sm text-dim">{serviceTags[i]?.join(" · ")}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      {/* ─── PORTOFOLIO LIVE ─── */}
      <Reveal className="mt-28">
        <h3 className="text-display text-center text-4xl text-fg md:text-5xl">{t.workTitle}</h3>
        <div className="mt-14 grid items-end gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          {portfolio.map((p, i) => {
            const w = t.work[i];
            if (!w) return null;
            return (
              <figure key={p.url} className={p.device === "phone" ? "mx-auto w-full max-w-[300px]" : ""}>
                <SitePreview url={p.url} title={w.name} device={p.device} poster={p.poster} hint={t.hint} />
                <figcaption className="mt-6 flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold text-gold">{w.kind}</span>
                    <span className="mt-1 block text-xl font-semibold tracking-[-0.02em] text-fg">{w.name}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted">{w.desc}</span>
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t.visit}: ${w.name}`}
                    className="group mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-fg transition-colors hover:bg-brand hover:text-on-brand"
                  >
                    <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Reveal>

      {/* ─── FORM ORDER ─── */}
      <Reveal className="mt-28">
        <OrderForm t={t} />
      </Reveal>
    </Section>
  );
}

function OrderForm({ t }: { t: T }) {
  const [type, setType] = useState(0);
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");

  // tidak ada backend: pesan disusun lalu dibuka di WhatsApp
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      `${t.greeting} ${t.offers[type]?.title ?? ""}.`,
      name.trim() && `${t.nameLabel}: ${name.trim()}`,
      brief.trim() && `\n${brief.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const control =
    "w-full rounded-2xl bg-surface-2 px-4 text-[17px] text-fg placeholder:text-dim transition-shadow focus:shadow-[0_0_0_3px_var(--gold)] focus:outline-none";

  return (
    <form onSubmit={submit} className="grid gap-10 rounded-[28px] bg-bg p-7 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div>
        <h3 className="text-display text-4xl text-fg md:text-5xl">{t.formTitle}</h3>
        <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-muted">{t.note}</p>
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-[15px] font-medium text-fg">{t.typeLabel}</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {t.offers.map((o, i) => (
              <button
                key={o.title}
                type="button"
                role="radio"
                aria-checked={type === i}
                onClick={() => setType(i)}
                className={`rounded-full px-5 py-2.5 text-[15px] transition-colors ${
                  type === i ? "bg-fg text-bg" : "bg-surface-2 text-muted hover:text-fg"
                }`}
              >
                {o.title}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block text-[15px] font-medium text-fg">{t.nameLabel}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`h-13 ${control}`} />
        </label>

        <label className="block">
          <span className="mb-2 block text-[15px] font-medium text-fg">{t.briefLabel}</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            required
            rows={4}
            placeholder={t.briefPlaceholder}
            className={`resize-y py-3.5 leading-relaxed ${control}`}
          />
        </label>

        <button type="submit" className={buttonClass("gold", "lg", "w-full sm:w-auto")}>
          {t.send}
          <Send size={15} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}
