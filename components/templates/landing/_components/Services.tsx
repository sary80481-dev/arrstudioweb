"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, ChevronDown, LayoutTemplate, Send, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { TEMPLATE_SERVICES, type TemplateService, type WebTemplate } from "@/lib/web-templates";
import { KitSlideshow } from "@/components/video/KitSlideshow";
import { ORDER_WHATSAPP, portfolio, serviceTags } from "../_data/landing";
import { Reveal } from "./Motion";
import { SitePreview } from "./SitePreview";
import { Muted, Section, SectionHeading, buttonClass } from "./ui";

type T = Dictionary["services"];

/** Jasa pembuatan web & mobile — tile layanan, template (dropdown per layanan), portofolio live, form order */
export default function Services({ t, templates }: { t: T; templates: WebTemplate[] }) {
  // pilihan di form order — diisi juga oleh tombol "pakai template ini"
  const [type, setType] = useState(0);
  const [template, setTemplate] = useState<string | null>(null);

  const pickTemplate = (tpl: WebTemplate) => {
    setType(Math.max(0, TEMPLATE_SERVICES.indexOf(tpl.service)));
    setTemplate(tpl.name);
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

      {/* ─── TEMPLATE WEB ─── */}
      {templates.length > 0 && (
        <Reveal className="mt-24">
          <Templates t={t} templates={templates} onUse={pickTemplate} />
        </Reveal>
      )}

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
        <OrderForm
          t={t}
          type={type}
          setType={setType}
          template={template}
          clearTemplate={() => setTemplate(null)}
        />
      </Reveal>
    </Section>
  );
}

/** Template per layanan: dropdown memilih layanan, isinya preview live (iframe) atau slideshow foto */
function Templates({ t, templates, onUse }: { t: T; templates: WebTemplate[]; onUse: (tpl: WebTemplate) => void }) {
  // hanya layanan yang punya template yang muncul di dropdown
  const groups = useMemo(
    () =>
      TEMPLATE_SERVICES.map((service, i) => ({ service, title: t.offers[i]?.title ?? service, items: templates.filter((x) => x.service === service) }))
        .filter((g) => g.items.length > 0),
    [templates, t.offers]
  );
  const [service, setService] = useState<TemplateService>(groups[0]?.service ?? "website");
  const current = groups.find((g) => g.service === service) ?? groups[0];
  if (!current) return null;

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="t-sub text-fg">{t.templatesTitle}</h3>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{t.templatesDesc}</p>
        </div>
        <label className="block shrink-0">
          <span className="mb-2 block text-[15px] font-bold text-fg">{t.templatesFor}</span>
          <span className="relative block">
            <select
              value={current.service}
              onChange={(e) => setService(e.target.value as TemplateService)}
              className="h-12 w-full min-w-[240px] cursor-pointer appearance-none rounded-full border-2 border-ink bg-surface pl-5 pr-12 font-display text-[16px] font-semibold text-fg shadow-[3px_3px_0_0_var(--ink)] transition-shadow focus:shadow-[4px_4px_0_0_var(--brand)] focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g.service} value={g.service}>
                  {g.title} ({g.items.length})
                </option>
              ))}
            </select>
            <ChevronDown size={18} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-fg" />
          </span>
        </label>
      </div>

      <ul key={current.service} className="mt-10 grid items-start gap-10 md:grid-cols-2 lg:grid-cols-3">
        {current.items.map((tpl) => (
          <li key={tpl.id} className="flex h-full flex-col">
            <div className={tpl.device === "phone" ? "mx-auto w-full max-w-[260px]" : ""}>
              {tpl.mode === "link" && tpl.url ? (
                <SitePreview url={tpl.url} title={tpl.name} device={tpl.device} poster={tpl.photos[0]?.url} hint={t.hint} />
              ) : tpl.device === "phone" ? (
                <div className="pop-lg rounded-[2.4rem] bg-[#241a0b] p-2.5">
                  <KitSlideshow photos={tpl.photos} title={tpl.name} mode="view" className="aspect-[390/844] rounded-[1.9rem]" />
                </div>
              ) : (
                <KitSlideshow photos={tpl.photos} title={tpl.name} mode="view" className="pop-lg aspect-[16/10] rounded-card" />
              )}
            </div>
            <div className="mt-5 flex flex-1 flex-col">
              <span className="block t-card text-fg">{tpl.name}</span>
              {tpl.description && <span className="mt-1 block flex-1 text-[15px] leading-relaxed text-muted">{tpl.description}</span>}
              <span className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUse(tpl)}
                  className="btn-pop inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 font-display text-sm font-semibold text-on-brand"
                >
                  <LayoutTemplate size={14} /> {t.useTemplate}
                </button>
                {tpl.mode === "link" && tpl.url && (
                  <a
                    href={tpl.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t.visit}: ${tpl.name}`}
                    className="btn-pop group flex h-9 w-9 items-center justify-center rounded-full bg-surface text-fg hover:bg-brand hover:text-on-brand"
                  >
                    <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function OrderForm({ t, type, setType, template, clearTemplate }: {
  t: T;
  type: number;
  setType: (i: number) => void;
  template: string | null;
  clearTemplate: () => void;
}) {
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");

  // tidak ada backend: pesan disusun lalu dibuka di WhatsApp
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      `${t.greeting} ${t.offers[type]?.title ?? ""}.`,
      template && `${t.templateLabel}: ${template}`,
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
    <form id="order-form" onSubmit={submit} className="scroll-mt-28 pop-lg grid gap-10 rounded-panel bg-surface p-6 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
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
          {template && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-bg py-1 pl-3 pr-1 text-sm font-bold text-fg">
              <LayoutTemplate size={14} className="shrink-0" />
              <span className="truncate">{t.templateLabel}: {template}</span>
              <button type="button" onClick={clearTemplate} aria-label={`${t.templateLabel}: ${template} ×`} className="rounded-full p-1 text-dim hover:bg-surface-2 hover:text-fg">
                <X size={13} />
              </button>
            </p>
          )}
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
