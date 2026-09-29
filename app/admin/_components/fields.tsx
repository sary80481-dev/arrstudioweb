"use client";

import {
  useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Plus, X } from "lucide-react";
import { KitIcon } from "@/components/common/KitIcon";
import { KIT_ICON_KEYS } from "@/lib/kits";

/* ============================================================
   UI admin — sengaja tenang & padat (alat kerja, bukan halaman promosi):
   Inter, sentence case, 13–14px, sudut rounded-md, emas hanya sebagai aksen.
   ============================================================ */

/* ─── API helper: lempar Error dengan pesan dari server ─── */
export async function api<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = data?.error;
    const issues = e?.issues?.map((i: { path: string; message: string }) => `${i.path}: ${i.message}`).join(", ");
    throw new Error([e?.message ?? `Request failed (${res.status})`, issues, e?.detail].filter(Boolean).join(" — "));
  }
  return data as T;
}

/* ─── BUTTON ─── */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
const btnVariant: Record<BtnVariant, string> = {
  primary: "bg-gold-grad text-on-gold shadow-[0_6px_16px_-8px_var(--gold)] hover:brightness-105",
  secondary: "border border-line-strong bg-surface text-fg hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "text-muted hover:bg-red-500/10 hover:text-red-500",
};

export function Btn({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: { variant?: BtnVariant; size?: "sm" | "md" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-[color,background-color,filter,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm"
      } ${btnVariant[variant]} ${className}`}
    />
  );
}

/* ─── CARD ─── */
export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.03)] ${className}`}>{children}</div>;
}

/* ─── BADGE (titik + teks) ─── */
type Tone = "green" | "amber" | "gray" | "red";
const toneClass: Record<Tone, string> = {
  green: "bg-green/10 text-green",
  amber: "bg-gold-soft text-gold",
  gray: "bg-surface-2 text-muted",
  red: "bg-red-500/10 text-red-500",
};

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/* ─── JUDUL HALAMAN ─── */
export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">{title}</h1>
        {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

/* ─── FIELD ─── */
export function FieldShell({ label, htmlFor, hint, error, children, className = "" }: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-fg">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : hint ? <p className="mt-1 text-xs text-dim">{hint}</p> : null}
    </div>
  );
}

export const controlClass =
  "w-full rounded-lg border border-line-strong bg-bg px-3 text-sm text-fg placeholder:text-dim transition-shadow focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold-soft disabled:bg-surface-2 disabled:text-muted";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-9 ${controlClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-20 py-2 leading-relaxed ${controlClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-9 ${controlClass} pr-8 ${props.className ?? ""}`} />;
}

/* ─── daftar string (fitur) ─── */
export function TagListInput({ id, value, onChange, placeholder, max = 12 }: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v) || value.length >= max) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <TextInput
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Btn onClick={add} aria-label="Add feature" className="w-9 shrink-0 px-0">
          <Plus size={15} />
        </Btn>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 space-y-1">
          {value.map((v, i) => (
            <li key={v} className="group flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1.5 text-[13px] text-fg">
              <span className="w-4 text-right text-xs tabular-nums text-dim">{i + 1}</span>
              <span className="flex-1">{v}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
                className="rounded p-0.5 text-dim opacity-60 transition hover:text-red-500 group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── pilihan ganda (checkbox list) ─── */
export function ChipGroup<T extends string>({ options, value, onChange }: {
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={`rounded-md border px-2.5 py-1 text-[13px] transition-colors ${
              on ? "border-gold/50 bg-gold-soft text-fg" : "border-line-strong text-muted hover:text-fg"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ─── segmented control ─── */
export function Segmented<T extends string>({ options, value, onChange, labels }: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="inline-flex w-full rounded-md bg-surface-2 p-0.5 sm:w-auto" role="radiogroup">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`flex-1 rounded px-3 py-1.5 text-[13px] transition-colors sm:flex-none ${
            value === o ? "bg-surface font-medium text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  );
}

/* ─── slider 0–100 ─── */
export function ScoreSlider({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-[88px_1fr_32px] items-center gap-3">
      <label htmlFor={id} className="text-[13px] text-muted">{label}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--gold)]"
      />
      <span className="text-right text-xs tabular-nums text-fg">{value}</span>
    </div>
  );
}

/* ─── pemilih ikon ─── */
export function IconPicker({ value, onChange }: { value: string; onChange: (v: (typeof KIT_ICON_KEYS)[number]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Icon">
      {KIT_ICON_KEYS.map((k) => {
        const on = value === k;
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={k}
            title={k}
            onClick={() => onChange(k)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
              on ? "border-gold bg-gold-soft text-gold" : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            <KitIcon icon={k} size={16} strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
