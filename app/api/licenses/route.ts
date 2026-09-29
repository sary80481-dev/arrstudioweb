import { handle, json } from "@/lib/server/http";
import { listLicensesForUser } from "@/lib/server/licenses";
import { requireUser } from "@/lib/server/session";

/** GET /api/licenses — semua lisensi milik user yang login */
export const GET = handle(async (req: Request) => {
  const { uid } = await requireUser(req);
  return json({ licenses: await listLicensesForUser(uid) });
});
