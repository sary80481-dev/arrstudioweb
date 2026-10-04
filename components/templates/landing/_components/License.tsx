import { FileCode2, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import type { SectionProps } from "@/components/type/landing";
import { integrations } from "../_data/landing";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading } from "./ui";

/* pewarnaan sintaks sederhana untuk mockup */
const C = ({ children }: { children: ReactNode }) => <span className="text-dim italic">{children}</span>;
const K = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-brand">{children}</span>;
const N = ({ children }: { children: ReactNode }) => <span className="text-silver">{children}</span>;

const configLines: ReactNode[] = [
  <C key="c1">-- ClubKit/Config (ModuleScript)</C>,
  <><span className="font-semibold text-brand">return</span> {"{"}</>,
  <span key="lic" className="-mx-5 block rounded-lg bg-gold-soft px-5">
    {"  "}<K>LicenseKey</K> = <S>&quot;ARR-7F2K-M4QX-Q9RD&quot;</S>,
  </span>,
  "",
  <>{"  "}<C>-- hook into what your place already uses</C></>,
  <>{"  "}<K>DataStore</K>   = <S>&quot;PlayerData_v3&quot;</S>,</>,
  <>{"  "}<K>GroupId</K>     = <N>3401192</N>,</>,
  <>{"  "}<K>Gamepasses</K>  = {"{ "}<K>VIP</K> = <N>71829301</N>, <K>DJ</K> = <N>71829455</N>{" }"},</>,
  <>{"  "}<K>Leaderstats</K> = {"{ "}<K>Currency</K> = <S>&quot;Coins&quot;</S>{" }"},</>,
  "}",
];

const logLines: { tag: string; text: string; ok?: boolean; accent?: boolean }[] = [
  { tag: "ArrStudio", text: "Verifying license ARR-7F2K-••••-Q9RD…" },
  { tag: "ArrStudio", text: "Licensed to place 13284790215 (0.21s)", ok: true },
  { tag: "ClubKit", text: 'DataStore "PlayerData_v3" linked', ok: true },
  { tag: "ClubKit", text: "Group 3401192 — 6 ranks mapped to roles", ok: true },
  { tag: "ClubKit", text: "Gamepasses VIP, DJ mapped to perks", ok: true },
  { tag: "ClubKit", text: "leaderstats.Coins bound to donations", ok: true },
  { tag: "ClubKit", text: "Ready in 0.84s", accent: true },
];

/** Panel jendela kode: selalu gelap (tampilan editor), outline + bayangan ink */
const windowClass = "overflow-hidden rounded-card border-2 border-[#241a0b] bg-surface shadow-[6px_6px_0_0_#241a0b]";

function WindowBar({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-surface-2 px-5 py-3">
      <span className="flex min-w-0 items-center gap-2 font-mono text-xs font-semibold text-fg">
        <span aria-hidden className="mr-1 flex shrink-0 gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-brand" />
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-fg/25" />
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-fg/25" />
        </span>
        {icon}
        <span className="truncate">{title}</span>
      </span>
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-dim max-sm:hidden">{meta}</span>
    </div>
  );
}

/** Momen gelap di tengah halaman: cara kerja lisensi + angka performa */
export default function License({ t: { license: t } }: SectionProps) {
  const specs = [
    ["0.21", "s", t.statCheck],
    ["4", "", t.statLinked],
    ["0", "", t.statEdited],
  ] as const;

  return (
    <Section id="license" tone="accent" className="overflow-x-clip">

      <SectionHeading index={3} label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} desc={t.desc} />

      <Reveal className="relative grid gap-6 lg:grid-cols-2">
        {/* ─── CONFIG FILE ─── */}
        <div data-theme="dark" className={windowClass}>
          <WindowBar icon={<FileCode2 size={14} className="shrink-0 text-brand" />} title="ClubKit/Config.lua" meta="Roblox Studio" />
          <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7 text-muted">
            {configLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-5 inline-block w-4 shrink-0 select-none text-right text-dim/50">{i + 1}</span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* ─── SERVER CONSOLE ─── */}
        <div data-theme="dark" className={`flex flex-col ${windowClass}`}>
          <WindowBar icon={<Terminal size={14} className="shrink-0 text-brand" />} title={t.serverOutput} meta={t.onStart} />
          <ol className="flex-1 space-y-2 px-5 py-5 font-mono text-[13px] leading-6">
            {logLines.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 text-dim">[{l.tag}]</span>
                <span className={l.accent ? "font-semibold text-brand" : l.ok ? "text-fg" : "text-muted"}>
                  {l.ok && <span className="mr-1.5 text-green">✓</span>}
                  {l.text}
                </span>
              </li>
            ))}
            <li aria-hidden className="h-4 w-2 animate-[blink_1s_steps(1)_infinite] bg-brand" />
          </ol>
        </div>
      </Reveal>

      {/* ─── ANGKA PERFORMA: kartu stiker ─── */}
      <dl className="mt-16 grid gap-5 sm:grid-cols-3 md:mt-20">
        {specs.map(([value, unit, label], i) => (
          <Reveal key={label} delay={i * 90}>
            <div className="pop flex h-full flex-col-reverse rounded-card bg-surface px-6 py-7 text-center transition-transform duration-300 hover:-translate-y-1 hover:-rotate-1">
              <dt className="mt-2 text-[15px] font-semibold text-muted">{label}</dt>
              <dd className="t-stat text-fg">
                {value}
                {unit && <span className="text-3xl text-muted md:text-4xl">{unit}</span>}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>

      {/* ─── ALUR ─── */}
      <Reveal>
        <ol className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-sm font-semibold">
          {t.steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="h-0.5 w-5 rounded-full bg-ink" />}
              <span className="rounded-full border-2 border-ink bg-surface px-3.5 py-1.5 text-fg">
                <span className="mr-1.5 font-display text-gold">{i + 1}</span>
                {s}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* ─── INTEGRASI ─── */}
      <Reveal className="mt-20 md:mt-28">
        <p className="t-sub text-fg">{t.integratesTitle}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {integrations.map((it) => {
            const I = it.icon;
            return (
              <li key={it.name} className="pop flex flex-col items-center rounded-card bg-surface px-4 py-6 text-center">
                <span className="hover-wiggle flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand text-on-brand shadow-[3px_3px_0_0_var(--ink)]">
                  <I size={24} strokeWidth={2} />
                </span>
                <p className="mt-4 t-card text-fg">{it.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.integrations[it.name]}</p>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </Section>
  );
}
