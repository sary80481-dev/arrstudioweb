import "server-only";
import { FieldValue, Timestamp, type Transaction } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { DISCOUNT_CODE_PATTERN, discountAmount, type Discount } from "@/lib/discount";
import { ApiError } from "./http";

/* ============================================================
   Kode diskon. Dicek ulang di server setiap checkout; pemakaian
   (usedCount) bertambah saat order LUNAS, bukan saat dibuat.
   ============================================================ */

interface DiscountDoc extends Omit<Discount, "expiresAt"> {
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
}

const discounts = () => db().collection("discounts");

const toDiscount = (d: DiscountDoc): Discount => ({
  code: d.code,
  type: d.type,
  value: d.value,
  appliesTo: d.appliesTo,
  active: d.active,
  maxUses: d.maxUses,
  usedCount: d.usedCount ?? 0,
  expiresAt: d.expiresAt ? d.expiresAt.toDate().toISOString() : null,
});

export const normalizeCode = (raw: string) => raw.trim().toUpperCase();

export async function listDiscounts(): Promise<Discount[]> {
  const snap = await discounts().orderBy("createdAt", "desc").get();
  return snap.docs.map((s) => toDiscount(s.data() as DiscountDoc));
}

export async function createDiscount(input: Omit<Discount, "usedCount">): Promise<Discount> {
  const ref = discounts().doc(input.code);
  const doc: Omit<DiscountDoc, "createdAt"> & { createdAt: FieldValue } = {
    ...input,
    usedCount: 0,
    expiresAt: input.expiresAt ? Timestamp.fromDate(new Date(input.expiresAt)) : null,
    createdAt: FieldValue.serverTimestamp(),
  };
  try {
    await ref.create(doc);
  } catch (err) {
    if ((err as { code?: unknown }).code === 6) throw new ApiError(409, "CODE_EXISTS", "That code already exists.");
    throw err;
  }
  return toDiscount((await ref.get()).data() as DiscountDoc);
}

export async function updateDiscount(
  code: string,
  patch: { active?: boolean; maxUses?: number; expiresAt?: string | null }
): Promise<Discount> {
  const ref = discounts().doc(code);
  if (!(await ref.get()).exists) throw new ApiError(404, "CODE_NOT_FOUND", "Discount code not found.");
  const { expiresAt, ...rest } = patch;
  await ref.update({
    ...rest,
    ...(expiresAt !== undefined && { expiresAt: expiresAt ? Timestamp.fromDate(new Date(expiresAt)) : null }),
  });
  return toDiscount((await ref.get()).data() as DiscountDoc);
}

export async function deleteDiscount(code: string) {
  await discounts().doc(code).delete();
}

/**
 * Validasi kode untuk item tertentu & hitung potongan. Pesan error sengaja
 * generik per alasan agar mudah ditampilkan ke pembeli.
 */
export async function resolveDiscount(
  rawCode: string,
  kind: "kit" | "bundle",
  base: number
): Promise<{ code: string; amount: number }> {
  const code = normalizeCode(rawCode);
  const invalid = () => new ApiError(400, "INVALID_CODE", "This code isn't valid or has expired.");
  if (!DISCOUNT_CODE_PATTERN.test(code)) throw invalid();
  const snap = await discounts().doc(code).get();
  if (!snap.exists) throw invalid();
  const d = toDiscount(snap.data() as DiscountDoc);
  if (!d.active) throw invalid();
  // kedaluwarsa / habis dijawab sama dengan "tidak ada" supaya kode tidak bisa ditebak-tebak
  if (d.expiresAt && new Date(d.expiresAt).getTime() < Date.now()) throw invalid();
  if (d.maxUses > 0 && d.usedCount >= d.maxUses) throw invalid();
  if (d.appliesTo !== "all" && d.appliesTo !== kind) {
    throw new ApiError(400, "CODE_NOT_APPLICABLE", `This code only works for the ${d.appliesTo === "kit" ? "single kits" : "Studio bundle"}.`);
  }
  const amount = discountAmount(base, d);
  if (amount <= 0) throw new ApiError(400, "CODE_NOT_APPLICABLE", "This code doesn't reduce the price of this item.");
  return { code, amount };
}

/** order pending selebihnya dianggap gugur (sama dengan kedaluwarsa Snap) */
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Dipanggil DI DALAM transaksi pembuatan order: kuota = sudah lunas + order yang masih menunggu bayar.
 * Dengan begitu beberapa pembeli yang checkout bersamaan tidak bisa melewati `maxUses`.
 */
export async function assertCapacity(tx: Transaction, code: string, extra = 1) {
  const snap = await tx.get(discounts().doc(code));
  const d = snap.exists ? toDiscount(snap.data() as DiscountDoc) : null;
  if (!d || !d.active || d.maxUses <= 0) return;
  const orders = await tx.get(db().collection("orders").where("discountCode", "==", code));
  const cutoff = Date.now() - PENDING_TTL_MS;
  const inFlight = orders.docs.filter((o) => {
    const v = o.data() as { status: string; createdAt?: Timestamp };
    return (v.status === "pending" || v.status === "fulfilling") && (v.createdAt?.toMillis() ?? Date.now()) > cutoff;
  }).length;
  if (d.usedCount + inFlight + extra > d.maxUses) throw new ApiError(400, "INVALID_CODE", "This code isn't valid or has expired.");
}

/**
 * Admin menerbitkan lisensi (cicilan) dengan kode: validasi kode terhadap total, pastikan kuota cukup untuk
 * `count` lisensi, lalu kembalikan potongan per lisensi. Pemakaian dicatat terpisah (recordDiscountUse) setelah lisensi terbit.
 */
export async function checkDiscountForIssue(rawCode: string, base: number, count: number) {
  const r = await resolveDiscount(rawCode, "kit", base);
  await db().runTransaction((tx) => assertCapacity(tx, r.code, count));
  return r;
}

/** Dipanggil sekali per order lunas (lihat applyPayment), atau `n` kali untuk lisensi yang diterbitkan admin */
export async function recordDiscountUse(code: string, n = 1) {
  await discounts().doc(code).update({ usedCount: FieldValue.increment(n) }).catch((err) => {
    console.error("[discounts] couldn't record use", code, err);
  });
}
