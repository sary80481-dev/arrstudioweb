import type { SectionProps } from "@/components/type/landing";
import { Section, SectionHeading } from "./ui";

export default function HowItWorks({ t: { setup: t } }: SectionProps) {
  return (
    <Section id="setup" className="border-y border-line bg-surface/40">
      <SectionHeading
        index="03"
        eyebrow={t.eyebrow}
        title={<>{t.titleA}<br /><span className="text-gold-metal">{t.titleGold}</span></>}
      />

      <ol className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((s, i) => (
          <li key={s.title} className="group relative bg-bg p-7 transition-colors hover:bg-surface md:p-8">
            <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold-grad transition-transform duration-500 group-hover:scale-x-100" />
            <span className="font-display text-7xl font-bold leading-none text-gold-metal opacity-90">
              0{i + 1}
            </span>
            <h3 className="mt-8 font-display text-2xl font-bold uppercase tracking-wide text-fg">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.desc}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
