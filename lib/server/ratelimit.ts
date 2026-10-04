import "server-only";
import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { ApiError, rateLimit } from "./http";

/* ============================================================
   Batas request yang dipakai BERSAMA oleh semua instance (Vercel menjalankan
   banyak instance serverless; `rateLimit` di memori hanya berlaku per instance).
   Penghitung: koleksi `rateLimits`, jendela tetap, satu dokumen per (kunci, jendela).
   Dokumen punya `expiresAt` → aktifkan TTL policy Firestore di field itu supaya terhapus otomatis:
     gcloud firestore fields ttls update expiresAt --collection-group=rateLimits --enable-ttl
   Bila Firestore error, request tetap dilewatkan (fail-open) — jangan sampai pembeli terkunci.
   ============================================================ */

const ref = (key: string, windowMs: number) => {
  const windowStart = Math.floor(Date.now() / windowMs);
  const id = createHash("sha256").update(`${key}:${windowStart}`).digest("hex").slice(0, 40);
  return { doc: db().collection("rateLimits").doc(id), expiresAt: Timestamp.fromMillis((windowStart + 2) * windowMs) };
};

const tooMany = (windowMs: number) =>
  new ApiError(429, "RATE_LIMITED", "Too many requests.", { retryAfter: Math.ceil(windowMs / 1000) });

/** Hitung satu request dan tolak (429) bila melebihi `limit` dalam `windowMs` — lintas instance */
export async function rateLimitShared(key: string, limit: number, windowMs: number) {
  rateLimit(key, limit, windowMs); // lapis cepat di memori
  try {
    const { doc, expiresAt } = ref(key, windowMs);
    const count = await db().runTransaction(async (tx) => {
      const c = ((await tx.get(doc)).data()?.count ?? 0) + 1;
      tx.set(doc, { count: c, expiresAt });
      return c;
    });
    if (count > limit) throw tooMany(windowMs);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[ratelimit] shared counter failed, allowing request", err);
  }
}

/** Untuk batas "percobaan gagal": cek tanpa menghitung… */
export async function assertNotBlocked(key: string, limit: number, windowMs: number) {
  try {
    const { doc } = ref(key, windowMs);
    if (((await doc.get()).data()?.count ?? 0) >= limit) throw tooMany(windowMs);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[ratelimit] shared check failed, allowing request", err);
  }
}

/** …lalu catat satu kegagalan */
export async function recordFailure(key: string, windowMs: number) {
  try {
    const { doc, expiresAt } = ref(key, windowMs);
    await db().runTransaction(async (tx) => {
      tx.set(doc, { count: ((await tx.get(doc)).data()?.count ?? 0) + 1, expiresAt });
    });
  } catch (err) {
    console.error("[ratelimit] couldn't record failure", err);
  }
}
