import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  id: () => import("./dictionaries/id").then((m) => m.default),
  fil: () => import("./dictionaries/fil").then((m) => m.default),
  ms: () => import("./dictionaries/ms").then((m) => m.default),
  vi: () => import("./dictionaries/vi").then((m) => m.default),
  th: () => import("./dictionaries/th").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();

export type { Dictionary };
