import type { DocumentData, Timestamp } from "firebase/firestore";
import type { LicenseDto } from "@/lib/server/licenses";
import { REBIND_COOLDOWN_DAYS, type Kit } from "./kits";

/* Konversi dokumen Firestore (client SDK) → bentuk yang dipakai UI.
   Modul kecil tanpa dependensi runtime Firebase, aman di-import dari mana saja. */

/* ─── konversi dokumen Firestore → bentuk yang dipakai UI ─── */
const iso = (t: Timestamp | null | undefined) => t?.toDate().toISOString() ?? null;

export function docToKit(id: string, d: DocumentData): Kit {
  return {
    id,
    name: d.name,
    tag: d.tag,
    tagline: d.tagline ?? "",
    description: d.description,
    version: d.version,
    price: d.price,
    status: d.status,
    icon: d.icon,
    features: d.features ?? [],
    integrations: d.integrations ?? [],
    attributes: d.attributes ?? { systems: 0, integration: 0, setup: 0 },
    configPath: d.configPath,
    rating: d.rating ?? null,
    order: d.order ?? 0,
    video: d.video ?? null,
    stats: { licenses: d.stats?.licenses ?? 0, activePlaces: d.stats?.activePlaces ?? 0 },
    updatedAt: iso(d.updatedAt),
  };
}

export function docToLicense(d: DocumentData): LicenseDto {
  const lastRebind = (d.lastRebindAt as Timestamp | null)?.toMillis();
  const next = lastRebind ? lastRebind + REBIND_COOLDOWN_DAYS * 24 * 60 * 60 * 1000 : null;
  return {
    key: d.key,
    kit: d.kit,
    kitName: d.kitName ?? d.kit,
    ownerUid: d.ownerUid,
    ownerEmail: d.ownerEmail ?? null,
    placeId: d.placeId ?? null,
    status: d.status,
    note: d.note ?? null,
    createdAt: iso(d.createdAt),
    boundAt: iso(d.boundAt),
    lastVerifiedAt: iso(d.lastVerifiedAt),
    lastKitVersion: d.lastKitVersion ?? null,
    verifyCount: d.verifyCount ?? 0,
    rebindAvailableAt: next && next > Date.now() ? new Date(next).toISOString() : null,
  };
}

