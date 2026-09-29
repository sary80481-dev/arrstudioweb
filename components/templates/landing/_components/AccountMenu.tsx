"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { clearAuthHint, type AuthHint } from "@/lib/auth-hint";

export interface AccountLabels {
  dashboard: string;
  admin: string;
  signOut: string;
}

/** Logout ringan — tanpa memuat Firebase SDK di landing */
export async function lightSignOut() {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
  clearAuthHint();
  window.location.reload();
}

/** Menu akun di navbar landing (tampil setelah login) */
export default function AccountMenu({ user, labels }: { user: AuthHint; labels: AccountLabels }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-fg transition-colors hover:bg-surface-2";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 py-1 pl-1 pr-1.5 text-fg transition-colors hover:text-gold"
      >
        <span className="chamfer-sm flex h-8 w-8 items-center justify-center bg-gold-grad font-display text-sm font-bold text-on-gold">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[120px] truncate font-display text-[15px] font-semibold uppercase tracking-[0.12em] md:block">
          {user.name}
        </span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 border border-line-strong bg-surface py-1.5 shadow-card">
          <p className="truncate border-b border-line px-3.5 pb-2.5 pt-1 text-xs text-dim">{user.name}</p>
          <Link role="menuitem" href="/dashboard" className={item} onClick={() => setOpen(false)}>
            <LayoutDashboard size={15} className="text-gold" /> {labels.dashboard}
          </Link>
          {user.role === "admin" && (
            <Link role="menuitem" href="/admin" className={item} onClick={() => setOpen(false)}>
              <ShieldCheck size={15} className="text-gold" /> {labels.admin}
            </Link>
          )}
          <button role="menuitem" type="button" onClick={lightSignOut} className={`${item} border-t border-line text-muted`}>
            <LogOut size={15} /> {labels.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
