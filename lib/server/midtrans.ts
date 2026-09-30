import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { ApiError } from "./http";

/* ============================================================
   Midtrans Snap — pembayaran langsung (QRIS, VA bank, e-wallet, kartu).
   Sandbox / production otomatis dari prefix key ("SB-Mid-..." = sandbox).
   ============================================================ */

// key sandbox selalu berawalan "SB-" → mode ditentukan dari key-nya sendiri, tak bisa salah setel
const isProduction = () => !(process.env.MIDTRANS_SERVER_KEY ?? "").startsWith("SB-");

const SNAP_URL = () =>
  isProduction() ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
const API_URL = () => (isProduction() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com");

export const midtransConfigured = () => Boolean(process.env.MIDTRANS_SERVER_KEY);

function serverKey() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new ApiError(503, "PAYMENTS_NOT_CONFIGURED", "Payments aren't set up yet — set MIDTRANS_SERVER_KEY.");
  return key;
}

const authHeader = () => `Basic ${Buffer.from(`${serverKey()}:`).toString("base64")}`;

export interface SnapItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function createSnapTransaction(input: {
  orderId: string;
  amount: number;
  items: SnapItem[];
  customer: { name: string; email: string };
  finishUrl: string;
}): Promise<{ token: string; redirectUrl: string }> {
  const res = await fetch(SNAP_URL(), {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      // nama item maks 50 karakter menurut Midtrans
      item_details: input.items.map((i) => ({ ...i, name: i.name.slice(0, 50) })),
      customer_details: { first_name: input.customer.name.slice(0, 50), email: input.customer.email },
      callbacks: { finish: input.finishUrl },
      expiry: { unit: "hours", duration: 24 },
    }),
  });
  const data = (await res.json().catch(() => null)) as { token?: string; redirect_url?: string; error_messages?: string[] } | null;
  if (!res.ok || !data?.token || !data.redirect_url) {
    console.error("[midtrans] snap create failed:", res.status, data?.error_messages);
    throw new ApiError(502, "PAYMENT_PROVIDER_ERROR", "Couldn't start the payment. Please try again.");
  }
  return { token: data.token, redirectUrl: data.redirect_url };
}

export interface MidtransStatus {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  signature_key?: string;
}

/** Status transaksi langsung dari Midtrans — sumber kebenaran, bukan isi notifikasi */
export async function getTransactionStatus(orderId: string): Promise<MidtransStatus | null> {
  const res = await fetch(`${API_URL()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: authHeader(), Accept: "application/json" },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as MidtransStatus | null;
  // 404 = pembeli belum memilih metode bayar di Snap
  if (!data || data.status_code === "404") return null;
  return data;
}

/** signature_key = SHA512(order_id + status_code + gross_amount + server_key) */
export function verifySignature(n: Pick<MidtransStatus, "order_id" | "status_code" | "gross_amount" | "signature_key">) {
  if (!n.signature_key) return false;
  const expected = createHash("sha512").update(`${n.order_id}${n.status_code}${n.gross_amount}${serverKey()}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(n.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type PaymentOutcome = "paid" | "pending" | "failed";

/** Pemetaan status Midtrans → status order kita */
export function outcomeOf(s: Pick<MidtransStatus, "transaction_status" | "fraud_status">): PaymentOutcome {
  switch (s.transaction_status) {
    case "settlement":
      return "paid";
    case "capture":
      // kartu kredit: "challenge" menunggu review manual di dashboard Midtrans
      return s.fraud_status === "accept" ? "paid" : "pending";
    case "deny":
    case "cancel":
    case "expire":
    case "failure":
      return "failed";
    default:
      return "pending";
  }
}
