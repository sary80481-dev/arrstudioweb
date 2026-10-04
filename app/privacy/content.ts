export { CONTACT, LEGAL } from "./shared";
export type { Block, Policy, Section } from "./shared";

import en from "./lang/en";
import fil from "./lang/fil";
import id from "./lang/id";
import ms from "./lang/ms";
import th from "./lang/th";
import vi from "./lang/vi";

export const policies = { en, id, ms, fil, vi, th } as const;
export type PolicyLang = keyof typeof policies;
export const policyLang = (v: unknown): PolicyLang => (typeof v === "string" && v in policies ? (v as PolicyLang) : "en");

/** nama bahasa dalam bahasanya sendiri, untuk pemilih bahasa */
export const policyLangNames: Record<PolicyLang, string> = {
  en: "EN",
  id: "ID",
  ms: "MS",
  fil: "FIL",
  vi: "VI",
  th: "TH",
};
