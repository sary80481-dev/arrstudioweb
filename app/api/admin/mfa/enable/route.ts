import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { handle, json, parseBody } from "@/lib/server/http";
import { confirmEnrollment, issueMfaCookie } from "@/lib/server/mfa";
import { rateLimitShared } from "@/lib/server/ratelimit";
import { requireAdmin } from "@/lib/server/session";

const Body = z.object({ code: z.string().trim().min(6).max(8) });

/** POST /api/admin/mfa/enable — kode pertama dari aplikasi → 2FA aktif + 10 kode cadangan (tampil sekali) */
export const POST = handle(async (req: Request) => {
  const admin = await requireAdmin(req, { mfa: false });
  await rateLimitShared(`mfa-enable:${admin.uid}`, 8, 10 * 60_000);
  const { code } = await parseBody(req, Body);
  const backupCodes = await confirmEnrollment(admin.uid, code);
  await issueMfaCookie(admin.uid);
  await audit(admin, "mfa.enabled", admin.uid);
  return json({ backupCodes });
});
