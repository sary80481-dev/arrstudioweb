import "server-only";
import { randomBytes } from "node:crypto";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { MIN_CHARGE } from "@/lib/discount";
import { ApiError } from "./http";
import { issueLicenses } from "./licenses";
import { getKit, listKits } from "./kits";
import { outcomeOf, getTransactionStatus, type MidtransStatus } from "./midtrans";
import { getPricing } from "./settings";
import { recordDiscountUse, resolveDiscount } from "./discounts";

/* ============================================================
   Order pembelian. Harga SELALU dihitung ulang di server dari Firestore —
   nilai dari browser tidak pernah dipercaya. Lisensi diterbitkan tepat
   sekali saat Midtrans menyatakan lunas (webhook atau pengecekan status).
   ============================================================ */

export type OrderStatus = "pending" | "fulfilling" | "paid" | "failed";

export type OrderItem = { type: "kit"; kitId: string } | { type: "bundle" };

interface Line {
  kit: string;
  kitName: string;
  /** jumlah license key untuk kit ini */
  count: number;
  /** slot place per key (order lama tanpa field ini = 1) */
  places?: number;
}

interface OrderDoc {
  orderId: string;
  ownerUid: string;
  ownerEmail: string;
  item: OrderItem;
  title: string;
  /** total yang ditagihkan (setelah diskon) */
  amount: number;
  /** harga sebelum diskon & potongannya; kosong di order lama */
  originalAmount?: number;
  discountCode?: string | null;
  discountAmount?: number;
  lines: Line[];
  status: OrderStatus;
  paymentType: string | null;
  licenseKeys: string[];
  createdAt: Timestamp;
  paidAt: Timestamp | null;
}

export interface OrderDto {
  orderId: string;
  title: string;
  amount: number;
  status: OrderStatus;
  paymentType: string | null;
  licenseKeys: string[];
  kits: { id: string; name: string }[];
}

const orders = () => db().collection("orders");

const toDto = (d: OrderDoc): OrderDto => ({
  orderId: d.orderId,
  title: d.title,
  amount: d.amount,
  status: d.status,
  paymentType: d.paymentType,
  licenseKeys: d.licenseKeys ?? [],
  kits: d.lines.map((l) => ({ id: l.kit, name: l.kitName })),
});

/** "ARR-LX2K9Q-7F3A" — unik, ≤50 karakter (batas order_id Midtrans) */
const newOrderId = () => `ARR-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

/** Susun isi & harga order dari data server */
async function price(item: OrderItem): Promise<{ title: string; amount: number; lines: Line[] }> {
  if (item.type === "kit") {
    const kit = await getKit(item.kitId);
    if (!kit || kit.status !== "active") throw new ApiError(404, "KIT_NOT_AVAILABLE", "This kit isn't available for purchase.");
    return {
      title: `${kit.name} — single license`,
      amount: kit.price,
      lines: [{ kit: kit.id, kitName: kit.name, count: 1, places: kit.placesPerLicense }],
    };
  }

  const pricing = await getPricing();
  if (!pricing.bundleEnabled) throw new ApiError(404, "BUNDLE_NOT_AVAILABLE", "The bundle isn't available right now.");
  const kits = (await listKits({ publicOnly: true })).filter((k) => k.status === "active");
  if (kits.length === 0) throw new ApiError(404, "KIT_NOT_AVAILABLE", "No kits are available yet.");
  return {
    title: "Studio bundle",
    amount: pricing.bundlePrice,
    // bundle = satu key per kit aktif, masing-masing berlaku untuk `bundlePlaces` place
    lines: kits.map((k) => ({ kit: k.id, kitName: k.name, count: 1, places: pricing.bundlePlaces })),
  };
}

/** Harga item + potongan kode (kalau ada) — dipakai checkout & pratinjau kode di UI */
export async function quote(item: OrderItem, code?: string | null) {
  const priced = await price(item);
  if (priced.amount < MIN_CHARGE) throw new ApiError(400, "INVALID_AMOUNT", "This item has no price set.");
  const d = code?.trim() ? await resolveDiscount(code, item.type, priced.amount) : null;
  const discount = d?.amount ?? 0;
  return { ...priced, originalAmount: priced.amount, discountCode: d?.code ?? null, discount, amount: priced.amount - discount };
}

export async function createOrder(item: OrderItem, owner: { uid: string; email: string }, code?: string | null) {
  const { title, amount, originalAmount, discountCode, discount, lines } = await quote(item, code);
  const orderId = newOrderId();
  await orders().doc(orderId).set({
    orderId,
    ownerUid: owner.uid,
    ownerEmail: owner.email,
    item,
    title,
    amount,
    originalAmount,
    discountCode,
    discountAmount: discount,
    lines,
    status: "pending",
    paymentType: null,
    licenseKeys: [],
    createdAt: FieldValue.serverTimestamp(),
    paidAt: null,
  });
  return { orderId, title, amount };
}

export async function getOrderForUser(orderId: string, uid: string): Promise<OrderDto> {
  const snap = await orders().doc(orderId).get();
  const d = snap.data() as OrderDoc | undefined;
  if (!d || d.ownerUid !== uid) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
  return toDto(d);
}

/**
 * Terapkan status Midtrans ke order. Aman dipanggil berkali-kali (notifikasi
 * Midtrans bisa datang ganda): hanya satu pemanggil yang berhasil "mengklaim"
 * order pending → fulfilling, dan hanya dia yang menerbitkan lisensi.
 */
export async function applyPayment(status: MidtransStatus): Promise<OrderDto | null> {
  const ref = orders().doc(status.order_id);
  const outcome = outcomeOf(status);

  const claimed = await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data() as OrderDoc | undefined;
    if (!d || d.status !== "pending") return null;
    // nominal harus sama persis dengan yang kita tagihkan
    if (Math.round(Number(status.gross_amount)) !== d.amount) {
      console.error("[orders] amount mismatch", status.order_id, status.gross_amount, d.amount);
      return null;
    }
    if (outcome === "paid") {
      tx.update(ref, { status: "fulfilling", paymentType: status.payment_type ?? null });
      return d;
    }
    if (outcome === "failed") tx.update(ref, { status: "failed", paymentType: status.payment_type ?? null });
    return null;
  });

  if (claimed) {
    const keys: string[] = [];
    for (const line of claimed.lines) {
      keys.push(
        ...(await issueLicenses({
          kit: line.kit,
          ownerUid: claimed.ownerUid,
          ownerEmail: claimed.ownerEmail,
          count: line.count,
          maxPlaces: line.places ?? 1,
          note: `Order ${claimed.orderId}`,
        }))
      );
    }
    await ref.update({ status: "paid", licenseKeys: keys, paidAt: FieldValue.serverTimestamp() });
    if (claimed.discountCode) await recordDiscountUse(claimed.discountCode);
  }

  const after = await ref.get();
  return after.exists ? toDto(after.data() as OrderDoc) : null;
}

/**
 * Untuk halaman "selesai bayar": kalau webhook belum sampai (mis. di localhost
 * Midtrans tidak bisa menjangkau server), tanyakan status langsung ke Midtrans.
 */
export async function refreshOrder(orderId: string, uid: string): Promise<OrderDto> {
  const order = await getOrderForUser(orderId, uid);
  if (order.status !== "pending") return order;
  const status = await getTransactionStatus(orderId);
  if (!status) return order;
  return (await applyPayment(status)) ?? order;
}
