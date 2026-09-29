import { Star } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { testimonialNames } from "../_data/landing";
import { Reveal, Spotlight } from "./Motion";
import { Section, SectionHeading } from "./ui";

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2);

export default function Testimonials({ t: { testimonials: t } }: SectionProps) {
  return (
    <Section>
      <SectionHeading
        index="06"
        eyebrow={t.eyebrow}
        title={<>{t.titleA} <span className="text-gold-metal">{t.titleGold}</span></>}
      />

      {/* kutipan pertama dibuat besar, dua lainnya bertumpuk di sampingnya */}
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:grid-rows-2">
        {t.items.map((item, i) => {
          const name = testimonialNames[i];
          const featured = i === 0;
          return (
            <Reveal key={name} delay={i * 100} className={featured ? "lg:row-span-2" : ""}>
              <Spotlight
                className={`card-lift group relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 md:p-9 ${
                  featured ? "border-gold/30 bg-gold-soft" : "border-line bg-surface"
                }`}
              >
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -right-2 -top-10 select-none font-display font-bold leading-none text-gold/15 ${
                    featured ? "text-[14rem]" : "text-[9rem]"
                  }`}
                >
                  &rdquo;
                </span>
                <div className="flex gap-0.5 text-gold" aria-label="5/5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={featured ? 16 : 14} className="fill-current" />
                  ))}
                </div>
                <blockquote
                  className={`relative mt-5 flex-1 leading-snug text-fg text-pretty ${
                    featured ? "font-display text-3xl font-semibold md:text-4xl" : "text-[17px] leading-relaxed"
                  }`}
                >
                  {item.quote}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-grad font-display text-sm font-bold text-on-gold ring-4 ring-bg transition-transform duration-300 group-hover:scale-110">
                    {initials(name)}
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold uppercase tracking-wide text-fg">{name}</span>
                    <span className="block text-sm text-dim">{item.role}</span>
                  </span>
                </figcaption>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
