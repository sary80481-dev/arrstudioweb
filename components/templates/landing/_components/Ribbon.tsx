import type { CSSProperties } from "react";
import type { Kit } from "@/lib/kits";
import { integrations } from "../_data/landing";
import { Sparkle } from "./ui";

/** Satu baris pita: isi digandakan 2× agar geser -50% menyambung tanpa jeda */
function Track({ words, duration, reverse = false }: { words: string[]; duration: number; reverse?: boolean }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <li key={`${w}-${i}`} className="flex items-center gap-6 pr-6 font-display text-xl font-semibold whitespace-nowrap md:text-2xl">
          {w}
          <Sparkle size={18} />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={`marquee flex w-max will-change-transform ${reverse ? "[animation-direction:reverse]" : ""}`}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      {row(false)}
      {row(true)}
    </div>
  );
}

/**
 * Dua pita bersilang (kuning & krem) berisi nama kit + sistem yang didukung.
 * Murni dekoratif-informatif; bergerak terus, berhenti total bila reduced-motion.
 */
export default function Ribbon({ kits }: { kits: Kit[] }) {
  const names = kits.filter((k) => k.status === "active").map((k) => k.name);
  const words = [...names, ...integrations.map((i) => i.name)];
  // pastikan satu baris cukup panjang untuk lebar layar besar
  const filled = words.length ? Array.from({ length: Math.ceil(12 / words.length) }, () => words).flat() : [];
  if (filled.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-bg py-10 md:py-14">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-2 border-y-2 border-ink bg-surface py-3 text-fg/20">
        <Track words={filled} duration={50} reverse />
      </div>
      <div className="relative -rotate-2 border-y-2 border-ink bg-brand py-3 text-on-brand shadow-[0_5px_0_0_var(--ink)] [margin-inline:-5%]">
        <Track words={filled} duration={40} />
      </div>
    </div>
  );
}
