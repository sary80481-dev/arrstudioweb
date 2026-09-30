import type { NextRequest } from "next/server";
import { z } from "zod";
import { blobUrl } from "@/lib/kit-schema";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { getKit } from "@/lib/server/kits";
import { getPackage, removePackage, setPackage } from "@/lib/server/packages";
import { requireAdmin } from "@/lib/server/session";

const PackageSchema = z.object({
  url: blobUrl.refine((u) => /\/kits\/[a-z0-9-]+\/packages\/[^/]+\.rbxmx?$/.test(new URL(u).pathname), "Not a kit file upload"),
  fileName: z.string().trim().regex(/^[\w .()-]{1,80}\.rbxmx?$/i, "Use a .rbxm or .rbxmx file"),
  size: z.number().int().min(1),
});

type Ctx = RouteContext<"/api/admin/kits/[id]/package">;

async function kitOr404(id: string) {
  if (!(await getKit(id))) throw new ApiError(404, "KIT_NOT_FOUND", "Kit not found.");
}

/** GET /api/admin/kits/:id/package — file kit yang sedang dipasang */
export const GET = handle(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  return json({ package: await getPackage(id) });
});

/** PUT /api/admin/kits/:id/package — pasang file baru (file lama dihapus dari Blob) */
export const PUT = handle(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  await kitOr404(id);
  const file = await parseBody(req, PackageSchema);
  return json({ package: await setPackage(id, file) });
});

/** DELETE /api/admin/kits/:id/package */
export const DELETE = handle(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  await removePackage(id);
  return json({ ok: true });
});
