"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Globe } from "lucide-react";
import { localeNames, locales, rememberLocale, type Locale } from "@/lib/i18n/config";

export default function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // tutup saat klik di luar / tekan Esc
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

  const remember = (l: Locale) => {
    rememberLocale(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium uppercase text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Globe size={16} strokeWidth={1.75} />
        {lang}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-line-strong bg-surface py-1.5 shadow-card"
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === lang}>
              <Link
                href={`/${l}`}
                hrefLang={l}
                onClick={() => remember(l)}
                className={`flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-surface-2 ${
                  l === lang ? "text-gold" : "text-fg"
                }`}
              >
                <span>
                  {localeNames[l]}
                  <span className="ml-2 font-mono text-[11px] uppercase text-dim">{l}</span>
                </span>
                {l === lang && <Check size={14} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
