export const locales = ["en", "id", "fil", "ms", "vi", "th"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Nama bahasa dalam bahasanya sendiri */
export const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  fil: "Filipino",
  ms: "Bahasa Melayu",
  vi: "Tiếng Việt",
  th: "ไทย",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Pilih bahasa dari header Accept-Language (tanpa library tambahan) */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    // "tl" (Tagalog) dipetakan ke Filipino
    const candidate = base === "tl" ? "fil" : base;
    if (hasLocale(candidate)) return candidate;
  }
  return defaultLocale;
}

/** Ganti {placeholder} dalam string */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

/** Simpan pilihan bahasa agar proxy mengarahkan "/" ke bahasa ini */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
