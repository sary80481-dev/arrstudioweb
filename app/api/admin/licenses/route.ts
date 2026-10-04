import type { NextRequest } from "next/server";
import { z } from "zod";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { issueLicenses, listAllLicenses } from "@/lib/server/licenses";
import { audit } from "@/lib/server/audit";
import { checkDiscountForIssue, recordDiscountUse } from "@/lib/server/discounts";
import { requireAdmin } from "@/lib/server/session";
import { findUserByEmail, getUser } from "@/lib/server/users";

/** GET /api/admin/licenses?ownerUid=&kit= — daftar lisensi (admin) */
export const GET = handle(async (req: NextRequest) => {
  await requireAdmin(req);
  const params = req.nextUrl.searchParams;
  const kit = params.get("kit");
  if (kit && !KIT_ID_PATTERN.test(kit)) throw new ApiError(400, "INVALID_KIT", "Unknown kit.");
  const licenses = await listAllLicenses({ ownerUid: params.get("ownerUid") ?? undefined, kit: kit ?? undefined });
  return json({ licenses });
});

const Issue = z
  .object({
    kit: z.string().regex(KIT_ID_PATTERN),
    ownerUid: z.string().min(1).optional(),
    ownerEmail: z.email().optional(),
    count: z.number().int().min(1).max(50).default(1),
    /** slot place per lisensi; kosong = pengaturan kit */
    maxPlaces: z.number().int().min(1).max(100).optional(),
    note: z.string().max(200).optional(),
    /** pembayaran dengan catatan: total harga per lisensi & pembayaran pertama (≤ total; = total berarti langsung lunas) */
    installment: z.object({ total: z.number().int().min(1000).max(100_000_000), paid: z.number().int().min(0) }).optional(),
    /** kode diskon — dipotongkan dari `installment.total` (hanya untuk lisensi cicilan) */
    promoCode: z.string().trim().max(24).optional(),
  })
  .refine((v) => v.ownerUid || v.ownerEmail, "ownerUid or ownerEmail is required")
  .refine((v) => !v.promoCode || v.installment, { path: ["promoCode"], message: "A promo code needs a total price — enable installments" })
  .refine((v) => !v.installment || v.installment.paid <= v.installment.total, {
    path: ["installment", "paid"],
    message: "First payment can't be more than the total",
  });

/** POST /api/admin/licenses — terbitkan lisensi untuk user (setelah pembayaran diterima) */
export const POST = handle(async (req: NextRequest) => {
  const admin = await requireAdmin(req);
  const body = await parseBody(req, Issue);

  const owner = body.ownerUid ? await getUser(body.ownerUid) : await findUserByEmail(body.ownerEmail!);
  if (!owner) throw new ApiError(404, "USER_NOT_FOUND", "No account with that uid / email. The user must register first.");

  // kode diskon: potong total, lalu pastikan pembayaran pertama tidak melebihi total baru
  let installment = body.installment;
  let discount: { code: string; amount: number } | undefined;
  if (body.promoCode && installment) {
    discount = await checkDiscountForIssue(body.promoCode, installment.total, body.count);
    installment = { total: installment.total - discount.amount, paid: installment.paid };
    if (installment.paid > installment.total) {
      throw new ApiError(400, "PAID_EXCEEDS_TOTAL", `The first payment is more than the discounted total (Rp ${installment.total.toLocaleString("id-ID")}).`);
    }
  }

  const keys = await issueLicenses({
    kit: body.kit,
    ownerUid: owner.uid,
    ownerEmail: owner.email || body.ownerEmail || null,
    count: body.count,
    maxPlaces: body.maxPlaces,
    installment,
    discount,
    note: [body.note, discount && `Promo ${discount.code}`].filter(Boolean).join(" · ") || undefined,
  });
  if (discount) await recordDiscountUse(discount.code, body.count);
  await audit(admin, "license.issue", keys.join(","), {
    kit: body.kit,
    owner: owner.uid,
    count: body.count,
    installment: installment ?? null,
    promo: discount ?? null,
  });
  return json({ keys }, { status: 201 });
});
