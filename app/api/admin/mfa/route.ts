import { handle, json } from "@/lib/server/http";
import { isEnrolled, mfaPassed } from "@/lib/server/mfa";
import { requireAdmin } from "@/lib/server/session";

/** GET /api/admin/mfa — status 2FA admin yang sedang login */
export const GET = handle(async (req: Request) => {
  const admin = await requireAdmin(req, { mfa: false });
  return json({ enrolled: await isEnrolled(admin.uid), verified: await mfaPassed(admin.uid, admin.email) });
});
