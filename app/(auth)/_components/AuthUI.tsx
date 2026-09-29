"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

/* ─── HEADING ─── */
export function AuthHeading({ eyebrow, title, gold, desc }: { eyebrow: string; title: string; gold: string; desc: ReactNode }) {
  return (
    <div className="mb-9">
      <p className="flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold">
        <span className="h-px w-8 bg-gold/60" />
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.9] text-fg sm:text-6xl">
        {title} <span className="text-gold-metal">{gold}</span>
      </h1>
      <p className="mt-4 text-muted">{desc}</p>
    </div>
  );
}

/* ─── INPUT ─── */
type FieldProps = { label: string; hint?: ReactNode; aside?: ReactNode } & InputHTMLAttributes<HTMLInputElement>;

const inputClass =
  "h-12 w-full border border-line-strong bg-surface px-4 text-[15px] text-fg placeholder:text-dim transition-colors focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold-soft";

export function Field({ label, hint, aside, id, ...input }: FieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </label>
        {aside}
      </div>
      <input id={id} className={inputClass} {...input} />
      {hint && <p className="mt-1.5 text-xs text-dim">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, hint, aside, id, ...input }: FieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <input id={id} type={shown ? "text" : "password"} className={`${inputClass} pr-12`} {...input} />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-dim transition-colors hover:text-gold"
        >
          {shown ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {hint}
    </div>
  );
}

/* ─── KEKUATAN PASSWORD ─── */
export function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0–4
}

export function StrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  return (
    <div className="mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 transition-colors ${i < score ? "bg-gold-grad" : "bg-surface-2"}`} />
        ))}
      </div>
      <span className="w-16 text-right text-xs text-dim">{password ? labels[score] : ""}</span>
    </div>
  );
}

/* ─── ALERT ─── */
export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 border px-4 py-3 text-sm ${
        tone === "error" ? "border-red-500/40 bg-red-500/10 text-red-500" : "border-green/40 bg-green/10 text-green"
      }`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      {children}
    </div>
  );
}

/* ─── SUBMIT (chamfer emas) ─── */
export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="chamfer flex h-13 w-full items-center justify-center gap-2.5 bg-gold-grad font-display text-base font-bold uppercase tracking-[0.18em] text-on-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ─── DIVIDER + GOOGLE ─── */
export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-7 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-dim">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Link ke OAuth Discord di server — bukan popup, jadi aman di mobile */
export function DiscordButton({ next = "/dashboard", label = "Continue with Discord" }: { next?: string; label?: string }) {
  return (
    <a
      href={`/api/auth/discord?next=${encodeURIComponent(next)}`}
      className="flex h-12 w-full items-center justify-center gap-3 border border-[#5865F2]/50 bg-[#5865F2]/10 text-[15px] font-medium text-fg transition-colors hover:border-[#5865F2] hover:bg-[#5865F2]/20"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="#5865F2">
        <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.36 1.22 1.99a.08.08 0 0 0 .09.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z" />
      </svg>
      {label}
    </a>
  );
}
