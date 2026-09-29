import { Plus } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Section, SectionHeading } from "./ui";

export default function FAQ({ t: { faq: t } }: SectionProps) {
  return (
    <Section id="faq">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            index="06"
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

        <div className="border-t border-line">
          {t.items.map((f, i) => (
            <details key={f.q} className="group border-b border-line" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-5 py-6 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-xs text-dim">0{i + 1}</span>
                <span className="flex-1 font-display text-xl font-bold uppercase tracking-wide text-fg transition-colors group-hover:text-gold md:text-2xl">
                  {f.q}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-line-strong text-gold transition-transform duration-300 group-open:rotate-45">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="pb-7 pl-9 pr-14 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
