import "server-only";
import { randomInt } from "node:crypto";
import { FieldValue, Timestamp, type Query, type Transaction } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { REBIND_COOLDOWN_DAYS } from "@/lib/kits";
import { ApiError } from "./http";
import { kitUnlockKey } from "./kit-seal";
import { kitsCol, publicStatsRef } from "./kits";

export type LicenseStatus = "active" | "revoked";

export interface LicenseDoc {
  key: string;
  kit: string;
  /** nama & versi kit saat lisensi diterbitkan (untuk tampilan) */
  kitName: string;
  ownerUid: string;
  ownerEmail: string | null;
  /** null = belum pernah dipakai; place pertama yang memverifikasi akan terikat */
  placeId: string | null;
  status: LicenseStatus;
  note: string | null;
  createdAt: Timestamp;
  boundAt: Timestamp | null;
  lastRebindAt: Timestamp | null;
  lastVerifiedAt: Timestamp | null;
  lastJobId: string | null;
  lastKitVersion: string | null;
  verifyCount: number;
}

export interface LicenseDto {
  key: string;
  kit: string;
  kitName: string;
  ownerUid: string;
  ownerEmail: string | null;
  placeId: string | null;
  status: LicenseStatus;
  note: string | null;
  createdAt: string | null;
  boundAt: string | null;
  lastVerifiedAt: string | null;
  lastKitVersion: string | null;
  verifyCount: number;
  /** kapan place boleh dipindah lagi (null = sekarang boleh) */
  rebindAvailableAt: string | null;
}

const licenses = () => db().collection("licenses");
const iso = (t: Timestamp | null | undefined) => t?.toDate().toISOString() ?? null;
const COOLDOWN_MS = REBIND_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

function rebindAvailableAt(d: Pick<LicenseDoc, "lastRebindAt">): Date | null {
  if (!d.lastRebindAt) return null;
  const next = d.lastRebindAt.toMillis() + COOLDOWN_MS;
  return next > Date.now() ? new Date(next) : null;
}

export function toLicenseDto(d: LicenseDoc): LicenseDto {
  return {
    key: d.key,
    kit: d.kit,
    kitName: d.kitName ?? d.kit,
    ownerUid: d.ownerUid,
    ownerEmail: d.ownerEmail ?? null,
    placeId: d.placeId,
    status: d.status,
    note: d.note,
    createdAt: iso(d.createdAt),
    boundAt: iso(d.boundAt),
    lastVerifiedAt: iso(d.lastVerifiedAt),
    lastKitVersion: d.lastKitVersion ?? null,
    verifyCount: d.verifyCount ?? 0,
    rebindAvailableAt: rebindAvailableAt(d)?.toISOString() ?? null,
  };
}

/* ─── COUNTER REALTIME ───
   stats/public dan kits/{id}.stats diperbarui di transaksi yang sama dengan perubahan lisensi,
   jadi angka di landing & admin selalu konsisten dan langsung tampil lewat onSnapshot. */
function bumpPlaces(tx: Transaction, kitId: string, delta: 1 | -1) {
  tx.set(publicStatsRef(), { placesActive: FieldValue.increment(delta), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  tx.set(kitsCol().doc(kitId), { stats: { activePlaces: FieldValue.increment(delta) } }, { merge: true });
}

/* ─── KEY ───
   Format ARR-XXXX-XXXX-XXXX, alfabet tanpa karakter yang mirip (0/O, 1/I/L).
   12 karakter × 31 simbol ≈ 59 bit entropi. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const KEY_PATTERN = /^ARR-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

export function generateKey() {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `ARR-${group()}-${group()}-${group()}`;
}

export const normalizeKey = (key: string) => key.trim().toUpperCase();

/** Untuk log: ARR-7F2K-••••-Q9RD */
export const maskKey = (key: string) => key.replace(/^(ARR-\w{4})-\w{4}-(\w{4})$/, "$1-••••-$2");

/* ─── QUERY ─── */

export async function listLicensesForUser(uid: string): Promise<LicenseDto[]> {
  const q = await licenses().where("ownerUid", "==", uid).get();
  return q.docs
    .map((d) => d.data() as LicenseDoc)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
    .map(toLicenseDto);
}

export async function listAllLicenses(filter: { ownerUid?: string; kit?: string }, limit = 100): Promise<LicenseDto[]> {
  let q: Query = licenses();
  if (filter.ownerUid) q = q.where("ownerUid", "==", filter.ownerUid);
  if (filter.kit) q = q.where("kit", "==", filter.kit);
  const snap = await q.limit(limit).get();
  return snap.docs.map((d) => toLicenseDto(d.data() as LicenseDoc));
}

/* ─── MUTASI ─── */

export async function issueLicenses(input: { kit: string; ownerUid: string; ownerEmail: string | null; count: number; note?: string }) {
  const kitSnap = await kitsCol().doc(input.kit).get();
  if (!kitSnap.exists) throw new ApiError(404, "KIT_NOT_FOUND", "Kit not found.");
  const kitName = (kitSnap.data()?.name as string) ?? input.kit;

  const batch = db().batch();
  const keys: string[] = [];

  for (let i = 0; i < input.count; i++) {
    let key = generateKey();
    // tabrakan hampir mustahil, tapi tetap dicek
    while ((await licenses().doc(key).get()).exists) key = generateKey();
    keys.push(key);

    batch.set(licenses().doc(key), {
      key,
      kit: input.kit,
      kitName,
      ownerUid: input.ownerUid,
      ownerEmail: input.ownerEmail,
      placeId: null,
      status: "active",
      note: input.note ?? null,
      createdAt: FieldValue.serverTimestamp(),
      boundAt: null,
      lastRebindAt: null,
      lastVerifiedAt: null,
      lastJobId: null,
      lastKitVersion: null,
      verifyCount: 0,
    });
  }

  batch.set(publicStatsRef(), { licensesIssued: FieldValue.increment(input.count), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  batch.set(kitsCol().doc(input.kit), { stats: { licenses: FieldValue.increment(input.count) } }, { merge: true });
  await batch.commit();
  return keys;
}

export async function setLicenseStatus(key: string, status: LicenseStatus) {
  const ref = licenses().doc(normalizeKey(key));
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data() as LicenseDoc | undefined;
    if (!d) throw new ApiError(404, "LICENSE_NOT_FOUND", "License not found.");
    if (d.status === status) return toLicenseDto(d);

    tx.update(ref, { status });
    // place yang terikat berhenti/mulai dihitung sebagai aktif
    if (d.placeId) bumpPlaces(tx, d.kit, status === "revoked" ? -1 : 1);
    return toLicenseDto({ ...d, status });
  });
}

/** Pemilik memindahkan lisensi ke place lain (maks. sekali per cooldown) */
export async function rebindLicense(key: string, uid: string, placeId: string) {
  const ref = licenses().doc(normalizeKey(key));

  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data() as LicenseDoc | undefined;
    if (!d || d.ownerUid !== uid) throw new ApiError(404, "LICENSE_NOT_FOUND", "License not found.");
    if (d.status !== "active") throw new ApiError(403, "LICENSE_REVOKED", "This license has been revoked.");
    if (d.placeId === placeId) return toLicenseDto(d);

    const waitUntil = rebindAvailableAt(d);
    if (waitUntil) {
      throw new ApiError(429, "REBIND_COOLDOWN", `A license can move places once every ${REBIND_COOLDOWN_DAYS} days.`, {
        retryAt: waitUntil.toISOString(),
      });
    }

    const now = Timestamp.now();
    // pengikatan pertama tidak memicu cooldown, hanya pemindahan
    const patch = { placeId, boundAt: now, lastRebindAt: d.placeId ? now : d.lastRebindAt };
    tx.update(ref, patch);
    if (!d.placeId) bumpPlaces(tx, d.kit, 1);
    return toLicenseDto({ ...d, ...patch });
  });
}

/* ─── VERIFIKASI DARI SERVER ROBLOX ─── */

export interface VerifyInput {
  key: string;
  kit: string;
  /** "0" = Roblox Studio (place belum dipublish) */
  placeId: string;
  jobId?: string;
  /** versi kit yang terpasang di place (dari modul Lua) */
  version?: string;
}

export interface VerifyResult {
  valid: true;
  kit: string;
  placeId: string;
  studio: boolean;
  /** true jika verifikasi ini baru saja mengikat lisensi ke place */
  newlyBound: boolean;
  /** versi terbaru kit di katalog — kit bisa memberi tahu developer jika ada update */
  latestVersion: string | null;
  checkedAt: string;
  /** kunci pembuka modul kit yang disegel (hex) — hanya untuk place yang terikat, tidak untuk Studio */
  unlock?: string;
}

export async function verifyLicense(input: VerifyInput): Promise<VerifyResult> {
  const key = normalizeKey(input.key);
  if (!KEY_PATTERN.test(key)) throw new ApiError(400, "INVALID_KEY_FORMAT", "License key format is invalid.");

  const ref = licenses().doc(key);
  const kitRef = kitsCol().doc(input.kit);
  const studio = input.placeId === "0";

  return db().runTransaction(async (tx) => {
    const [snap, kitSnap] = await Promise.all([tx.get(ref), tx.get(kitRef)]);
    const d = snap.data() as LicenseDoc | undefined;

    if (!d) throw new ApiError(404, "INVALID_KEY", "License key does not exist.");
    if (d.status !== "active") throw new ApiError(403, "LICENSE_REVOKED", "This license has been revoked.");
    if (d.kit !== input.kit) {
      throw new ApiError(403, "WRONG_KIT", `This key is for ${d.kit}, not ${input.kit}.`);
    }

    const base = {
      valid: true as const,
      kit: d.kit,
      latestVersion: (kitSnap.data()?.version as string | undefined) ?? null,
      checkedAt: new Date().toISOString(),
    };

    // Studio: izinkan untuk testing, tapi jangan ikat & jangan hitung
    if (studio) return { ...base, placeId: d.placeId ?? "0", studio: true, newlyBound: false };

    if (d.placeId && d.placeId !== input.placeId) {
      throw new ApiError(403, "PLACE_MISMATCH", "This license is bound to a different place.", {
        boundPlaceId: d.placeId,
      });
    }

    const now = Timestamp.now();
    const newlyBound = !d.placeId;
    tx.update(ref, {
      ...(newlyBound ? { placeId: input.placeId, boundAt: now } : {}),
      lastVerifiedAt: now,
      lastJobId: input.jobId ?? null,
      lastKitVersion: input.version ?? d.lastKitVersion ?? null,
      verifyCount: FieldValue.increment(1),
    });
    if (newlyBound) bumpPlaces(tx, d.kit, 1);

    const unlock = kitUnlockKey(d.kit);
    return { ...base, placeId: input.placeId, studio: false, newlyBound, ...(unlock && { unlock }) };
  });
}
