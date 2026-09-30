import {
  CalendarClock, Crown, Flag, Gamepad2, Headphones, Mic2, Mountain, Music, PartyPopper,
  Shield, Sparkles, Trophy, Users, Wand2, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   Model kit — dipakai bersama oleh API, admin panel dan landing.
   Data kit disimpan di Firestore (koleksi `kits`), diatur dari /admin.
   ============================================================ */

export const KIT_STATUSES = ["draft", "active", "coming_soon"] as const;
export type KitStatus = (typeof KIT_STATUSES)[number];

export const KIT_STATUS_LABEL: Record<KitStatus, string> = {
  draft: "Draft",
  active: "Active",
  coming_soon: "Coming soon",
};

/** Sistem di place yang bisa disambungkan oleh kit */
export const INTEGRATIONS = ["DataStore", "Group ranks", "Gamepasses", "Leaderstats", "TextChat"] as const;
export type IntegrationName = (typeof INTEGRATIONS)[number];

/** Ikon yang bisa dipilih admin untuk sebuah kit */
export const KIT_ICONS = {
  headphones: Headphones,
  mountain: Mountain,
  music: Music,
  mic: Mic2,
  party: PartyPopper,
  calendar: CalendarClock,
  crown: Crown,
  trophy: Trophy,
  users: Users,
  shield: Shield,
  wand: Wand2,
  sparkles: Sparkles,
  zap: Zap,
  flag: Flag,
  gamepad: Gamepad2,
} satisfies Record<string, LucideIcon>;
export type KitIconKey = keyof typeof KIT_ICONS;
export const KIT_ICON_KEYS = Object.keys(KIT_ICONS) as KitIconKey[];

export const kitIcon = (key: string): LucideIcon => KIT_ICONS[key as KitIconKey] ?? Sparkles;

export interface KitAttributes {
  systems: number;
  integration: number;
  setup: number;
}

export interface KitStats {
  /** jumlah lisensi yang pernah diterbitkan untuk kit ini */
  licenses: number;
  /** lisensi aktif yang sudah terikat ke sebuah place */
  activePlaces: number;
}

/** Video showcase kit — dikompres di browser admin lalu disimpan di Vercel Blob */
export interface KitVideo {
  url: string;
  /** frame dari video sebagai gambar (webp), tampil sebelum video dimuat */
  poster: string | null;
  width: number;
  height: number;
  /** detik */
  duration: number;
  /** byte, setelah kompresi */
  size: number;
}

/** Host tempat video kit boleh berada (dicek juga di skema input) */
export const VIDEO_HOST_PATTERN = /.public.blob.vercel-storage.com$/;

/** Bentuk kit yang dikirim ke UI (tanggal sudah jadi ISO string) */
export interface Kit {
  id: string;
  name: string;
  tag: string;
  tagline: string;
  description: string;
  version: string;
  price: number;
  status: KitStatus;
  icon: KitIconKey;
  features: string[];
  integrations: IntegrationName[];
  attributes: KitAttributes;
  configPath: string;
  rating: number | null;
  order: number;
  /** slot place per lisensi single — satu key bisa dipakai di sekian place */
  placesPerLicense: number;
  video: KitVideo | null;
  stats: KitStats;
  updatedAt: string | null;
}

/** Field yang bisa diisi admin (sisanya dihitung server) */
export type KitInput = Omit<Kit, "id" | "stats" | "updatedAt"> & { id?: string };

/** Statistik global untuk landing (dokumen `stats/public`) */
export interface PublicStats {
  licensesIssued: number;
  placesActive: number;
}

export const EMPTY_STATS: PublicStats = { licensesIssued: 0, placesActive: 0 };

/* ─── HARGA (Rupiah, disimpan sebagai angka bulat) ─── */

/** 449000 → "Rp 449.000" */
export const formatIDR = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

/** 449000 → "449rb", 1500000 → "1,5jt" — untuk tampilan ringkas */
export function formatIDRShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`;
  return String(n);
}

export const KIT_ID_PATTERN =/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

/** "Summit Kit" → "summit-kit" */
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);

/** "Summit Kit" → "SummitKit/Config" */
export const defaultConfigPath = (name: string) => `${name.replace(/[^A-Za-z0-9]/g, "") || "Kit"}/Config`;

/** Kit bawaan — ditawarkan untuk diimpor saat koleksi `kits` masih kosong */
export const DEFAULT_KITS: KitInput[] = [
  {
    id: "clubkit",
    name: "ClubKit Pro",
    tag: "Clubs & hangouts",
    tagline: "Your club, fully automated.",
    description:
      "DJ booth with a shared queue, Robux donations with goals, group-rank roles, a storefront and attendance tracking — one system, one config file.",
    version: "1.2.0",
    price: 449000,
    status: "active",
    icon: "headphones",
    features: ["DJ booth & song queue", "Donation goals & top-donor board", "Roles & overhead titles", "In-game shop", "Attendance rewards"],
    integrations: ["DataStore", "Group ranks", "Gamepasses", "Leaderstats"],
    attributes: { systems: 95, integration: 90, setup: 85 },
    configPath: "ClubKit/Config",
    rating: 4.9,
    order: 1,
    placesPerLicense: 3,
    video: null,
  },
  {
    id: "summitkit",
    name: "Summit Kit",
    tag: "Live events",
    tagline: "Run launches like a festival.",
    description:
      "Stage control, lighting presets, a countdown and schedule board, and server-wide announcements for concerts, launches and community meetups.",
    version: "1.0.0",
    price: 299000,
    status: "active",
    icon: "mountain",
    features: ["Stage & lighting presets", "Countdown & schedule board", "Server-wide announcements", "VIP & staff zones", "Event attendance log"],
    integrations: ["Group ranks", "Gamepasses", "TextChat", "DataStore"],
    attributes: { systems: 85, integration: 90, setup: 92 },
    configPath: "SummitKit/Config",
    rating: 4.8,
    order: 2,
    placesPerLicense: 3,
    video: null,
  },
];

/** Slot place default per lisensi (bisa diubah per kit di /admin/kits) */
export const DEFAULT_PLACES_PER_LICENSE = 3;

/** Jeda minimum antar pelepasan place untuk satu lisensi */
export const REBIND_COOLDOWN_DAYS = 30;
