import { Quote } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { testimonialNames } from "../_data/landing";
import { Panel, Section, SectionHeading } from "./ui";

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2);

export default function Testimonials({ t: { testimonials: t } }: SectionProps) {
  return (
    <Section>
      <SectionHeading
        index="04"
        eyebrow={t.eyebrow}
        title={<>{t.titleA} <span className="text-gold-metal">{t.titleGold}</span></>}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {t.items.map((item, i) => {
          const name = testimonialNames[i];
          return (
            <Panel key={name} innerClassName="p-7">
              <figure className="flex h-full flex-col">
                <Quote size={28} className="text-gold" strokeWidth={1.5} />
                <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-fg">{item.quote}</blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-line pt-5">
                  <span className="chamfer-sm flex h-11 w-11 items-center justify-center bg-gold-grad font-display text-sm font-bold text-on-gold">
                    {initials(name)}
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold uppercase tracking-wide text-fg">{name}</span>
                    <span className="block text-sm text-dim">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Panel>
          );
        })}
      </div>
    </Section>
  );
}
