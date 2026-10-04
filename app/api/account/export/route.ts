import { exportAccountData } from "@/lib/server/account";
import { handle } from "@/lib/server/http";
import { requireUser } from "@/lib/server/session";

/** GET /api/account/export — semua data pribadi milik user yang login, sebagai berkas JSON (hak portabilitas) */
export const GET = handle(async (req: Request) => {
  const { uid } = await requireUser(req);
  const data = await exportAccountData(uid);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arrstudio-my-data.json"',
      "Cache-Control": "private, no-store",
    },
  });
});
