"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
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
 * Garis stabilo kuning yang meluncur di bawah link: ikut kursor saat hover,
 * kembali ke section aktif saat kursor keluar. Satu bingkai saja — tanpa kartu di dalam kartu.
 */
function NavLinks({ active, labels }: { active: string | null; labels: Dictionary["nav"] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const target = hover ?? active;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = target ? list.querySelector<HTMLElement>(`[data-key="${target}"]`) : null;
      // ukur <li> (offsetParent-nya <ul>), bukan <a> yang offsetParent-nya <li>
      const item = el?.parentElement;
      setPill(item ? { left: item.offsetLeft, width: item.offsetWidth } : null);
    };
    measure();
    // lebar link berubah saat font selesai dimuat / ukuran layar berubah
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [target]);

  return (
    <ul ref={listRef} onMouseLeave={() => setHover(null)} className="relative flex items-center gap-1">
      <li
        aria-hidden
        className={`pointer-events-none absolute bottom-0.5 h-1 rounded-full bg-brand transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${pill ? "opacity-100" : "opacity-0"}`}
        // selebar teks saja (dikurangi padding link 14px per sisi)
        style={{ left: (pill?.left ?? 0) + 14, width: Math.max(0, (pill?.width ?? 0) - 28) }}
      />
      {navLinks.map((l) => {
        const id = l.href.slice(1);
        const on = target === id;
        return (
          <li key={l.href} className="relative">
            <a
              href={l.href}
              data-key={id}
              aria-current={active === id ? "true" : undefined}
              onMouseEnter={() => setHover(id)}
              onFocus={() => setHover(id)}
              onBlur={() => setHover(null)}
              className={`block px-3.5 py-2 font-display text-[15px] font-medium transition-colors duration-200 ${on ? "text-fg" : "text-muted"}`}
            >
              {labels[l.key]}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Navbar yang berubah bentuk: di puncak halaman berupa pill berbingkai stiker;
 * setelah di-scroll melebar jadi bar penuh yang menempel di atas layar. Selalu terlihat;
 * isinya tetap sejajar dengan kontainer konten.
 * Di HP menu terbuka sebagai kartu stiker.
 */
export default function Navbar({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  // sudah login? (cookie petunjuk dari server — tanpa request tambahan)
  const user = useAuthHint();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* bar: pill (atas) ⇄ bar penuh (scroll) */}
      <div
        className={`mx-auto border-ink transition-[width,max-width,margin,border-radius,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "mt-0 w-full max-w-full rounded-none border-b-2 bg-surface shadow-[0_3px_0_0_var(--ink)]"
            : "mt-4 w-[calc(100%-2rem)] max-w-[1136px] rounded-[30px] border-2 bg-surface shadow-[4px_4px_0_0_var(--ink)] sm:w-[calc(100%-4rem)]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1200px] items-center gap-4 transition-[height,padding] duration-500 ${
            scrolled ? "h-16 px-4 sm:px-8" : "h-15 pl-2.5 pr-2 sm:pl-3"
          }`}
        >
          <Logo href={`/${lang}`} />

          {/* ─── DESKTOP LINKS ─── */}
          <nav aria-label="Main" className="mx-auto hidden lg:block">
            <NavLinks active={active} labels={t} />
          </nav>

          {/* ─── ACTIONS ─── */}
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <LanguageSwitcher lang={lang} label={t.language} />
            <ThemeToggle label={t.theme} />
            {user ? (
              <AccountMenu user={user} labels={{ dashboard: t.dashboard, admin: t.admin, signOut: t.signOut }} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-full px-3 py-1.5 font-display text-[15px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg md:block"
                >
                  {t.signIn}
                </Link>
                <a href="#kits" className={buttonClass("gold", "sm", "ml-1 max-sm:hidden")}>
                  {t.getLicense}
                  <ArrowRight size={15} strokeWidth={2.5} className="transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="btn-pop ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-on-brand lg:hidden"
              aria-label={open ? t.closeMenu : t.openMenu}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={19} strokeWidth={2.5} /> : <Menu size={19} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      <Container>
        {/* ─── MOBILE MENU: kartu stiker ─── */}
        <div
          id="mobile-menu"
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden ${
            open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden px-1 pb-3">
            <div className="pop mt-3 rounded-card bg-surface p-4">
              <ul className="grid gap-1">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={close}
                      tabIndex={open ? 0 : -1}
                      className="block rounded-2xl px-4 py-2.5 font-display text-2xl font-semibold text-fg transition-colors hover:bg-brand hover:text-on-brand"
                    >
                      {t[l.key]}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
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
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
