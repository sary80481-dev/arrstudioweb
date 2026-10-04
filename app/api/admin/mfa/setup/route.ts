import QRCode from "qrcode";
import { audit } from "@/lib/server/audit";
import { ApiError, handle, json } from "@/lib/server/http";
import { beginEnrollment, isEnrolled, mfaPassed } from "@/lib/server/mfa";
import { rateLimitShared } from "@/lib/server/ratelimit";
import { requireAdmin } from "@/lib/server/session";

/**
 * POST /api/admin/mfa/setup — rahasia baru + QR untuk aplikasi authenticator.
 * Sudah terdaftar → hanya boleh dari sesi yang sudah lulus 2FA (mengganti perangkat).
 */
export const POST = handle(async (req: Request) => {
  const admin = await requireAdmin(req, { mfa: false });
  await rateLimitShared(`mfa-setup:${admin.uid}`, 10, 10 * 60_000);
  if ((await isEnrolled(admin.uid)) && !(await mfaPassed(admin.uid))) {
    throw new ApiError(403, "MFA_REQUIRED", "Verify with your current authenticator first.", { setup: false });
  }
  const { secret, uri } = await beginEnrollment(admin.uid, admin.email);
  await audit(admin, "mfa.setup.begin", admin.uid);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 240, errorCorrectionLevel: "M" });
  return json({ secret, qr });
});
