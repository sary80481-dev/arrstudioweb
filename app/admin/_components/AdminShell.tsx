"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowUpRight, BadgeDollarSign, BookOpen,
  BadgePercent, Globe, KeyRound, LayoutDashboard, LayoutGrid, LogOut, Menu,
  Package, ScrollText, Users, X,
} from "lucide-react";
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
  useRealtimeAuthSync("admin");
  useAllKitsSync();
  useStatsSync();
  usePricingSync();
  useLicensesSync({ all: true, max: 500 });
  return null;
}

const nav = [
  {
    group: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutGrid },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/licenses", label: "Licenses", icon: KeyRound },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/admin/kits", label: "Kits", icon: Package },
      { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign },
      { href: "/admin/discounts", label: "Discounts", icon: BadgePercent },
    ],
  },
  {
    group: "Security",
    items: [{ href: "/admin/audit", label: "Audit log", icon: ScrollText }],
  },
];
const allNav = nav.flatMap((g) => g.items);

const shortcuts = [
  { href: "/", label: "View site", icon: Globe },
  { href: "/docs", label: "API docs", icon: BookOpen },
  { href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
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
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted"
      title={live ? "Realtime connected" : "Connecting"}
    >
      <span className="relative flex h-1.5 w-1.5">
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-green opacity-60" />}
        <span className={`relative h-1.5 w-1.5 rounded-full ${live ? "bg-green" : ready ? "bg-red-500" : "animate-pulse bg-dim"}`} />
      </span>
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
  const current = allNav.find((n) => isActive(n.href));

  // Esc menutup sheet mobile
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const logout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <LogoImage size={32} className="h-8 w-8 object-contain" />
        <span className="leading-tight">
          <span className="block font-display text-base font-bold uppercase tracking-[0.14em] text-fg">
            Arr<span className="text-gold">Studio</span>
          </span>
          <span className="block text-[11px] text-dim">Control room</span>
        </span>
      </Link>

      <nav aria-label="Admin" className="mt-7 flex-1 space-y-6 overflow-y-auto">
        {nav.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-dim">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                        active ? "bg-gold-soft font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-y-2 -left-3 w-[3px] rounded-r-full bg-gold transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                      />
                      <n.icon
                        size={16}
                        strokeWidth={1.75}
                        className={active ? "text-gold" : "text-dim transition-colors group-hover:text-fg"}
                      />
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div>
          <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-dim">Shortcuts</p>
          <ul className="space-y-0.5">
            {shortcuts.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <l.icon size={16} strokeWidth={1.75} className="text-dim" />
                  <span className="flex-1">{l.label}</span>
                  <ArrowUpRight size={13} className="text-dim opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-bg/60 p-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-grad text-xs font-bold text-on-gold">
          {email.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-fg">{email}</span>
          <span className="block text-[11px] text-dim">Administrator</span>
        </span>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-lg p-1.5 text-dim transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-bg lg:grid lg:grid-cols-[248px_1fr]">
      {/* sidebar desktop */}
      <aside className="sticky top-0 hidden h-svh border-r border-line bg-surface/60 px-3 py-4 lg:block">{sidebar}</aside>

      {/* sidebar mobile (sheet) — selalu di DOM supaya bisa beranimasi */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          // klik link apa pun di dalam sheet → tutup
          onClickCapture={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}
          className={`relative h-full w-72 max-w-[85vw] border-r border-line bg-surface px-3 py-4 shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </aside>
      </div>

      <div className="min-w-0">
        {/* top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="-ml-1.5 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link href="/admin" className="text-dim transition-colors hover:text-fg">Admin</Link>
            <span className="text-line-strong">/</span>
            <span className="truncate font-medium text-fg">{current?.label ?? "Overview"}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LiveDot />
            <ThemeToggle className="h-8 w-8" />
          </div>
        </header>

        <main key={pathname} className="mx-auto max-w-6xl animate-[pagein_0.35s_ease-out] px-4 py-6 sm:px-6 lg:py-8">
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-[13px] text-red-500">
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
