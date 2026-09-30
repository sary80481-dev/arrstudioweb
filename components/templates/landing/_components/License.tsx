import { FileCode2, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import type { SectionProps } from "@/components/type/landing";
import { integrations } from "../_data/landing";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading } from "./ui";

/* pewarnaan sintaks sederhana untuk mockup */
const C = ({ children }: { children: ReactNode }) => <span className="text-dim italic">{children}</span>;
const K = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-green">{children}</span>;
const N = ({ children }: { children: ReactNode }) => <span className="text-silver">{children}</span>;

const configLines: ReactNode[] = [
  <C key="c1">-- ClubKit/Config (ModuleScript)</C>,
  <><span className="text-gold">return</span> {"{"}</>,
  <span key="lic" className="-mx-5 block rounded-md bg-gold-soft px-5">
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

function WindowBar({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <span className="flex items-center gap-2 font-mono text-xs text-fg">
        {icon}
        {title}
      </span>
      <span className="font-mono text-[11px] text-dim">{meta}</span>
    </div>
  );
}

/** Momen gelap di tengah halaman: cara kerja lisensi + angka performa besar */
export default function License({ t: { license: t } }: SectionProps) {
  const specs = [
    ["0.21", "s", t.statCheck],
    ["4", "", t.statLinked],
    ["0", "", t.statEdited],
  ] as const;

  return (
    <Section id="license" tone="dark" className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, rgb(232 191 98 / 0.12), transparent)" }}
      />

      <SectionHeading label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} desc={t.desc} />

      <Reveal className="relative grid gap-3 lg:grid-cols-2">
        {/* ─── CONFIG FILE ─── */}
        <div className="overflow-hidden rounded-[24px] bg-surface-2">
          <WindowBar icon={<FileCode2 size={14} className="text-gold" />} title="ClubKit/Config.lua" meta="Roblox Studio" />
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
        <div className="flex flex-col overflow-hidden rounded-[24px] bg-surface-2">
          <WindowBar icon={<Terminal size={14} className="text-gold" />} title={t.serverOutput} meta={t.onStart} />
          <ol className="flex-1 space-y-2 px-5 py-5 font-mono text-[13px] leading-6">
            {logLines.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 text-dim">[{l.tag}]</span>
                <span className={l.accent ? "font-medium text-gold" : l.ok ? "text-fg" : "text-muted"}>
                  {l.ok && <span className="mr-1.5 text-green">✓</span>}
                  {l.text}
                </span>
              </li>
            ))}
            <li aria-hidden className="h-4 w-2 animate-[blink_1s_steps(1)_infinite] bg-gold" />
          </ol>
        </div>
      </Reveal>

      {/* ─── ANGKA PERFORMA: besar, tanpa kotak ─── */}
      <Reveal>
        <dl className="mt-24 grid gap-12 text-center sm:grid-cols-3 md:mt-32">
          {specs.map(([value, unit, label]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="mt-3 text-[15px] text-muted">{label}</dt>
              <dd className="text-hero text-7xl text-fg tabular-nums md:text-8xl">
                {value}
                {unit && <span className="text-4xl text-muted md:text-5xl">{unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mx-auto mt-14 max-w-2xl text-center text-[15px] text-muted">
          {t.steps.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="text-dim"> → </span>}
              {s}
            </span>
          ))}
        </p>
      </Reveal>

      {/* ─── INTEGRASI ─── */}
      <Reveal className="mt-24 md:mt-32">
        <p className="text-center text-lg font-medium text-fg">{t.integratesTitle}</p>
        <ul className="mt-12 grid gap-x-8 gap-y-12 text-center sm:grid-cols-2 lg:grid-cols-5">
          {integrations.map((it) => {
            const I = it.icon;
            return (
              <li key={it.name} className="flex flex-col items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-gold">
                  <I size={24} strokeWidth={1.5} />
                </span>
                <p className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-fg">{it.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.integrations[it.name]}</p>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </Section>
  );
}
