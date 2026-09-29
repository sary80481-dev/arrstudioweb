import { adminAuth } from "@/lib/firebase/admin";
import { handle, json } from "@/lib/server/http";
import { requireUser, setAuthHint } from "@/lib/server/session";

/**
 * GET /api/auth/firebase-token — custom token untuk Firebase client SDK.
 * Sesi utama ada di cookie server; token ini dipakai browser agar bisa membaca
 * data miliknya sendiri secara realtime (onSnapshot) sesuai firestore.rules.
 */
export const GET = handle(async (req: Request) => {
  const user = await requireUser(req);
  const token = await adminAuth().createCustomToken(user.uid, { role: user.role });
  // segarkan juga cookie petunjuk navbar (nama / role bisa berubah)
  await setAuthHint(user);
  return json({ token });
});
