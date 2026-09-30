import type { NextRequest } from "next/server";
import { ApiError, handle, json } from "@/lib/server/http";
import { refreshOrder } from "@/lib/server/orders";
import { packageAvailability } from "@/lib/server/packages";
import { requireUser } from "@/lib/server/session";

/** GET /api/orders/:id — status order milik user (dipoll halaman /checkout/finish) */
export const GET = handle(async (req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) => {
  const { uid } = await requireUser(req);
  const { id } = await ctx.params;
  if (!/^ARR-[A-Z0-9-]{4,40}$/.test(id)) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
  const order = await refreshOrder(id, uid);
  const downloads = order.status === "paid" ? await packageAvailability(order.kits.map((k) => k.id)) : {};
  return json({ order, downloads });
});
