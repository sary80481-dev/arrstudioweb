import { ArrowUpRight, MessageCircleQuestion, Plus } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { DISCORD_INVITE } from "@/lib/links";
import { Reveal } from "./Motion";
import { ChapterMark, Muted, Section } from "./ui";

/** Dua kolom: judul + kartu bantuan (sticky) di kiri, pertanyaan bernomor di kanan */
export default function FAQ({ t: { faq: t } }: SectionProps) {
  return (
    <Section id="faq">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <ChapterMark label={t.eyebrow} index={8} />
          <h2 className="t-section mt-6 text-fg">
            {t.titleA} <Muted>{t.titleGold}</Muted>
          </h2>

          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noreferrer"
            className="group pop pop-hover mt-8 flex items-center gap-4 rounded-card bg-surface p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-[#5865F2] text-white transition-transform group-hover:-rotate-6">
              <MessageCircleQuestion size={22} strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-muted">{t.stillStuck}</span>
              <span className="block font-display text-lg font-semibold text-fg">{t.askDiscord}</span>
            </span>
            <ArrowUpRight size={20} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>

        <Reveal delay={100} className="space-y-4">
          {t.items.map((f, i) => (
            <details key={f.q} className="group pop rounded-card bg-surface transition-colors open:bg-gold-soft" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-4 p-5 text-left md:px-6 [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-bg font-display text-sm font-bold text-fg tabular-nums transition-colors group-open:bg-brand group-open:text-on-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="t-card flex-1 text-fg">{f.q}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface text-fg transition-transform duration-300 group-open:rotate-45">
                  <Plus size={18} strokeWidth={2.5} />
                </span>
              </summary>
              <p className="-mt-1 pb-6 pl-[4.5rem] pr-6 text-base leading-relaxed text-muted md:pl-[4.75rem] md:pr-14">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
