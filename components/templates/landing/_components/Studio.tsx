import { ArrowUpRight, Check } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { STUDIO_URL } from "../_data/landing";
import { Reveal } from "./Motion";
import { SitePreview } from "./SitePreview";
import { Section, SectionHeading } from "./ui";

/** Produk saudara — HTML → Roblox UI converter, dipreview live */
export default function Studio({ t: { studio: t } }: SectionProps) {
  return (
    <Section id="studio" className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHeading
            index="04"
            eyebrow={t.eyebrow}
            title={<>{t.titleA}<br /><span className="text-gold">{t.titleGold}</span></>}
            desc={t.desc}
            className="mb-8! md:mb-8!"
          />
          <Reveal delay={120}>
            <ul className="space-y-3 border-l border-line-strong pl-5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px] text-fg">
                  <Check size={16} className="mt-0.5 shrink-0 text-gold" strokeWidth={2.25} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-9 inline-flex items-center gap-2 border-b-2 border-gold pb-1 font-display text-lg font-bold uppercase tracking-[0.12em] text-fg transition-colors hover:text-gold"
            >
              {t.open}
              <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={80} className="relative">
          {/* blok emas bergeser di belakang jendela — aksen editorial, bukan glow */}
          <div aria-hidden className="absolute -bottom-5 -right-5 left-10 top-10 rounded-2xl bg-gold-grad opacity-90 lg:-right-8" />
          <SitePreview
            url={STUDIO_URL}
            title="ARRR Studio — HTML to Roblox UI Converter"
            poster="/previews/arrr-studio.png"
            hint={t.hint}
            className="relative"
          />
          <p className="relative mt-8 flex items-center gap-2 font-mono text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-green" /> {t.live}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
