import type { SectionProps } from "@/components/type/landing";
import { Reveal } from "./Motion";
import { Section, SectionHeading } from "./ui";

export default function HowItWorks({ t: { setup: t } }: SectionProps) {
  return (
    <Section id="setup" className="bg-surface-2/50">
      <SectionHeading
        index="03"
        eyebrow={t.eyebrow}
        title={<>{t.titleA}<br /><span className="text-gold-metal">{t.titleGold}</span></>}
      />

      <ol className="relative grid gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-4 lg:gap-6">
        {/* rel penghubung antar langkah (desktop) */}
        <span aria-hidden className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-line-strong lg:block" />

        {t.steps.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 110} className="group relative pl-16 md:pl-0">
            {/* rel vertikal (mobile) */}
            {i < t.steps.length - 1 && (
              <span aria-hidden className="absolute bottom-[-2.5rem] left-[1.35rem] top-14 w-px bg-line-strong md:hidden" />
            )}

            <div className="absolute left-0 top-0 md:relative">
              <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-bg font-mono text-sm font-medium text-gold transition-all duration-300 group-hover:scale-110 group-hover:border-gold group-hover:bg-gold-grad group-hover:text-on-gold md:mt-8">
                {i + 1}
              </span>
            </div>

            <span
              aria-hidden
              className="pointer-events-none absolute -top-3 right-0 select-none font-display text-8xl font-bold leading-none text-fg/[0.05] transition-colors duration-500 group-hover:text-gold/15"
            >
              0{i + 1}
            </span>
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-fg md:mt-6">{s.title}</h3>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{s.desc}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
