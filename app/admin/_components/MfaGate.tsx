"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, Loader2, LogOut, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { signOut } from "@/lib/auth-client";
import { Btn, Card, FieldShell, TextInput, api } from "./fields";

/* Layar penghalang 2FA: tampil menggantikan seluruh panel admin sampai kode benar.
   Belum terdaftar → daftar (QR → kode pertama → kode cadangan). Sudah → masukkan kode. */

export default function MfaGate({ enrolled, email }: { enrolled: boolean; email: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"verify" | "intro" | "scan" | "backup">(enrolled ? "verify" : "intro");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [backups, setBackups] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    return run(async () => {
      await api("POST", "/api/admin/mfa/verify", { code });
      router.refresh();
    });
  };

  const begin = () =>
    run(async () => {
      setSetup(await api<{ secret: string; qr: string }>("POST", "/api/admin/mfa/setup"));
      setCode("");
      setPhase("scan");
    });

  const enable = (e: React.FormEvent) => {
    e.preventDefault();
    return run(async () => {
      const r = await api<{ backupCodes: string[] }>("POST", "/api/admin/mfa/enable", { code });
      setBackups(r.backupCodes);
      setPhase("backup");
    });
  };

  const download = () => {
    const blob = new Blob([`ArrStudio admin backup codes (${email})\n\n${backups.join("\n")}\n\nEach code works once.\n`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "arrstudio-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const logout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <ThemeToggle />
        <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg">
          <LogOut size={16} />
        </button>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">
          <ShieldCheck size={24} strokeWidth={1.7} />
        </span>

        {phase === "verify" && (
          <form onSubmit={verify}>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">Two-factor check</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">Enter the 6-digit code from your authenticator app to open the admin panel.</p>
            <FieldShell label="Code" htmlFor="mfa-code" className="mt-6" hint="Lost your phone? Use one of your backup codes instead.">
              <TextInput
                id="mfa-code"
                autoFocus
                autoComplete="one-time-code"
                inputMode="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123 456"
                className="h-11 text-center font-mono text-lg tracking-widest"
                maxLength={16}
              />
            </FieldShell>
            {error && <p role="alert" className="mt-3 text-[13px] text-red-500">{error}</p>}
            <Btn type="submit" variant="primary" disabled={busy || code.trim().length < 6} className="mt-5 h-11 w-full">
              {busy && <Loader2 size={15} className="animate-spin" />} Verify
            </Btn>
          </form>
        )}

        {phase === "intro" && (
          <>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">Secure your admin account</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Admin access needs two-factor authentication. You&apos;ll link an authenticator app (Google Authenticator, Authy, 1Password…) and get backup codes. It takes about a minute.
            </p>
            {error && <p role="alert" className="mt-3 text-[13px] text-red-500">{error}</p>}
            <Btn variant="primary" onClick={begin} disabled={busy} className="mt-6 h-11 w-full">
              {busy && <Loader2 size={15} className="animate-spin" />} Set up now
            </Btn>
          </>
        )}

        {phase === "scan" && setup && (
          <form onSubmit={enable}>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">Scan with your app</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">Scan the QR code, then type the 6-digit code it shows.</p>
            <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- QR data URL dari server */}
              <img src={setup.qr} alt="Authenticator QR code" width={200} height={200} />
            </div>
            <p className="mt-3 break-all text-center text-xs text-dim">
              Can&apos;t scan? Enter this key: <span className="select-all font-mono text-fg">{setup.secret}</span>
            </p>
            <FieldShell label="Code from the app" htmlFor="mfa-first" className="mt-5">
              <TextInput
                id="mfa-first"
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="h-11 text-center font-mono text-lg tracking-widest"
              />
            </FieldShell>
            {error && <p role="alert" className="mt-3 text-[13px] text-red-500">{error}</p>}
            <Btn type="submit" variant="primary" disabled={busy || code.length !== 6} className="mt-5 h-11 w-full">
              {busy && <Loader2 size={15} className="animate-spin" />} Turn on 2FA
            </Btn>
          </form>
        )}

        {phase === "backup" && (
          <>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">Save your backup codes</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              If you lose your phone, each of these codes lets you in once. They&apos;re shown only now — store them somewhere safe (a password manager).
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-4 font-mono text-sm text-fg">
              {backups.map((c) => (
                <li key={c} className="select-all">{c}</li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Btn
                onClick={async () => {
                  await navigator.clipboard.writeText(backups.join("\n"));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn onClick={download}><Download size={14} /> Download</Btn>
            </div>
            <label className="mt-5 flex items-start gap-2.5 text-[13px] text-muted">
              <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 accent-[var(--gold)]" />
              I&apos;ve saved these codes somewhere safe.
            </label>
            <Btn variant="primary" disabled={!saved} onClick={() => router.refresh()} className="mt-5 h-11 w-full">
              Continue to admin
            </Btn>
          </>
        )}
      </Card>
    </div>
  );
}
