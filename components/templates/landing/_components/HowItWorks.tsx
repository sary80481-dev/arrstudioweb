import type { SectionProps } from "@/components/type/landing";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading } from "./ui";

/** Empat langkah: angka besar redup sebagai penanda — tanpa kotak, tanpa garis */
export default function HowItWorks({ t: { setup: t } }: SectionProps) {
  return (
    <Section id="setup">
      <SectionHeading label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} />

      <ol className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 100}>
            <span className="text-hero block text-[5.5rem] text-gold/80 tabular-nums">{i + 1}</span>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-fg">{s.title}</h3>
            <p className="mt-2 text-[17px] leading-relaxed text-muted">{s.desc}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
