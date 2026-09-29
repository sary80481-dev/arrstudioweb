"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, BadgeDollarSign, KeyRound, LayoutGrid, LogOut, Menu, Package, X } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { LogoImage } from "@/components/templates/landing/_components/ui";
import { signOut } from "@/lib/auth-client";
import type { Kit, PublicStats } from "@/lib/kits";
import type { PricingSettings } from "@/lib/pricing";
import { useAllKitsSync, useLicensesSync, usePricingSync, useRealtimeAuthSync, useStatsSync } from "@/lib/realtime";
import StoreProvider from "@/lib/store/StoreProvider";
import { selectRealtime, useAppSelector } from "@/lib/store/store";

/** Semua listener realtime admin dipasang sekali di sini → Redux store */
function AdminSync() {
  useRealtimeAuthSync();
  useAllKitsSync();
  useStatsSync();
  usePricingSync();
  useLicensesSync({ all: true, max: 500 });
  return null;
}

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/kits", label: "Kits", icon: Package },
  { href: "/admin/licenses", label: "Licenses", icon: KeyRound },
  { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign },
];

export default function AdminShell({ email, kits, stats, pricing, children }: {
  email: string;
  kits: Kit[];
  stats: PublicStats;
  pricing: PricingSettings;
  children: ReactNode;
}) {
  return (
    <StoreProvider preloaded={{ catalog: { kits, live: false }, stats, pricing }}>
      <AdminSync />
      <Shell email={email}>{children}</Shell>
    </StoreProvider>
  );
}

function LiveDot() {
  const { uid, ready } = useAppSelector(selectRealtime);
  const live = !!uid;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={live ? "Realtime connected" : "Connecting"}>
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green" : ready ? "bg-red-500" : "bg-dim animate-pulse"}`} />
      {live ? "Live" : ready ? "Offline" : "Connecting"}
    </span>
  );
}

function Shell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { error } = useAppSelector(selectRealtime);
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const current = nav.find((n) => isActive(n.href));

  const logout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-2 py-1" onClick={() => setMenuOpen(false)}>
        <LogoImage size={28} className="h-7 w-7 object-contain" />
        <span className="text-sm font-semibold text-fg">ArrStudio</span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">Admin</span>
      </Link>

      <nav aria-label="Admin" className="mt-6 flex-1">
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const active = isActive(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2/60 hover:text-fg"
                  }`}
                >
                  <n.icon size={16} strokeWidth={1.75} className={active ? "text-gold" : ""} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-1 mt-8 px-2.5 text-xs text-dim">Shortcuts</p>
        <ul className="space-y-0.5">
          {[
            { href: "/", label: "View site" },
            { href: "/docs", label: "API docs" },
            { href: "/dashboard", label: "My dashboard" },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2/60 hover:text-fg"
              >
                {l.label}
                <ArrowUpRight size={14} className="text-dim" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-line px-1 pt-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-soft text-xs font-semibold text-gold">
          {email.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{email}</span>
        <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="rounded-md p-1.5 text-dim hover:bg-surface-2 hover:text-fg">
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-bg lg:grid lg:grid-cols-[232px_1fr]">
      {/* sidebar desktop */}
      <aside className="sticky top-0 hidden h-svh border-r border-line bg-surface/50 p-3 lg:block">{sidebar}</aside>

      {/* sidebar mobile (sheet) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/50" />
          <aside className="relative h-full w-64 border-r border-line bg-surface p-3">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0">
        {/* top bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open menu"
            className="-ml-1.5 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="text-dim">Admin</span>
            <span className="text-dim">/</span>
            <span className="truncate font-medium text-fg">{current?.label ?? "Overview"}</span>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LiveDot />
            <ThemeToggle className="h-8 w-8" />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-[13px] text-red-500">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              Realtime connection failed: {error}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
