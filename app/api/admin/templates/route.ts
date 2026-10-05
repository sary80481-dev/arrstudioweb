import { WebTemplateInputSchema } from "@/lib/web-template-schema";
import { audit } from "@/lib/server/audit";
import { handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";
import { createWebTemplate, listWebTemplates } from "@/lib/server/web-templates";

/** GET /api/admin/templates — semua template web, termasuk yang belum dipublikasi */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return json({ templates: await listWebTemplates() });
});

/** POST /api/admin/templates — buat template baru (id dari browser, sama dengan folder fotonya) */
export const POST = handle(async (req: Request) => {
  const admin = await requireAdmin(req);
  const { id, ...input } = await parseBody(req, WebTemplateInputSchema);
  const template = await createWebTemplate(id, input);
  await audit(admin, "template.create", id, { name: input.name, service: input.service, mode: input.mode });
  return json({ template }, { status: 201 });
});
