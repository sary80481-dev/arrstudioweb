import { DiscountSchema } from "@/lib/discount-schema";
import { handle, json, parseBody } from "@/lib/server/http";
import { createDiscount, listDiscounts } from "@/lib/server/discounts";
import { audit } from "@/lib/server/audit";
import { requireAdmin } from "@/lib/server/session";

/** GET /api/admin/discounts */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return json({ discounts: await listDiscounts() });
});

/** POST /api/admin/discounts — buat kode diskon baru */
export const POST = handle(async (req: Request) => {
  const admin = await requireAdmin(req);
  const body = await parseBody(req, DiscountSchema);
  const discount = await createDiscount(body);
  await audit(admin, "discount.create", discount.code, { type: body.type, value: body.value, appliesTo: body.appliesTo, maxUses: body.maxUses });
  return json({ discount }, { status: 201 });
});
