"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ORDER_WHATSAPP, portfolio, serviceTags } from "../_data/landing";
import { Reveal } from "./Motion";
import { SitePreview } from "./SitePreview";
import { Section, SectionHeading } from "./ui";

type T = Dictionary["services"];

/** Jasa pembuatan web & mobile — daftar layanan, portofolio live, form order */
export default function Services({ t }: { t: T }) {
  return (
    <Section id="services">
      <SectionHeading
        index="05"
        eyebrow={t.eyebrow}
        title={<>{t.titleA}<br /><span className="text-gold">{t.titleGold}</span></>}
        desc={t.desc}
      />

      {/* ─── LAYANAN: baris bernomor, bukan kotak ikon ─── */}
      <ol className="border-t border-line-strong">
        {t.offers.map((o, i) => (
          <Reveal as="li" key={o.title} delay={i * 80}>
            <div className="group grid gap-3 border-b border-line py-7 transition-colors hover:bg-gold-soft md:grid-cols-[80px_1fr_1.3fr_auto] md:items-baseline md:gap-8 md:px-4">
              <span className="font-mono text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-wide text-fg transition-transform duration-300 md:text-4xl md:group-hover:translate-x-2">
                {o.title}
              </h3>
              <p className="max-w-md text-[15px] leading-relaxed text-muted">{o.desc}</p>
              <ul className="flex flex-wrap gap-1.5 md:justify-end">
                {serviceTags[i]?.map((tag) => (
                  <li key={tag} className="rounded-full border border-line-strong px-2.5 py-0.5 font-mono text-[11px] text-muted">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>

      {/* ─── PORTOFOLIO LIVE ─── */}
      <Reveal className="mt-20">
        <p className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="h-[3px] w-6 bg-gold" />
          {t.workTitle}
        </p>
        <div className="grid items-end gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          {portfolio.map((p, i) => {
            const w = t.work[i];
            if (!w) return null;
            return (
              <figure key={p.url} className={p.device === "phone" ? "mx-auto w-full max-w-[300px]" : ""}>
                <SitePreview url={p.url} title={w.name} device={p.device} poster={p.poster} hint={t.hint} />
                <figcaption className="mt-5 flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-gold">{w.kind}</span>
                    <span className="mt-1 block font-display text-2xl font-bold uppercase tracking-wide text-fg">{w.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{w.desc}</span>
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t.visit}: ${w.name}`}
                    className="group mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:border-gold hover:bg-gold-grad hover:text-on-gold"
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
      <Reveal className="mt-20">
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
    "w-full rounded-xl border border-line-strong bg-bg px-4 text-[15px] text-fg placeholder:text-dim transition-shadow focus:border-gold focus:shadow-[0_0_0_4px_var(--gold-soft)] focus:outline-none";

  return (
    <form onSubmit={submit} className="grid gap-8 rounded-3xl border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
      <div>
        <h3 className="font-display text-4xl font-bold uppercase leading-none tracking-wide text-fg md:text-5xl">{t.formTitle}</h3>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">{t.note}</p>
      </div>

      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-fg">{t.typeLabel}</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {t.offers.map((o, i) => (
              <button
                key={o.title}
                type="button"
                role="radio"
                aria-checked={type === i}
                onClick={() => setType(i)}
                className={`rounded-full border px-4 py-2 font-display text-sm font-semibold uppercase tracking-[0.12em] transition-all ${
                  type === i ? "border-gold bg-gold-grad text-on-gold" : "border-line-strong text-muted hover:border-gold/50 hover:text-fg"
                }`}
              >
                {o.title}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-fg">{t.nameLabel}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`h-12 ${control}`} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-fg">{t.briefLabel}</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            required
            rows={4}
            placeholder={t.briefPlaceholder}
            className={`resize-y py-3 leading-relaxed ${control}`}
          />
        </label>

        <button
          type="submit"
          className="group inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-gold-grad px-7 font-display text-base font-semibold uppercase tracking-[0.14em] text-on-gold shadow-[0_10px_30px_-12px_var(--gold)] transition hover:-translate-y-0.5 hover:brightness-105 sm:w-auto"
        >
          {t.send}
          <Send size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </form>
  );
}
