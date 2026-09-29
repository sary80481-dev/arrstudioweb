import { Plus } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Reveal } from "./Motion";
import { Section, SectionHeading } from "./ui";

export default function FAQ({ t: { faq: t } }: SectionProps) {
  return (
    <Section id="faq">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            index="08"
            eyebrow={t.eyebrow}
            title={<>{t.titleA}<br /><span className="text-gold-metal">{t.titleGold}</span></>}
            desc={
              <>
                {t.stillStuck}{" "}
                <a href="#" className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
                  {t.askDiscord}
                </a>
              </>
            }
            className="mb-0! md:mb-0!"
          />
        </div>

        <div className="space-y-3">
          {t.items.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details
                className="group rounded-2xl border border-line bg-surface px-5 transition-colors open:border-gold/40 open:bg-gold-soft hover:border-line-strong md:px-6"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-mono text-xs text-dim">0{i + 1}</span>
                  <span className="flex-1 font-display text-lg font-bold uppercase tracking-wide text-fg transition-colors group-hover:text-gold md:text-xl">
                    {f.q}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-gold transition-all duration-300 group-open:rotate-45 group-open:border-gold group-open:bg-gold-grad group-open:text-on-gold">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="pb-6 pl-8 pr-4 text-[15px] leading-relaxed text-muted md:pr-12">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
