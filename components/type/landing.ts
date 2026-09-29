import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { IntegrationName, Kit, PublicStats } from "@/lib/kits";
import type { PricingSettings } from "@/lib/pricing";

/** Props standar untuk setiap section landing */
export interface SectionProps {
  lang: Locale;
  t: Dictionary;
  /** kit publik dari Firestore (render server); komponen client melanjutkan realtime */
  kits: Kit[];
  stats: PublicStats;
  pricing: PricingSettings;
}

export interface NavLink {
  key: "kits" | "license" | "setup" | "studio" | "services" | "pricing" | "faq";
  href: string;
}

export interface Integration {
  icon: LucideIcon;
  name: IntegrationName;
}

export interface Plan {
  /** "range" = harga kit aktif · "bundle" = dari settings/pricing · "text" = teks kamus */
  price: "range" | "bundle" | "text";
  href: string;
  highlighted?: boolean;
}
