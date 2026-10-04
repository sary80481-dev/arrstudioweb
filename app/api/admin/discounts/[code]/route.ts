import type { NextRequest } from "next/server";
import { DISCOUNT_CODE_PATTERN } from "@/lib/discount";
import { DiscountPatchSchema } from "@/lib/discount-schema";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { deleteDiscount, normalizeCode, updateDiscount } from "@/lib/server/discounts";
import { requireAdmin } from "@/lib/server/session";

const codeOf = async (ctx: RouteContext<"/api/admin/discounts/[code]">) => {
  const code = normalizeCode((await ctx.params).code);
  if (!DISCOUNT_CODE_PATTERN.test(code)) throw new ApiError(404, "CODE_NOT_FOUND", "Discount code not found.");
  return code;
};

/** PATCH /api/admin/discounts/:code — aktif/nonaktif, batas pemakaian, kedaluwarsa */
export const PATCH = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/discounts/[code]">) => {
  await requireAdmin(req);
  const code = await codeOf(ctx);
  return json({ discount: await updateDiscount(code, await parseBody(req, DiscountPatchSchema)) });
});

/** DELETE /api/admin/discounts/:code */
export const DELETE = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/discounts/[code]">) => {
  await requireAdmin(req);
  await deleteDiscount(await codeOf(ctx));
  return json({ ok: true });
});
