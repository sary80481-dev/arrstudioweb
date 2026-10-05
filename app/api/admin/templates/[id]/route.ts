import type { NextRequest } from "next/server";
import { TEMPLATE_ID_PATTERN } from "@/lib/web-templates";
import { WebTemplatePatchSchema } from "@/lib/web-template-schema";
import { audit } from "@/lib/server/audit";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";
import { deleteWebTemplate, updateWebTemplate } from "@/lib/server/web-templates";

const idOf = async (ctx: RouteContext<"/api/admin/templates/[id]">) => {
  const { id } = await ctx.params;
  if (!TEMPLATE_ID_PATTERN.test(id)) throw new ApiError(404, "TEMPLATE_NOT_FOUND", "Template not found.");
  return id;
};

/** PATCH /api/admin/templates/:id — ubah nama, layanan, link / foto, publikasi, urutan */
export const PATCH = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/templates/[id]">) => {
  const admin = await requireAdmin(req);
  const id = await idOf(ctx);
  const patch = await parseBody(req, WebTemplatePatchSchema);
  const template = await updateWebTemplate(id, patch);
  await audit(admin, "template.update", id, { name: template.name, published: template.published });
  return json({ template });
});

/** DELETE /api/admin/templates/:id — hapus template beserta fotonya */
export const DELETE = handle(async (req: NextRequest, ctx: RouteContext<"/api/admin/templates/[id]">) => {
  const admin = await requireAdmin(req);
  const id = await idOf(ctx);
  await deleteWebTemplate(id);
  await audit(admin, "template.delete", id);
  return json({ ok: true });
});
