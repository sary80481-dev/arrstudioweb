import { z } from "zod";
import { handle, json, parseBody, clientIp } from "@/lib/server/http";
import { rateLimitShared } from "@/lib/server/ratelimit";
import { createSession, destroySession, setAuthHint } from "@/lib/server/session";
import { ensureUser } from "@/lib/server/users";

const Body = z.object({
  idToken: z.string().min(1),
  /** hanya dipakai saat akun pertama kali dibuat (register) */
  displayName: z.string().trim().min(2).max(40).optional(),
});

/** POST /api/auth/session — tukar Firebase ID token → session cookie, buat profil jika belum ada */
export const POST = handle(async (req: Request) => {
  await rateLimitShared(`session:${clientIp(req)}`, 20, 60_000);
  const { idToken, displayName } = await parseBody(req, Body);

  const decoded = await createSession(idToken);
  const user = await ensureUser(decoded.uid, decoded.email ?? "", displayName ?? decoded.name, undefined, decoded.email_verified === true);
  await setAuthHint(user);

  return json({ user });
});

/** DELETE /api/auth/session — logout */
export const DELETE = handle(async () => {
  await destroySession();
  return json({ ok: true });
});
