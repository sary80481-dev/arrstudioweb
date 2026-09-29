"use client";

import { useEffect } from "react";

/**
 * Set <html lang> sesuai bahasa halaman. Root layout berada di luar /[lang],
 * jadi atributnya diperbarui di client (tanpa <script> inline di dalam React).
 * Mesin pencari tetap mendapat bahasa dari hreflang (alternates) di metadata.
 */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
