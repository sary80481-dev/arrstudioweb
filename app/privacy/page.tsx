import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { LogoImage } from "@/components/templates/landing/_components/ui";
import { CONTACT, LEGAL, policies, policyLang, policyLangNames, type Block, type PolicyLang } from "./content";

export const metadata: Metadata = {
  title: "Privacy Policy — ArrStudio",
  description: "How ArrStudio collects, uses, shares and protects personal data, and the choices and rights you have.",
  alternates: { canonical: "/privacy" },
};

const DATE_LOCALE: Record<PolicyLang, string> = { en: "en-US", id: "id-ID", ms: "ms-MY", fil: "fil-PH", vi: "vi-VN", th: "th-TH" };
const dateFmt = (iso: string, lang: PolicyLang) =>
  new Date(iso).toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <>
      {/* layar lebar: tabel biasa */}
      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="bg-surface-2 text-xs font-medium text-muted">
            <tr>
              {head.map((h) => (
                <th key={h} scope="col" className="px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i} className="align-top">
                {r.map((c, j) => (
                  <td key={j} className={`px-4 py-3 leading-relaxed ${j === 0 ? "font-medium text-fg" : "text-muted"}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* HP: tiap baris jadi kartu berlabel */}
      <ul className="space-y-3 md:hidden">
        {rows.map((r, i) => (
          <li key={i} className="rounded-2xl bg-surface-2 p-4 text-[13px]">
            <p className="font-medium text-fg">{r[0]}</p>
            <dl className="mt-2 space-y-1.5">
              {r.slice(1).map((c, j) => (
                <div key={j}>
                  <dt className="text-[11px] uppercase tracking-wider text-dim">{head[j + 1]}</dt>
                  <dd className="leading-relaxed text-muted">{c}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("p" in b) return <p key={i} className="text-[15px] leading-relaxed text-muted">{b.p}</p>;
        if ("ul" in b)
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted marker:text-gold">
              {b.ul.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          );
        if ("note" in b) return <p key={i} className="rounded-2xl bg-gold-soft p-4 text-[13px] leading-relaxed text-fg">{b.note}</p>;
        return <Table key={i} {...b.table} />;
      })}
    </>
  );
}

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = policyLang((await searchParams).lang);
  const p = policies[lang];

  return (
    <div lang={lang} className="min-h-svh bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoImage size={28} className="h-7 w-7 object-contain" />
            <span className="text-sm font-semibold text-fg">ArrStudio</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-1 text-sm text-muted hover:text-fg sm:flex">
              <ArrowLeft size={14} /> {p.backLabel}
            </Link>
            <nav aria-label="Language" className="flex max-w-[56vw] overflow-x-auto rounded-full bg-surface-2 p-0.5 text-xs font-medium">
              {(Object.keys(policyLangNames) as PolicyLang[]).map((l) => (
                <Link
                  key={l}
                  href={`/privacy?lang=${l}`}
                  hrefLang={l}
                  aria-current={l === lang ? "true" : undefined}
                  className={`rounded-full px-2.5 py-1 transition-colors ${l === lang ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg"}`}
                >
                  {policyLangNames[l]}
                </Link>
              ))}
            </nav>
            <ThemeToggle className="h-8 w-8" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-14">
        <aside className="min-w-0 lg:sticky lg:top-20 lg:h-[calc(100svh-6rem)] lg:overflow-y-auto">
          <nav aria-label={p.tocLabel}>
            <p className="mb-2 text-xs font-medium text-dim">{p.tocLabel}</p>
            <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
              {p.sections.map((s) => (
                <li key={s.id} className="shrink-0">
                  <a href={`#${s.id}`} className="block rounded-md px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 max-w-3xl">
          <h1 className="text-display text-4xl text-fg sm:text-5xl">{p.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{p.subtitle}</p>
          <p className="mt-4 text-[13px] text-dim">
            {p.updatedLabel}: <time dateTime={LEGAL.updated}>{dateFmt(LEGAL.updated, lang)}</time>
          </p>

          <div className="mt-10 space-y-12">
            {p.sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id} className="space-y-4">
                <h2 id={s.id} className="scroll-mt-20 text-xl font-semibold tracking-[-0.01em] text-fg sm:text-2xl">{s.title}</h2>
                <Blocks blocks={s.blocks} />
                {s.id === "contact" && (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    <li>
                      <a href={CONTACT.discord} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-fg transition-colors hover:bg-surface-2/70">
                        <MessageCircle size={18} className="text-gold" /> {p.contactLabels.discord}
                      </a>
                    </li>
                    <li>
                      <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-fg transition-colors hover:bg-surface-2/70">
                        <MessageCircle size={18} className="text-gold" /> {p.contactLabels.whatsapp}
                      </a>
                    </li>
                    {LEGAL.email && (
                      <li>
                        <a href={`mailto:${LEGAL.email}`} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-fg transition-colors hover:bg-surface-2/70">
                          <Mail size={18} className="text-gold" /> {p.contactLabels.email}: {LEGAL.email}
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
