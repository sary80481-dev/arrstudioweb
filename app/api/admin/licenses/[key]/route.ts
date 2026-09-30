import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, json, parseBody } from "@/lib/server/http";
import { deleteLicense, setLicenseStatus, setMaxPlaces } from "@/lib/server/licenses";
import { requireAdmin } from "@/lib/server/session";

const Body = z
  .object({
    status: z.enum(["active", "revoked"]).optional(),
    maxPlaces: z.number().int().min(1).max(100).optional(),
  })
  .refine((v) => v.status || v.maxPlaces, "status or maxPlaces is required");

/** PATCH /api/admin/licenses/:key — cabut / aktifkan lagi lisensi, atau ubah jumlah slot place */
export const PATCH = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/licenses/[key]">) => {
  await requireAdmin(req);
  const { key } = await ctx.params;
  const { status, maxPlaces } = await parseBody(req, Body);
  const k = decodeURIComponent(key);
  let license = maxPlaces ? await setMaxPlaces(k, maxPlaces) : null;
  if (status) license = await setLicenseStatus(k, status);
  return json({ license });
});

/** DELETE /api/admin/licenses/:key — hapus permanen (hanya lisensi yang sudah dicabut) */
export const DELETE = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/licenses/[key]">) => {
  await requireAdmin(req);
  const { key } = await ctx.params;
  await deleteLicense(decodeURIComponent(key));
  return json({ ok: true });
});
