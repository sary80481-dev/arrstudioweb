import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, json, parseBody } from "@/lib/server/http";
import { setLicenseStatus } from "@/lib/server/licenses";
import { requireAdmin } from "@/lib/server/session";

const Body = z.object({ status: z.enum(["active", "revoked"]) });

/** PATCH /api/admin/licenses/:key — cabut / aktifkan lagi lisensi */
export const PATCH = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/licenses/[key]">) => {
  await requireAdmin(req);
  const { key } = await ctx.params;
  const { status } = await parseBody(req, Body);
  return json({ license: await setLicenseStatus(decodeURIComponent(key), status) });
});
