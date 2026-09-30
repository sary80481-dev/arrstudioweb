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
import { Container, Logo, buttonClass } from "./ui";

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

/**
 * Bar tipis ala halaman produk: transparan & gelap di atas hero sinematik,
 * lalu kaca buram mengikuti tema setelah scroll. Tanpa garis bawah.
 */
export default function Navbar({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  // sudah login? (cookie petunjuk dari server — tanpa request tambahan)
  const user = useAuthHint();

  useEffect(() => {
    // hero setinggi layar → navbar tetap "gelap transparan" sampai hero hampir lewat
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
      data-theme={solid ? undefined : "dark"}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "bg-bg/80 backdrop-blur-xl backdrop-saturate-150" : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      <Container className="flex h-14 items-center gap-6">
        <Logo href={`/${lang}`} />

        {/* ─── DESKTOP LINKS ─── */}
        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`text-[13px] transition-colors ${isActive ? "text-fg" : "text-muted hover:text-fg"}`}
                  >
                    {t[l.key]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ─── ACTIONS ─── */}
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <LanguageSwitcher lang={lang} label={t.language} />
          <ThemeToggle label={t.theme} />
          {user ? (
            <AccountMenu user={user} labels={{ dashboard: t.dashboard, admin: t.admin, signOut: t.signOut }} />
          ) : (
            <>
              <Link href="/login" className="hidden px-3 text-[13px] text-muted transition-colors hover:text-fg md:block">
                {t.signIn}
              </Link>
              <a href="#kits" className={buttonClass("gold", "sm", "h-8 px-3.5 text-[13px] max-sm:hidden")}>
                {t.getLicense}
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg transition-colors hover:bg-fg/[0.06] lg:hidden"
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </Container>

      {/* ─── MOBILE MENU: layar penuh, huruf besar ala menu ponsel ─── */}
      <div
        id="mobile-menu"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <Container className="pb-8 pt-4">
            <ul className="space-y-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className="block py-2 text-[28px] font-semibold tracking-[-0.03em] text-fg transition-colors hover:text-gold"
                  >
                    {t[l.key]}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={close} tabIndex={open ? 0 : -1} className={buttonClass("gold", "md")}>
                    <LayoutDashboard size={15} /> {user.role === "admin" ? t.admin : t.dashboard}
                  </Link>
                  <button type="button" onClick={lightSignOut} tabIndex={open ? 0 : -1} className={buttonClass("outline", "md")}>
                    <LogOut size={15} /> {t.signOut}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={close} tabIndex={open ? 0 : -1} className={buttonClass("outline", "md")}>
                    {t.signIn}
                  </Link>
                  <a href="#kits" onClick={close} tabIndex={open ? 0 : -1} className={buttonClass("gold", "md")}>
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
