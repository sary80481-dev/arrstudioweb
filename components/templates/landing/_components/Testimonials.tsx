"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { testimonialNames } from "../_data/landing";
import { Muted, Section, SectionHeading } from "./ui";

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2);

/** Kutipan dalam rel geser (snap), kartu besar — dibaca satu per satu */
export default function Testimonials({ t }: { t: Dictionary["testimonials"] }) {
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <Section className="overflow-hidden">
      <SectionHeading label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} />

      <ul
        ref={rail}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {t.items.map((item, i) => {
          const name = testimonialNames[i];
          return (
            <li key={name} className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[calc((100%-1.5rem)/2.4)]">
              <figure className="flex h-full min-h-[340px] flex-col rounded-[28px] bg-surface-2 p-8 md:p-10">
                <blockquote className="flex-1 text-2xl font-medium leading-snug tracking-[-0.02em] text-fg text-pretty">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-sm font-semibold text-fg">
                    {initials(name)}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-fg">{name}</span>
                    <span className="block text-sm text-muted">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 hidden justify-end gap-2 md:flex">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => scroll(d)}
            aria-label={d < 0 ? "Previous" : "Next"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-fg transition-colors hover:bg-fg/[0.1]"
          >
            {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        ))}
      </div>
    </Section>
  );
}
