"use client";

import { CONSENT_EVENT, consentLang, consentStrings } from "@/lib/consent";

/** Tautan footer untuk membuka kembali banner cookie */
export default function CookieSettingsLink({ lang }: { lang: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(CONSENT_EVENT))} className="transition-colors hover:text-fg">
      {consentStrings[consentLang(lang)].settings}
    </button>
  );
}
