import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { clientIp, handle, json, parseBody } from "@/lib/server/http";
import { issueMfaCookie, verifyMfa } from "@/lib/server/mfa";
import { rateLimitShared } from "@/lib/server/ratelimit";
import { requireAdmin } from "@/lib/server/session";

const Body = z.object({ code: z.string().trim().min(6).max(16) });

/** POST /api/admin/mfa/verify — kode TOTP (6 digit) atau kode cadangan → cookie "lulus 2FA" 12 jam */
export const POST = handle(async (req: Request) => {
  const admin = await requireAdmin(req, { mfa: false });
  // 6 tebakan / 10 menit per akun (+ per IP) — kode 6 digit tidak boleh bisa di-brute-force
  await rateLimitShared(`mfa-verify:${admin.uid}`, 6, 10 * 60_000);
  await rateLimitShared(`mfa-verify-ip:${clientIp(req)}`, 20, 10 * 60_000);
  const { code } = await parseBody(req, Body);
  await verifyMfa(admin.uid, code);
  await issueMfaCookie(admin.uid);
  await audit(admin, "mfa.verified", admin.uid);
  return json({ ok: true });
});
