import "server-only";
import { createHash } from "node:crypto";
import { adminAuth, db } from "@/lib/firebase/admin";
import { ApiError } from "./http";
import { listLicensesForUser, setLicenseStatus } from "./licenses";
import { getUser } from "./users";

/* ============================================================
   Hak pengguna atas datanya (lihat /privacy):
   • exportAccountData — portabilitas: semua data pribadi dalam satu berkas JSON.
   • deleteAccount — penghapusan mandiri. Yang dihapus: akun login, profil, rahasia 2FA.
     Yang DIPERTAHANKAN tanpa identitas: catatan pesanan/pembayaran (kewajiban pajak & akuntansi) dan
     catatan lisensi (sengketa) — email & uid pemilik dibuang, lisensi dicabut.
   ============================================================ */

const anon = (uid: string) => `deleted_${createHash("sha256").update(uid).digest("hex").slice(0, 16)}`;
/** order pending yang lebih tua dari ini sudah kedaluwarsa di Midtrans (Snap expiry 24 jam) */
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

export async function exportAccountData(uid: string) {
  const [user, licenses, orders] = await Promise.all([
    getUser(uid),
    listLicensesForUser(uid),
    db().collection("orders").where("ownerUid", "==", uid).get(),
  ]);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "Account not found.");
  return {
    exportedAt: new Date().toISOString(),
    account: user,
    licenses,
    orders: orders.docs
      .map((d) => d.data())
      .map((o) => ({
        orderId: o.orderId,
        title: o.title,
        amount: o.amount,
        originalAmount: o.originalAmount ?? null,
        discountCode: o.discountCode ?? null,
        status: o.status,
        paymentType: o.paymentType,
        licenseKeys: o.licenseKeys ?? [],
        createdAt: o.createdAt?.toDate?.().toISOString() ?? null,
        paidAt: o.paidAt?.toDate?.().toISOString() ?? null,
      })),
  };
}

export async function deleteAccount(uid: string) {
  const user = await getUser(uid);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "Account not found.");
  // admin menghapus diri sendiri bisa meninggalkan sistem tanpa admin → turunkan perannya dulu lewat admin lain
  if (user.role === "admin") {
    throw new ApiError(403, "ADMIN_CANNOT_DELETE", "Admin accounts can't be deleted here. Ask another admin to remove admin access first.");
  }

  // pembayaran yang masih berjalan: kalau lunas setelah akun hilang, lisensinya tidak punya pemilik
  const orders = await db().collection("orders").where("ownerUid", "==", uid).get();
  const cutoff = Date.now() - PENDING_TTL_MS;
  const inFlight = orders.docs.some((o) => {
    const v = o.data();
    return (v.status === "pending" || v.status === "fulfilling") && (v.createdAt?.toMillis?.() ?? Date.now()) > cutoff;
  });
  if (inFlight) {
    throw new ApiError(409, "PAYMENT_IN_PROGRESS", "You have a payment in progress. Try again once it's finished or has expired (up to 24 hours).");
  }

  const ghost = anon(uid);

  // 1. lisensi: cabut (slot place berhenti terhitung), lepas dari identitas pemilik
  for (const l of await listLicensesForUser(uid)) {
    await setLicenseStatus(l.key, "revoked");
    await db().collection("licenses").doc(l.key).update({ ownerUid: ghost, ownerEmail: null });
  }

  // 2. pesanan: tetap disimpan (pajak/akuntansi) tanpa identitas
  const batch = db().batch();
  orders.docs.forEach((o) => batch.update(o.ref, { ownerUid: ghost, ownerEmail: "" }));
  if (!orders.empty) await batch.commit();

  // 3. profil, 2FA, lalu akun login
  await db().collection("adminMfa").doc(uid).delete();
  await db().collection("users").doc(uid).delete();
  await adminAuth().deleteUser(uid).catch((err: { code?: string }) => {
    if (err.code !== "auth/user-not-found") throw err;
  });
}
