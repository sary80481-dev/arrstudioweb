import { Plus } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { DISCORD_INVITE } from "@/lib/links";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading } from "./ui";

/** Pertanyaan sebagai tile abu yang terbuka di tempat — tanpa garis pemisah */
export default function FAQ({ t: { faq: t } }: SectionProps) {
  return (
    <Section id="faq">
      <SectionHeading
        label={t.eyebrow}
        title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>}
        desc={
          <>
            {t.stillStuck}{" "}
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-gold hover:underline hover:underline-offset-4">
              {t.askDiscord}
            </a>
          </>
        }
      />

      <Reveal className="mx-auto max-w-3xl space-y-2">
        {t.items.map((f, i) => (
          <details key={f.q} className="group rounded-[22px] bg-surface-2 px-6 transition-colors md:px-8" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-lg font-semibold tracking-[-0.02em] text-fg md:text-xl">{f.q}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-fg transition-transform duration-300 group-open:rotate-45">
                <Plus size={16} />
              </span>
            </summary>
            <p className="-mt-1 pb-7 pr-10 text-[17px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </Reveal>
    </Section>
  );
}
