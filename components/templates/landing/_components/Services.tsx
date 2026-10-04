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
      <SectionHeading index={5} label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} desc={t.desc} />

      {/* ─── LAYANAN ─── */}
      <ol className="grid gap-5 md:grid-cols-3">
        {t.offers.map((o, i) => (
          <Reveal as="li" key={o.title} delay={i * 80} className="h-full">
            <div className="group pop pop-hover flex h-full flex-col rounded-card bg-surface p-6 sm:p-7">
              <span className="pop-sm mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand font-display text-xl font-bold text-on-brand transition-transform duration-300 group-hover:-rotate-6">{i + 1}</span>
              <h3 className="t-card text-fg">{o.title}</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-muted">{o.desc}</p>
              <ul className="mt-7 flex flex-wrap gap-1.5">{serviceTags[i]?.map((tag) => <li key={tag} className="rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold text-fg">{tag}</li>)}</ul>
            </div>
          </Reveal>
        ))}
      </ol>

      {/* ─── PORTOFOLIO LIVE ─── */}
      <Reveal className="mt-24">
        <h3 className="t-sub text-fg">{t.workTitle}</h3>
        <div className="mt-10 grid items-end gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          {portfolio.map((p, i) => {
            const w = t.work[i];
            if (!w) return null;
            return (
              <figure key={p.url} className={p.device === "phone" ? "mx-auto w-full max-w-[300px]" : ""}>
                <SitePreview url={p.url} title={w.name} device={p.device} poster={p.poster} hint={t.hint} />
                <figcaption className="mt-6 flex items-start justify-between gap-4">
                  <span>
                    <span className="inline-block rounded-full bg-brand px-2.5 py-0.5 font-display text-xs font-semibold text-on-brand">{w.kind}</span>
                    <span className="mt-2 block t-card text-fg">{w.name}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted">{w.desc}</span>
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t.visit}: ${w.name}`}
                    className="btn-pop group mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-fg hover:bg-brand hover:text-on-brand"
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
      <Reveal className="mt-24">
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
    "w-full rounded-2xl border-2 border-ink bg-bg px-4 text-[17px] font-semibold text-fg placeholder:font-medium placeholder:text-dim transition-shadow focus:shadow-[4px_4px_0_0_var(--brand)] focus:outline-none";

  return (
    <form onSubmit={submit} className="pop-lg grid gap-10 rounded-panel bg-surface p-6 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div>
        <h3 className="t-sub text-fg">{t.formTitle}</h3>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">{t.note}</p>
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-[15px] font-bold text-fg">{t.typeLabel}</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {t.offers.map((o, i) => (
              <button
                key={o.title}
                type="button"
                role="radio"
                aria-checked={type === i}
                onClick={() => setType(i)}
                className={`btn-pop rounded-full px-5 py-2 font-display text-[15px] font-semibold ${
                  type === i ? "bg-brand text-on-brand" : "bg-bg text-fg"
                }`}
              >
                {o.title}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block text-[15px] font-bold text-fg">{t.nameLabel}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`h-13 ${control}`} />
        </label>

        <label className="block">
          <span className="mb-2 block text-[15px] font-bold text-fg">{t.briefLabel}</span>
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
