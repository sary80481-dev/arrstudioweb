import { z } from "zod";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { clientIp, handle, json, parseBody } from "@/lib/server/http";
import { rateLimitShared } from "@/lib/server/ratelimit";
import { quote } from "@/lib/server/orders";

const Schema = z.object({
  code: z.string().trim().min(1).max(24),
  item: z.discriminatedUnion("type", [
    z.object({ type: z.literal("kit"), kitId: z.string().regex(KIT_ID_PATTERN) }),
    z.object({ type: z.literal("bundle") }),
  ]),
});

/** POST /api/checkout/discount — pratinjau potongan kode untuk satu item (tanpa membuat order) */
export const POST = handle(async (req: Request) => {
  await rateLimitShared(`discount:${clientIp(req)}`, 20, 60_000);
  const { code, item } = await parseBody(req, Schema);
  const q = await quote(item, code);
  return json({ code: q.discountCode, originalAmount: q.originalAmount, discount: q.discount, amount: q.amount });
});
