import type { CSSProperties } from "react";
import { Quote } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { testimonialNames } from "../_data/landing";
import { Muted, Section, SectionHeading } from "./ui";

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2);

type Item = Dictionary["testimonials"]["items"][number];

function Card({ item, name, i }: { item: Item; name: string; i: number }) {
  const accent = i % 3 === 1;
  return (
    <figure
      data-theme={accent ? "light" : undefined}
      className={`pop flex h-full w-[300px] shrink-0 flex-col rounded-card p-6 text-fg transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0 sm:w-[380px] sm:p-8 ${
        accent ? "bg-dots bg-brand" : "bg-surface"
      } ${i % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
    >
      <span className="pop-sm flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-fg">
        <Quote size={20} strokeWidth={2.25} className="fill-current" />
      </span>
      <blockquote className="mt-5 flex-1 font-display text-lg font-medium leading-snug text-pretty sm:text-xl">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t-2 border-ink/15 pt-5">
        <span className="pop-sm flex h-11 w-11 items-center justify-center rounded-full bg-surface font-display text-sm font-semibold text-fg">
          {initials(name)}
        </span>
        <span>
          <span className="block font-display text-base font-semibold">{name}</span>
          <span className="block text-sm font-semibold text-muted">{item.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Kutipan dalam rel berjalan tanpa ujung — berhenti saat di-hover/fokus agar bisa dibaca */
export default function Testimonials({ t }: { t: Dictionary["testimonials"] }) {
  const items = t.items.map((item, i) => ({ item, name: testimonialNames[i] ?? "", i }));
  // isi cukup panjang untuk layar lebar, lalu digandakan untuk sambungan mulus
  const loop = items.length < 4 ? [...items, ...items] : items;

  return (
    <Section className="overflow-x-clip">
      <SectionHeading index={6} label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} />

      <div className="relative -mx-4 sm:-mx-8">
        {/* pudar di tepi — overlay gradasi, bukan mask (mask memaksa repaint tiap frame) */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-bg to-transparent sm:w-20" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-bg to-transparent sm:w-20" />
        <div
          className="marquee flex w-max py-4 will-change-transform"
          style={{ "--marquee-duration": `${loop.length * 9}s`, "--marquee-hover": "paused" } as CSSProperties}
        >
          {[false, true].map((dup) => (
            <ul key={String(dup)} aria-hidden={dup || undefined} className="flex shrink-0 items-stretch gap-6 pr-6">
              {loop.map(({ item, name }, k) => (
                <li key={`${name}-${k}`} className="flex">
                  <Card item={item} name={name} i={k} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </Section>
  );
}
