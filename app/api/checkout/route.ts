import { z } from "zod";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { clientIp, handle, json, parseBody, rateLimit } from "@/lib/server/http";
import { createSnapTransaction } from "@/lib/server/midtrans";
import { createOrder } from "@/lib/server/orders";
import { requireUser } from "@/lib/server/session";
import { siteUrl } from "@/lib/site-url";

const CheckoutSchema = z.object({
  item: z.discriminatedUnion("type", [
    z.object({ type: z.literal("kit"), kitId: z.string().regex(KIT_ID_PATTERN) }),
    z.object({ type: z.literal("bundle") }),
  ]),
});

/**
 * POST /api/checkout — buat order + token Snap Midtrans.
 * Body hanya berisi APA yang dibeli; harganya dihitung server.
 */
export const POST = handle(async (req: Request) => {
  const user = await requireUser(req);
  rateLimit(`checkout:${user.uid}:${clientIp(req)}`, 10, 60_000);
  const { item } = await parseBody(req, CheckoutSchema);

  const order = await createOrder(item, { uid: user.uid, email: user.email });
  const snap = await createSnapTransaction({
    orderId: order.orderId,
    amount: order.amount,
    items: [{ id: item.type === "kit" ? item.kitId : "bundle", name: order.title, price: order.amount, quantity: 1 }],
    customer: { name: user.displayName, email: user.email },
    finishUrl: `${siteUrl()}/checkout/finish?order_id=${order.orderId}`,
  });

  return json({ orderId: order.orderId, token: snap.token, redirectUrl: snap.redirectUrl }, { status: 201 });
});
