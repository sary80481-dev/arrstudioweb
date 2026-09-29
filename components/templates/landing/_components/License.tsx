import { FileCode2, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import type { SectionProps } from "@/components/type/landing";
import { integrations } from "../_data/landing";
import { Reveal, Spotlight } from "./Motion";
import { Panel, Section, SectionHeading } from "./ui";

/* pewarnaan sintaks sederhana untuk mockup */
const C = ({ children }: { children: ReactNode }) => <span className="text-dim italic">{children}</span>;
const K = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-green">{children}</span>;
const N = ({ children }: { children: ReactNode }) => <span className="text-silver">{children}</span>;

const configLines: ReactNode[] = [
  <C key="c1">-- ClubKit/Config (ModuleScript)</C>,
  <><span className="text-gold">return</span> {"{"}</>,
  <span key="lic" className="-mx-4 block bg-gold-soft px-4 ring-1 ring-inset ring-gold/40">
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
    <div className="flex items-center justify-between border-b border-line px-4 py-3">
      <span className="flex items-center gap-2 font-mono text-xs text-fg">
        <span aria-hidden className="mr-1 flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
        </span>
        {icon}
        {title}
      </span>
      <span className="font-mono text-[11px] text-dim">{meta}</span>
    </div>
  );
}

export default function License({ t: { license: t } }: SectionProps) {
  return (
    <Section id="license" className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 blur-[120px]"
        style={{ background: "radial-gradient(ellipse, var(--glow), transparent 70%)" }}
      />

      <SectionHeading
        index="02"
        eyebrow={t.eyebrow}
        title={<>{t.titleA} <span className="text-gold-metal">{t.titleGold}</span></>}
        desc={t.desc}
      />

      <Reveal className="relative grid gap-5 lg:grid-cols-2">
        {/* ─── CONFIG FILE ─── */}
        <Panel className="shadow-card" innerClassName="bg-bg">
          <WindowBar icon={<FileCode2 size={14} className="text-gold" />} title="ClubKit/Config.lua" meta="Roblox Studio" />
          <pre className="overflow-x-auto px-4 py-5 font-mono text-[13px] leading-7 text-muted">
            {configLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-5 inline-block w-4 shrink-0 select-none text-right text-dim/60">{i + 1}</span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
          <p className="border-t border-line px-4 py-3 text-xs text-dim">
            {t.steps.map((s, i) => (
              <span key={s}>
                {i > 0 && " · "}
                <span className="text-gold">{"①②③"[i]}</span> {s}
              </span>
            ))}
          </p>
        </Panel>

        {/* ─── SERVER CONSOLE ─── */}
        <Panel className="shadow-card" innerClassName="flex flex-col bg-bg">
          <WindowBar icon={<Terminal size={14} className="text-gold" />} title={t.serverOutput} meta={t.onStart} />
          <ol className="flex-1 space-y-2 px-4 py-5 font-mono text-[13px] leading-6">
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
          <div className="grid grid-cols-3 border-t border-line text-center">
            {[
              ["0.21s", t.statCheck],
              ["4", t.statLinked],
              ["0", t.statEdited],
            ].map(([v, l], i) => (
              <div key={l} className={`px-2 py-4 ${i > 0 ? "border-l border-line" : ""}`}>
                <p className="font-display text-2xl font-bold text-gold-metal">{v}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-dim">{l}</p>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>

      {/* ─── INTEGRATIONS ─── */}
      <div className="relative mt-16">
        <p className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.3em] text-muted">
          {t.integratesTitle}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {integrations.map((it, i) => {
            const I = it.icon;
            return (
              <Reveal as="li" key={it.name} delay={i * 70}>
                <Spotlight className="card-lift group h-full rounded-2xl border border-line bg-surface p-5 hover:border-gold/40">
                  <div className="flex items-center justify-between">
                    <I size={22} strokeWidth={1.5} className="text-gold transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-mono text-[11px] text-dim">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-5 font-display text-lg font-bold uppercase tracking-wide text-fg">{it.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t.integrations[it.name]}</p>
                </Spotlight>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
