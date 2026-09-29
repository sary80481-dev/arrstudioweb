import { BadgeDollarSign, Database, MessagesSquare, Trophy, Users } from "lucide-react";
import type { Integration, NavLink, Plan } from "@/components/type/landing";

/* Data non-teks yang statis. Kit & statistik datang dari Firestore (diatur di /admin);
   semua teks UI ada di lib/i18n/dictionaries. */

export const navLinks: NavLink[] = [
  { key: "kits", href: "#kits" },
  { key: "license", href: "#license" },
  // "setup" tidak di navbar agar muat; section-nya tetap ada di halaman
  { key: "studio", href: "#studio" },
  { key: "services", href: "#services" },
  { key: "pricing", href: "#pricing" },
  { key: "faq", href: "#faq" },
];

/** Produk saudara: konverter HTML → Roblox UI (dipreview live di landing) */
export const STUDIO_URL = "https://arrrstudio.up.railway.app/";

/** Jasa pembuatan web / mobile — order diteruskan ke WhatsApp dengan pesan terisi */
export const ORDER_WHATSAPP = "6283141410446";

/** Tag teknologi per layanan — urutan sama dengan dict.services.offers */
export const serviceTags = [
  ["Next.js", "Vue", "Laravel"],
  [".NET", "Laravel", "MySQL"],
  ["Android", "iOS", "PWA"],
];

/** Portofolio yang dipreview live — urutan sama dengan dict.services.work */
export const portfolio = [
  // poster = screenshot statis di /public/previews; iframe live baru dimuat saat diklik
  { url: "https://portfoliosigit.vercel.app/", device: "desktop", poster: "/previews/portfolio-sigit.png" },
  { url: "https://penilaian-mobileteknologi.vercel.app/", device: "phone", poster: "/previews/penilaian-mobile.png" },
] as const;

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
