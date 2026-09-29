import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { EMPTY_STATS, slugify, type Kit, type KitInput, type PublicStats } from "@/lib/kits";
import { DEFAULT_PRICING, type PricingSettings } from "@/lib/pricing";
import { getPricing } from "./settings";
import { ApiError } from "./http";

type KitDoc = Omit<Kit, "id" | "updatedAt"> & { updatedAt?: Timestamp; createdAt?: Timestamp };

export const kitsCol = () => db().collection("kits");
export const publicStatsRef = () => db().collection("stats").doc("public");

export function toKit(id: string, d: KitDoc): Kit {
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
    stats: { licenses: d.stats?.licenses ?? 0, activePlaces: d.stats?.activePlaces ?? 0 },
    updatedAt: d.updatedAt?.toDate().toISOString() ?? null,
  };
}

export async function listKits(opts: { publicOnly?: boolean } = {}): Promise<Kit[]> {
  const snap = await kitsCol().get();
  return snap.docs
    .map((d) => toKit(d.id, d.data() as KitDoc))
    .filter((k) => !opts.publicOnly || k.status !== "draft")
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function getKit(id: string): Promise<Kit | null> {
  const snap = await kitsCol().doc(id).get();
  return snap.exists ? toKit(snap.id, snap.data() as KitDoc) : null;
}

export async function createKit(input: KitInput): Promise<Kit> {
  const id = input.id || slugify(input.name);
  const ref = kitsCol().doc(id);
  if ((await ref.get()).exists) throw new ApiError(409, "KIT_EXISTS", `A kit with id "${id}" already exists.`);

  const { id: _omit, ...data } = input;
  void _omit;
  await ref.set({
    ...data,
    stats: { licenses: 0, activePlaces: 0 },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return (await getKit(id))!;
}

export async function updateKit(id: string, patch: Partial<KitInput>): Promise<Kit> {
  const ref = kitsCol().doc(id);
  if (!(await ref.get()).exists) throw new ApiError(404, "KIT_NOT_FOUND", "Kit not found.");
  const { id: _omit, ...data } = patch;
  void _omit;
  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  return (await getKit(id))!;
}

/** Kit yang sudah punya lisensi tidak boleh dihapus — arsipkan (status draft) saja */
export async function deleteKit(id: string) {
  const kit = await getKit(id);
  if (!kit) throw new ApiError(404, "KIT_NOT_FOUND", "Kit not found.");
  if (kit.stats.licenses > 0) {
    throw new ApiError(409, "KIT_HAS_LICENSES", "This kit has licenses. Set it to Draft instead of deleting it.");
  }
  await kitsCol().doc(id).delete();
}

export async function getPublicStats(): Promise<PublicStats> {
  const snap = await publicStatsRef().get();
  const d = snap.data();
  return { licensesIssued: d?.licensesIssued ?? 0, placesActive: d?.placesActive ?? 0 };
}

/** Untuk landing (render server): kalau Firestore belum siap, tampilkan kosong — jangan crash */
export async function loadLandingData(): Promise<{ kits: Kit[]; stats: PublicStats; pricing: PricingSettings }> {
  try {
    const [kits, stats, pricing] = await Promise.all([listKits({ publicOnly: true }), getPublicStats(), getPricing()]);
    return { kits, stats, pricing };
  } catch (err) {
    console.warn("[landing] Firestore unavailable, rendering without live data:", (err as Error).message);
    return { kits: [], stats: EMPTY_STATS, pricing: DEFAULT_PRICING };
  }
}
