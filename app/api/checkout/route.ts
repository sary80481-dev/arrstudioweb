import { z } from "zod";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { DISCORD_INVITE } from "@/lib/links";
import { ApiError, clientIp, handle, json, parseBody, rateLimit } from "@/lib/server/http";
import { createSnapTransaction, paymentsEnabled, snapClientKey } from "@/lib/server/midtrans";
import { createOrder } from "@/lib/server/orders";
import { requireUser } from "@/lib/server/session";
import { siteUrl } from "@/lib/site-url";

const CheckoutSchema = z.object({
  code: z.string().trim().max(24).optional(),
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
  // pembeli wajib punya akun dulu — lisensi nanti diterbitkan ke akun ini, juga saat order lewat Discord
  const user = await requireUser(req);
  if (!paymentsEnabled()) {
    throw new ApiError(409, "PAYMENTS_OFFLINE", "Instant checkout isn't available yet — order through Discord.", {
      url: DISCORD_INVITE,
    });
  }
  rateLimit(`checkout:${user.uid}:${clientIp(req)}`, 10, 60_000);
  const { item, code } = await parseBody(req, CheckoutSchema);

  const order = await createOrder(item, { uid: user.uid, email: user.email }, code);
  const snap = await createSnapTransaction({
    orderId: order.orderId,
    amount: order.amount,
    items: [{ id: item.type === "kit" ? item.kitId : "bundle", name: order.title, price: order.amount, quantity: 1 }],
    customer: { name: user.displayName, email: user.email },
    finishUrl: `${siteUrl()}/checkout/finish?order_id=${order.orderId}`,
  });

  return json(
    { orderId: order.orderId, token: snap.token, redirectUrl: snap.redirectUrl, clientKey: snapClientKey() },
    { status: 201 }
  );
});
