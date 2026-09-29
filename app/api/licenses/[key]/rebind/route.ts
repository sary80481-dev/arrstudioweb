import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, json, parseBody } from "@/lib/server/http";
import { rebindLicense } from "@/lib/server/licenses";
import { requireUser } from "@/lib/server/session";

const Body = z.object({
  placeId: z.string().regex(/^[1-9]\d{0,19}$/, "placeId must be a published Roblox place ID"),
});

/** POST /api/licenses/:key/rebind — pindahkan lisensi ke place lain */
export const POST = handle(async (req: NextRequest, ctx: RouteContext<"/api/licenses/[key]/rebind">) => {
  const { uid } = await requireUser(req);
  const { key } = await ctx.params;
  const { placeId } = await parseBody(req, Body);
  return json({ license: await rebindLicense(decodeURIComponent(key), uid, placeId) });
});
