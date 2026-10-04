import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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
  const invalid = () => new ApiError(400, "INVALID_CODE", "This code isn't valid.");
  if (!DISCOUNT_CODE_PATTERN.test(code)) throw invalid();
  const snap = await discounts().doc(code).get();
  if (!snap.exists) throw invalid();
  const d = toDiscount(snap.data() as DiscountDoc);
  if (!d.active) throw invalid();
  if (d.expiresAt && new Date(d.expiresAt).getTime() < Date.now()) {
    throw new ApiError(400, "CODE_EXPIRED", "This code has expired.");
  }
  if (d.maxUses > 0 && d.usedCount >= d.maxUses) {
    throw new ApiError(400, "CODE_EXHAUSTED", "This code has reached its usage limit.");
  }
  if (d.appliesTo !== "all" && d.appliesTo !== kind) {
    throw new ApiError(400, "CODE_NOT_APPLICABLE", `This code only works for the ${d.appliesTo === "kit" ? "single kits" : "Studio bundle"}.`);
  }
  const amount = discountAmount(base, d);
  if (amount <= 0) throw new ApiError(400, "CODE_NOT_APPLICABLE", "This code doesn't reduce the price of this item.");
  return { code, amount };
}

/** Dipanggil sekali per order lunas (lihat applyPayment) */
export async function recordDiscountUse(code: string) {
  await discounts().doc(code).update({ usedCount: FieldValue.increment(1) }).catch((err) => {
    console.error("[discounts] couldn't record use", code, err);
  });
}
