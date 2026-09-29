import { BadgeDollarSign, Database, MessagesSquare, Trophy, Users } from "lucide-react";
import type { Integration, NavLink, Plan } from "@/components/type/landing";

/* Data non-teks yang statis. Kit & statistik datang dari Firestore (diatur di /admin);
   semua teks UI ada di lib/i18n/dictionaries. */

export const navLinks: NavLink[] = [
  { key: "kits", href: "#kits" },
  { key: "license", href: "#license" },
  { key: "setup", href: "#setup" },
  { key: "pricing", href: "#pricing" },
  { key: "faq", href: "#faq" },
];

/** Sistem yang sudah ada di place dan langsung dipakai oleh kit */
export const integrations: Integration[] = [
  { icon: Database, name: "DataStore" },
  { icon: Users, name: "Group ranks" },
  { icon: BadgeDollarSign, name: "Gamepasses" },
  { icon: Trophy, name: "Leaderstats" },
  { icon: MessagesSquare, name: "TextChat" },
];

export const testimonialNames = ["John D.", "Alex R.", "Michael S."];

/** Urutan sama dengan dict.pricing.plans */
export const plans: Plan[] = [
  { price: "range", href: "#kits" },
  { price: "bundle", href: "/register", highlighted: true },
  { price: "text", href: "#" },
];
