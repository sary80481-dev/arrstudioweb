import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { deleteBlobs } from "./blob";

/* ============================================================
   File kit (.rbxm / .rbxmx) yang diunduh pembeli.
   Disimpan di koleksi `kitPackages` — BUKAN di dokumen `kits`, karena
   dokumen kit bisa dibaca publik lewat onSnapshot. URL file tidak pernah
   dikirim ke browser pembeli; unduhan selalu lewat /api/kits/:id/download
   yang mengecek lisensi dulu.
   ============================================================ */

export interface KitPackage {
  kitId: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt: string | null;
}

type PackageDoc = Omit<KitPackage, "uploadedAt"> & { uploadedAt?: Timestamp };

const packages = () => db().collection("kitPackages");

const toPackage = (d: PackageDoc): KitPackage => ({ ...d, uploadedAt: d.uploadedAt?.toDate().toISOString() ?? null });

export async function getPackage(kitId: string): Promise<KitPackage | null> {
  const snap = await packages().doc(kitId).get();
  return snap.exists ? toPackage(snap.data() as PackageDoc) : null;
}

/** kit id → ada file atau tidak (untuk dashboard, tanpa membocorkan URL) */
export async function packageAvailability(kitIds: string[]): Promise<Record<string, boolean>> {
  const ids = [...new Set(kitIds)];
  if (ids.length === 0) return {};
  const snaps = await db().getAll(...ids.map((id) => packages().doc(id)));
  return Object.fromEntries(snaps.map((s) => [s.id, s.exists]));
}

export async function setPackage(kitId: string, file: { url: string; fileName: string; size: number }) {
  const before = await getPackage(kitId);
  await packages().doc(kitId).set({ kitId, ...file, uploadedAt: FieldValue.serverTimestamp() });
  if (before && before.url !== file.url) await deleteBlobs([before.url]);
  return (await getPackage(kitId))!;
}

export async function removePackage(kitId: string) {
  const before = await getPackage(kitId);
  if (!before) return;
  await packages().doc(kitId).delete();
  await deleteBlobs([before.url]);
}
