import type { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, clientIp, handle, json, parseBody, rateLimit } from "@/lib/server/http";
import { addPlace } from "@/lib/server/licenses";
import { placeExists } from "@/lib/server/roblox";
import { requireUser } from "@/lib/server/session";

const Body = z.object({
  placeId: z.string().trim().regex(/^[1-9]\d{0,19}$/, "Enter a published Roblox place ID (numbers only)."),
});

/** POST /api/licenses/:key/places — isi slot kosong dengan place (dicek ke Roblox dulu) */
export const POST = handle(async (req: NextRequest, ctx: RouteContext<"/api/licenses/[key]/places">) => {
  const { uid } = await requireUser(req);
  rateLimit(`add-place:${uid}:${clientIp(req)}`, 20, 60_000);
  const { key } = await ctx.params;
  const { placeId } = await parseBody(req, Body);

  // salah ketik ketahuan sekarang, bukan setelah slot terpakai; Roblox down → tetap izinkan
  if ((await placeExists(placeId)) === false) {
    throw new ApiError(404, "PLACE_NOT_FOUND", "Roblox doesn't have a place with that ID. Copy it from the game's URL.");
  }
  return json({ license: await addPlace(decodeURIComponent(key), uid, placeId) });
});
