"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuthHint } from "@/lib/auth-hint";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { navLinks } from "../_data/landing";
import AccountMenu, { lightSignOut } from "./AccountMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { Container, Logo } from "./ui";

/** Section yang sedang terlihat → link aktif */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

const sectionIds = navLinks.map((l) => l.href.slice(1));

/** Tombol emas ringkas khusus navbar (Button biasa terlalu besar untuk bar 64px) */
const ctaClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gold-grad px-4 text-sm font-semibold text-on-gold shadow-[0_4px_14px_-6px_var(--gold)] transition hover:brightness-105";

export default function Navbar({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  // sudah login? (cookie petunjuk dari server — tanpa request tambahan)
  const user = useAuthHint();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const solid = scrolled || open;

  return (
    <header
      // di atas hero (selalu gelap) navbar ikut token gelap; setelah scroll kembali ke tema halaman
      data-theme={solid ? undefined : "dark"}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solid ? "border-line bg-bg/85 backdrop-blur-xl" : "border-transparent"
      }`}
    >
      <Container className="flex h-16 items-center gap-8">
        <Logo href={`/${lang}`} />

        {/* ─── DESKTOP LINKS ─── */}
        <nav aria-label="Main" className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-1">
            {navLinks.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.href} className="relative flex h-full items-center">
                  <a
                    href={l.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? "text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
                    }`}
                  >
                    {t[l.key]}
                  </a>
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ─── ACTIONS ─── */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher lang={lang} label={t.language} />
          <ThemeToggle label={t.theme} />
          <span aria-hidden className="mx-1.5 hidden h-5 w-px bg-line-strong md:block" />
          {user ? (
            <AccountMenu user={user} labels={{ dashboard: t.dashboard, admin: t.admin, signOut: t.signOut }} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-fg md:block"
              >
                {t.signIn}
              </Link>
              <a href="#pricing" className={`${ctaClass} hidden sm:inline-flex`}>
                {t.getLicense}
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-fg transition-colors hover:bg-surface-2 lg:hidden"
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {/* ─── MOBILE MENU: panel turun di bawah bar ─── */}
      <div
        id="mobile-menu"
        className={`grid border-t border-line bg-bg transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] border-transparent opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <Container className="py-4">
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className="flex items-center justify-between rounded-lg px-2 py-3 text-base font-medium text-fg transition-colors hover:bg-surface-2"
                  >
                    {t[l.key]}
                    <ChevronRight size={16} className="text-dim" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              {user ? (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={close} className={ctaClass}>
                    <LayoutDashboard size={15} /> {user.role === "admin" ? t.admin : t.dashboard}
                  </Link>
                  <button
                    type="button"
                    onClick={lightSignOut}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line-strong text-sm font-medium text-fg"
                  >
                    <LogOut size={15} /> {t.signOut}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-line-strong text-sm font-medium text-fg"
                  >
                    {t.signIn}
                  </Link>
                  <a href="#pricing" onClick={close} className={ctaClass}>
                    {t.getLicense}
                  </a>
                </>
              )}
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
