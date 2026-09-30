import type { NextRequest } from "next/server";
import { ApiError, handle, json } from "@/lib/server/http";
import { releasePlace } from "@/lib/server/licenses";
import { requireUser } from "@/lib/server/session";

/** DELETE /api/licenses/:key/places/:placeId — lepas place dari lisensi supaya slotnya bisa dipakai place lain */
export const DELETE = handle(async (req: NextRequest, ctx: RouteContext<"/api/licenses/[key]/places/[placeId]">) => {
  const { uid } = await requireUser(req);
  const { key, placeId } = await ctx.params;
  if (!/^[1-9]\d{0,19}$/.test(placeId)) throw new ApiError(400, "INVALID_PLACE_ID", "placeId must be a published Roblox place ID.");
  return json({ license: await releasePlace(decodeURIComponent(key), uid, placeId) });
});
