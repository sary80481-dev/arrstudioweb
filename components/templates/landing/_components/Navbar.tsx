"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuthHint } from "@/lib/auth-hint";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { navLinks } from "../_data/landing";
import AccountMenu, { lightSignOut } from "./AccountMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button, Container, Logo } from "./ui";

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

export default function Navbar({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  // sudah login? (cookie petunjuk dari server — tanpa request tambahan)
  const user = useAuthHint();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-bg/85 backdrop-blur-xl" : "bg-gradient-to-b from-bg/80 to-transparent"
      }`}
    >
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Logo href={`/${lang}`} />

        {/* ─── DESKTOP LINKS ─── */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {navLinks.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative block py-2 font-display text-[15px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                      isActive ? "text-gold" : "text-muted hover:text-fg"
                    }`}
                  >
                    {t[l.key]}
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-center bg-gold transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ─── ACTIONS ─── */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher lang={lang} label={t.language} />
          <ThemeToggle label={t.theme} />
          {user ? (
            <AccountMenu user={user} labels={{ dashboard: t.dashboard, admin: t.admin, signOut: t.signOut }} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden font-display text-[15px] font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg md:block"
              >
                {t.signIn}
              </Link>
              <span className="hidden sm:block">
                <Button href="#pricing">{t.getLicense}</Button>
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center text-fg lg:hidden"
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {/* garis emas bawah — muncul saat scroll */}
      <div className={`h-px hairline-gold transition-opacity duration-300 ${scrolled || open ? "opacity-60" : "opacity-0"}`} />

      {/* ─── MOBILE MENU ─── */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[73px] bg-bg transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Container className="flex h-full flex-col py-8">
          <ul className="flex-1">
            {navLinks.map((l, i) => (
              <li key={l.href} className="border-b border-line">
                <a
                  href={l.href}
                  onClick={close}
                  className="flex items-baseline gap-4 py-5 font-display text-4xl font-bold uppercase tracking-wide text-fg transition-colors hover:text-gold"
                >
                  <span className="font-mono text-xs text-dim">0{i + 1}</span>
                  {t[l.key]}
                </a>
              </li>
            ))}
          </ul>
          <div onClick={close} className="grid grid-cols-2 gap-3 pt-6">
            {user ? (
              <>
                <Button href={user.role === "admin" ? "/admin" : "/dashboard"} size="lg">
                  <LayoutDashboard size={17} /> {user.role === "admin" ? t.admin : t.dashboard}
                </Button>
                <Button variant="outline" size="lg" onClick={lightSignOut}>
                  <LogOut size={17} /> {t.signOut}
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="outline" size="lg">{t.signIn}</Button>
                <Button href="#pricing" size="lg">{t.getLicense}</Button>
              </>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}
