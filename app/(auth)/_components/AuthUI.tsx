"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

/* ============================================================
   UI auth — sebahasa dengan landing: judul besar sentence case,
   input berisi (tanpa border), tombol pill, emas hanya untuk aksi utama.
   ============================================================ */

/* ─── HEADING ─── */
export function AuthHeading({ title, desc }: { title: string; desc: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-display text-[2.2rem] text-fg sm:text-[2.6rem]">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

/* ─── INPUT ─── */
type FieldProps = { label: string; hint?: ReactNode; aside?: ReactNode } & InputHTMLAttributes<HTMLInputElement>;

const inputClass =
  "h-12 w-full rounded-2xl border-2 border-ink bg-bg px-4 text-[15px] font-semibold text-fg placeholder:font-medium placeholder:text-dim transition-shadow focus:shadow-[4px_4px_0_0_var(--brand)] focus:outline-none";

function Label({ htmlFor, children, aside }: { htmlFor?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-[15px] font-bold text-fg">
        {children}
      </label>
      {aside}
    </div>
  );
}

export function Field({ label, hint, aside, id, ...input }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id} aside={aside}>{label}</Label>
      <input id={id} className={inputClass} {...input} />
      {hint && <p className="mt-1.5 text-xs text-dim">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, hint, aside, id, ...input }: FieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <Label htmlFor={id} aside={aside}>{label}</Label>
      <div className="relative">
        <input id={id} type={shown ? "text" : "password"} className={`${inputClass} pr-11`} {...input} />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-13 items-center justify-center rounded-r-2xl text-muted transition-colors hover:text-fg"
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

const strengthTone = ["bg-red-500", "bg-red-500", "bg-brand", "bg-green", "bg-green"];

/** ?next= hanya boleh path lokal — cegah open redirect ke situs lain */
export function safeNext(raw: string | null): string | null {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : null;
}

export function StrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  return (
    <div className="-mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full border-2 border-ink transition-colors duration-300 ${password && i < Math.max(score, 1) ? strengthTone[score] : "bg-surface-2"}`}
          />
        ))}
      </div>
      <span className="w-16 text-right text-xs font-bold text-muted">{password ? labels[score] : ""}</span>
    </div>
  );
}

/* ─── ALERT ─── */
export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-2xl border-2 px-4 py-3 text-[15px] font-semibold ${
        tone === "error" ? "border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400" : "border-green/60 bg-green/10 text-green"
      }`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      {children}
    </div>
  );
}

/* ─── SUBMIT ─── */
export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-pop flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-display text-[17px] font-semibold text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ─── DIVIDER ─── */
export function Divider({ children }: { children: ReactNode }) {
  return (
    <p className="my-5 flex items-center gap-3 text-sm font-semibold text-dim before:h-0.5 before:flex-1 before:rounded-full before:bg-line-strong after:h-0.5 after:flex-1 after:rounded-full after:bg-line-strong">{children}</p>
  );
}

/** Link ke OAuth Discord di server — bukan popup, jadi aman di mobile */
export function DiscordButton({ next = "/dashboard", label = "Continue with Discord" }: { next?: string | null; label?: string }) {
  return (
    <a
      href={`/api/auth/discord?next=${encodeURIComponent(next ?? "/dashboard")}`}
      className="btn-pop flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-surface font-display text-[17px] font-semibold text-fg hover:bg-[#5865F2]/10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="#5865F2">
        <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.36 1.22 1.99a.08.08 0 0 0 .09.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z" />
      </svg>
      {label}
    </a>
  );
}
