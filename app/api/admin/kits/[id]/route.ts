import type { NextRequest } from "next/server";
import { KitPatchSchema } from "@/lib/kit-schema";
import { handle, json, parseBody } from "@/lib/server/http";
import { deleteKit, updateKit } from "@/lib/server/kits";
import { requireAdmin } from "@/lib/server/session";

/** PATCH /api/admin/kits/:id — ubah kit (nama, versi, harga, status, fitur, …) */
export const PATCH = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/kits/[id]">) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  const patch = await parseBody(req, KitPatchSchema);
  return json({ kit: await updateKit(id, patch) });
});

/** DELETE /api/admin/kits/:id — hanya untuk kit yang belum punya lisensi */
export const DELETE = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/kits/[id]">) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  await deleteKit(id);
  return json({ ok: true });
});
