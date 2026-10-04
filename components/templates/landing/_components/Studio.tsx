import { Check } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { STUDIO_URL } from "../_data/landing";
import { Reveal } from "./Motion";
import { SitePreview } from "./SitePreview";
import { ChapterMark, MoreLink, Muted, Section } from "./ui";

/** Produk saudara — HTML → Roblox UI converter: teks di kiri, pratinjau di kanan */
export default function Studio({ t: { studio: t } }: SectionProps) {
  return (
    <Section id="studio">
      <Reveal>
        <ChapterMark label={t.eyebrow} index={4} className="mb-10" />
      </Reveal>
      <Reveal className="pop-lg bg-dots grid items-center gap-10 overflow-hidden rounded-panel bg-surface p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:p-14">
        <div>
          <h2 className="t-section text-fg">
            {t.titleA} <Muted>{t.titleGold}</Muted>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{t.desc}</p>

          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] font-semibold text-fg">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand text-on-brand">
                  <Check size={12} strokeWidth={3.5} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <MoreLink href={STUDIO_URL} className="mt-8">{t.open}</MoreLink>
        </div>

        <div className="lg:rotate-1 lg:transition-transform lg:duration-500 lg:hover:rotate-0">
          <SitePreview url={STUDIO_URL} title="ARRR Studio — HTML to Roblox UI Converter" poster="/previews/arrr-studio.png" hint={t.hint} />
        </div>
      </Reveal>
    </Section>
  );
}
