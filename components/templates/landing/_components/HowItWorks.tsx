"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Box, Check, Download, FileCode2, Folder, KeyRound, Rocket, ShoppingBag, Terminal, type LucideIcon } from "lucide-react";
import type { SectionProps } from "@/components/type/landing";
import { Reveal } from "./Motion";
import { Muted, Section, SectionHeading } from "./ui";

/** ikon per langkah (beli → masukkan → tempel key → publish) */
const icons: LucideIcon[] = [ShoppingBag, Download, KeyRound, Rocket];
/** lama tiap langkah tampil sebelum maju otomatis */
const STEP_MS = 5000;

/* ─── MOCKUP PER LANGKAH (isi netral bahasa) ─── */
function WindowFrame({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="pop overflow-hidden rounded-card bg-surface">
      <div className="flex items-center gap-2 border-b-2 border-ink bg-surface-2 px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-brand" />
          <span className="h-3 w-3 rounded-full border-2 border-ink bg-surface" />
        </span>
        <span className="ml-1 flex items-center gap-1.5 font-mono text-xs font-semibold text-fg">
          {icon}
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const mocks: ReactNode[] = [
  // 1 · key muncul di dashboard
  <WindowFrame key="m0" icon={<KeyRound size={13} />} title="dashboard">
    <div className="flex items-center justify-between">
      <span className="font-display text-lg font-semibold text-fg">ClubKit Pro</span>
      <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-brand px-2.5 py-0.5 text-xs font-bold text-on-brand">
        <span className="h-1.5 w-1.5 rounded-full bg-[#241a0b]" /> Active
      </span>
    </div>
    <p className="mt-4 rounded-xl border-2 border-dashed border-line-strong bg-bg px-4 py-3 text-center font-mono text-sm font-bold tracking-wider text-fg">
      ARR-7F2K-M4QX-Q9RD
    </p>
    <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-ink bg-bg">
      <div className="h-full w-1/3 animate-[grow_0.8s_ease-out] rounded-full bg-brand origin-left" />
    </div>
  </WindowFrame>,

  // 2 · kit masuk ke Explorer Studio
  <WindowFrame key="m1" icon={<Folder size={13} />} title="Explorer">
    <ul className="space-y-1.5 font-mono text-[13px] font-semibold text-fg">
      <li className="flex items-center gap-2"><Folder size={14} className="text-dim" /> Workspace</li>
      <li className="ml-5 flex items-center gap-2 rounded-lg border-2 border-ink bg-gold-soft px-2 py-1 animate-[pop-in_0.5s_ease-out]">
        <Box size={14} /> ClubKit <span className="ml-auto rounded-full bg-brand px-1.5 text-[10px] text-on-brand">NEW</span>
      </li>
      <li className="ml-10 flex items-center gap-2"><FileCode2 size={14} className="text-dim" /> Config</li>
      <li className="ml-10 flex items-center gap-2"><FileCode2 size={14} className="text-dim" /> Server</li>
      <li className="ml-10 flex items-center gap-2"><Folder size={14} className="text-dim" /> UI</li>
    </ul>
  </WindowFrame>,

  // 3 · key ditempel di Config
  <WindowFrame key="m2" icon={<FileCode2 size={13} />} title="Config.lua">
    <pre className="font-mono text-[13px] leading-7 text-muted">
      <span className="font-semibold text-gold">return</span> {"{"}
      {"\n"}
      <span className="-mx-5 block bg-gold-soft px-5">
        {"  "}<span className="text-fg">LicenseKey</span> = <span className="text-gold">&quot;ARR-7F2K-M4QX-Q9RD&quot;</span>
        <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-[blink_1s_steps(1)_infinite] bg-fg" />
      </span>
      {"  "}<span className="text-dim italic">-- DataStore, GroupId, …</span>
      {"\n"}
      {"}"}
    </pre>
  </WindowFrame>,

  // 4 · server start → live
  <WindowFrame key="m3" icon={<Terminal size={13} />} title="Output">
    <ol className="space-y-2 font-mono text-[13px] font-semibold">
      {["License verified (0.21s)", "DataStore linked", "Group ranks mapped"].map((l, i) => (
        <li key={l} className="flex items-center gap-2 text-fg animate-[pagein_0.4s_ease-out_both]" style={{ animationDelay: `${i * 150}ms` }}>
          <Check size={14} strokeWidth={3} className="text-green" /> {l}
        </li>
      ))}
      <li className="flex items-center gap-2 pt-1 animate-[pop-in_0.5s_ease-out_0.5s_both]">
        <span className="rounded-full border-2 border-ink bg-brand px-2.5 py-0.5 font-display text-xs font-bold text-on-brand">LIVE</span>
        <span className="text-muted">Ready in 0.84s</span>
      </li>
    </ol>
  </WindowFrame>,
];

/**
 * Stepper interaktif: daftar langkah di kiri (klik untuk memilih, maju otomatis
 * dengan bar progres, berhenti saat di-hover), mockup langkah aktif di kanan.
 */
export default function HowItWorks({ t: { setup: t } }: SectionProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = t.steps.length;

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % count), STEP_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, count]);

  return (
    <Section id="setup" tone="tile" waves="top">
      <SectionHeading index={2} label={t.eyebrow} title={<>{t.titleA} <Muted>{t.titleGold}</Muted></>} />

      <Reveal>
        <div
          className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* ─── DAFTAR LANGKAH ─── */}
          <ol className="grid gap-3" role="tablist" aria-label={t.eyebrow}>
            {t.steps.map((s, i) => {
              const Icon = icons[i % icons.length];
              const on = i === active;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="setup-panel"
                    onClick={() => setActive(i)}
                    className={`group relative flex w-full items-start gap-4 overflow-hidden rounded-card border-2 p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 sm:p-5 ${
                      on
                        ? "border-ink bg-surface shadow-[4px_4px_0_0_var(--ink)]"
                        : "border-transparent hover:border-ink/30 hover:bg-surface/60"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-ink transition-[background-color,transform] duration-300 ${
                        on ? "-rotate-6 bg-brand text-on-brand" : "bg-surface text-fg group-hover:-rotate-3"
                      }`}
                    >
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 t-card text-fg">
                        <span className="text-sm text-dim tabular-nums">0{i + 1}</span>
                        {s.title}
                      </span>
                      <span
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                      >
                        <span className="overflow-hidden">
                          <span className="block pt-1.5 text-[15px] leading-relaxed text-muted">{s.desc}</span>
                        </span>
                      </span>
                    </span>

                    {/* progres maju otomatis */}
                    {on && (
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-gold-soft">
                        <span
                          key={`${active}-${paused}`}
                          className="block h-full origin-left bg-brand"
                          style={{
                            animation: paused ? "none" : `step-progress ${STEP_MS}ms linear both`,
                            transform: paused ? "scaleX(1)" : undefined,
                          }}
                        />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {/* ─── MOCKUP ─── */}
          <div id="setup-panel" role="tabpanel" className="relative">
            <div key={active} className="relative animate-[rise-in_0.45s_cubic-bezier(0.34,1.56,0.64,1)]">
              {mocks[active % mocks.length]}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
