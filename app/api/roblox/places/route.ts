import type { NextRequest } from "next/server";
import { ApiError, handle, json } from "@/lib/server/http";
import { getPlaces } from "@/lib/server/roblox";
import { requireUser } from "@/lib/server/session";

/** GET /api/roblox/places?ids=1,2 — nama, ikon & pemain aktif untuk place di dashboard */
export const GET = handle(async (req: NextRequest) => {
  await requireUser(req);
  const ids = (req.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean);
  if (ids.length > 30 || ids.some((id) => !/^[1-9]\d{0,19}$/.test(id))) {
    throw new ApiError(400, "INVALID_IDS", "Pass up to 30 numeric place IDs.");
  }
  return json({ places: await getPlaces(ids) });
});
