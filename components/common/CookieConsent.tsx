"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { CONSENT_EVENT, consentLang, consentStrings, readConsent, saveConsent, type Consent } from "@/lib/consent";

/**
 * Banner persetujuan cookie — muncul sekali di kunjungan pertama, di semua halaman publik.
 * Kecil & tanpa dependensi; tidak menggeser tata letak (fixed). Panel admin tidak menampilkannya.
 */
export default function CookieConsent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // ditunda sebentar: banner tidak ikut berebut dengan render pertama / LCP
    const first = window.setTimeout(() => !readConsent() && setOpen(true), 800);
    // tautan "Cookie settings" di footer membuka banner lagi
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener(CONSENT_EVENT, reopen);
    };
  }, []);

  if (!open || pathname.startsWith("/admin")) return null;

  const lang = consentLang(pathname.split("/")[1] ?? "");
  const t = consentStrings[lang];
  const choose = (c: Consent) => {
    saveConsent(c);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl animate-[pagein_0.25s_ease-out] rounded-[22px] border border-line-strong bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-float sm:inset-x-auto sm:bottom-5 sm:left-5 sm:mx-0 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
          <Cookie size={18} strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">{t.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {t.text}{" "}
            <Link href={`/privacy?lang=${lang === "id" ? "id" : "en"}`} className="whitespace-nowrap text-fg underline underline-offset-2 hover:text-gold">
              {t.policy}
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => choose("necessary")}
          className="h-10 rounded-full border border-line-strong text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          {t.necessary}
        </button>
        <button
          type="button"
          autoFocus
          onClick={() => choose("all")}
          className="h-10 rounded-full bg-brand text-sm font-semibold text-on-brand transition-[background-color,transform] hover:bg-brand-hover active:scale-[0.97]"
        >
          {t.all}
        </button>
      </div>
    </div>
  );
}
