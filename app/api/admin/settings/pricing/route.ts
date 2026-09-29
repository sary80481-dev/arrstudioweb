import { PricingSchema } from "@/lib/pricing-schema";
import { handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";
import { getPricing, updatePricing } from "@/lib/server/settings";

/** GET /api/admin/settings/pricing */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return json({ pricing: await getPricing() });
});

/** PATCH /api/admin/settings/pricing — harga & isi Studio bundle (tampil realtime di landing) */
export const PATCH = handle(async (req: Request) => {
  await requireAdmin(req);
  const patch = await parseBody(req, PricingSchema.partial());
  return json({ pricing: await updatePricing(patch) });
});
