import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, json, parseBody } from "@/lib/server/http";
import { addInstallmentPayment, undoLastInstallmentPayment } from "@/lib/server/licenses";
import { audit } from "@/lib/server/audit";
import { requireAdmin } from "@/lib/server/session";

const Body = z.object({ amount: z.number().int().min(1).max(100_000_000), note: z.string().trim().max(200).optional() });

/** POST /api/admin/licenses/:key/payments — catat pembayaran cicilan yang sudah dicek */
export const POST = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/licenses/[key]/payments">) => {
  const admin = await requireAdmin(req);
  const { key } = await ctx.params;
  const { amount, note } = await parseBody(req, Body);
  const license = await addInstallmentPayment(decodeURIComponent(key), amount, note || undefined);
  await audit(admin, "installment.payment", license.key, { amount, note: note || null, paid: license.installment?.paid, total: license.installment?.total });
  return json({ license });
});

/** DELETE /api/admin/licenses/:key/payments — batalkan pembayaran terakhir (salah input) */
export const DELETE = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/licenses/[key]/payments">) => {
  const admin = await requireAdmin(req);
  const { key } = await ctx.params;
  const license = await undoLastInstallmentPayment(decodeURIComponent(key));
  await audit(admin, "installment.undo", license.key, { paid: license.installment?.paid, total: license.installment?.total });
  return json({ license });
});
