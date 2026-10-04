/** Kode diskon — dokumen Firestore `discounts/{KODE}`, diatur di /admin/discounts */
export type DiscountType = "percent" | "fixed";
export type DiscountScope = "all" | "kit" | "bundle";

export const DISCOUNT_CODE_PATTERN = /^[A-Z0-9_-]{3,24}$/;

/** harga minimum yang boleh ditagihkan (batas yang sama dengan createOrder) */
export const MIN_CHARGE = 1000;

export interface Discount {
  code: string;
  type: DiscountType;
  /** persen (1–100) atau nominal Rupiah, tergantung `type` */
  value: number;
  appliesTo: DiscountScope;
  active: boolean;
  /** 0 = tanpa batas */
  maxUses: number;
  usedCount: number;
  /** ISO string, null = tidak kedaluwarsa */
  expiresAt: string | null;
}

/** Potongan dalam Rupiah — tidak pernah membuat total di bawah MIN_CHARGE */
export function discountAmount(base: number, d: Pick<Discount, "type" | "value">): number {
  const raw = d.type === "percent" ? Math.floor((base * d.value) / 100) : d.value;
  return Math.max(0, Math.min(raw, base - MIN_CHARGE));
}
