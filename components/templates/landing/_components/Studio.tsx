import type { SectionProps } from "@/components/type/landing";
import { STUDIO_URL } from "../_data/landing";
import { Reveal } from "./Motion";
import { SitePreview } from "./SitePreview";
import { Eyebrow, MoreLink, Muted, Section } from "./ui";

/** Produk saudara — HTML → Roblox UI converter, sebagai satu tile produk */
export default function Studio({ t: { studio: t } }: SectionProps) {
  return (
    <Section id="studio" className="pt-0! md:pt-0!">
      <Reveal className="overflow-hidden rounded-[28px] bg-surface-2 px-5 pt-14 text-center sm:px-10 md:pt-20">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h2 className="text-display mx-auto mt-3 max-w-3xl text-[2.5rem] text-fg sm:text-6xl">
          {t.titleA} <Muted>{t.titleGold}</Muted>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{t.desc}</p>
        <MoreLink href={STUDIO_URL} className="mt-6">{t.open}</MoreLink>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
          {t.features.map((f) => (
            <li key={f} className="rounded-full bg-bg px-4 py-2 text-sm text-muted">{f}</li>
          ))}
        </ul>

        <div className="mx-auto mt-14 max-w-5xl translate-y-px">
          <SitePreview
            url={STUDIO_URL}
            title="ARRR Studio — HTML to Roblox UI Converter"
            poster="/previews/arrr-studio.png"
            hint={t.hint}
            className="rounded-b-none!"
          />
        </div>
      </Reveal>
    </Section>
  );
}
