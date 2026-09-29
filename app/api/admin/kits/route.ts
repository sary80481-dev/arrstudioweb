import { KitInputSchema } from "@/lib/kit-schema";
import { DEFAULT_KITS } from "@/lib/kits";
import { handle, json, parseBody } from "@/lib/server/http";
import { createKit, getKit, listKits } from "@/lib/server/kits";
import { requireAdmin } from "@/lib/server/session";

/** GET /api/admin/kits — semua kit, termasuk draft */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return json({ kits: await listKits() });
});

/**
 * POST /api/admin/kits — buat kit baru.
 * POST /api/admin/kits?seed=1 — impor kit bawaan (ClubKit Pro, Summit Kit) yang belum ada.
 */
export const POST = handle(async (req: Request) => {
  await requireAdmin(req);

  if (new URL(req.url).searchParams.get("seed")) {
    const created = [];
    for (const kit of DEFAULT_KITS) {
      if (!(await getKit(kit.id!))) created.push(await createKit(kit));
    }
    return json({ kits: created }, { status: 201 });
  }

  const input = await parseBody(req, KitInputSchema);
  return json({ kit: await createKit(input) }, { status: 201 });
});
