import { adminAuth } from "@/lib/firebase/admin";
import { handle, json } from "@/lib/server/http";
import { mfaPassed } from "@/lib/server/mfa";
import { requireUser, setAuthHint } from "@/lib/server/session";

/**
 * GET /api/auth/firebase-token — custom token untuk Firebase client SDK.
 * Sesi utama ada di cookie server; token ini dipakai browser agar bisa membaca
 * data miliknya sendiri secara realtime (onSnapshot) sesuai firestore.rules.
 */
export const GET = handle(async (req: Request) => {
  const user = await requireUser(req);
  // klaim `role: admin` (membuka seluruh data lewat Firestore realtime) hanya diberikan setelah lulus 2FA
  const role = user.role === "admin" && (await mfaPassed(user.uid, user.email)) ? "admin" : "user";
  const token = await adminAuth().createCustomToken(user.uid, { role });
  // segarkan juga cookie petunjuk navbar (nama / role bisa berubah)
  await setAuthHint(user);
  return json({ token });
});
