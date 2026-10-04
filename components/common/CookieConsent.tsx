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
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl pop-lg animate-[rise-in_0.45s_cubic-bezier(0.34,1.56,0.64,1)] rounded-[24px] bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:mx-0 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="pop-sm flex h-10 w-10 shrink-0 -rotate-6 items-center justify-center rounded-xl bg-brand text-on-brand">
          <Cookie size={19} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-fg">{t.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {t.text}{" "}
            <Link href={`/privacy?lang=${lang}`} className="whitespace-nowrap text-fg underline underline-offset-2 hover:text-gold">
              {t.policy}
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => choose("necessary")}
          className="btn-pop h-10 rounded-full bg-surface font-display text-sm font-semibold text-fg"
        >
          {t.necessary}
        </button>
        <button
          type="button"
          autoFocus
          onClick={() => choose("all")}
          className="btn-pop h-10 rounded-full bg-brand font-display text-sm font-semibold text-on-brand hover:bg-brand-hover"
        >
          {t.all}
        </button>
      </div>
    </div>
  );
}
