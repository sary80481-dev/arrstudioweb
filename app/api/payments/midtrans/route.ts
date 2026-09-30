import { handle, json } from "@/lib/server/http";
import { getTransactionStatus, verifySignature, type MidtransStatus } from "@/lib/server/midtrans";
import { applyPayment } from "@/lib/server/orders";

/**
 * POST /api/payments/midtrans — HTTP notification dari Midtrans.
 * Daftarkan URL ini di Dashboard Midtrans → Settings → Payment → Notification URL.
 *
 * Isi notifikasi tidak dipercaya mentah-mentah: signature dicek, lalu status
 * diambil ulang langsung dari API Midtrans sebelum lisensi diterbitkan.
 */
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as MidtransStatus | null;
  if (!body?.order_id || !verifySignature(body)) {
    return json({ ok: false }, { status: 401 });
  }

  // order dari sistem lain di akun Midtrans yang sama → abaikan saja
  if (!body.order_id.startsWith("ARR-")) return json({ ok: true });

  const status = await getTransactionStatus(body.order_id);
  if (status) await applyPayment(status);
  // selalu 200 setelah signature valid, supaya Midtrans tidak mengulang terus
  return json({ ok: true });
});
