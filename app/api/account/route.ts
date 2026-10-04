import { z } from "zod";
import { deleteAccount } from "@/lib/server/account";
import { audit } from "@/lib/server/audit";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { rateLimitShared } from "@/lib/server/ratelimit";
import { destroySession, requireUser } from "@/lib/server/session";
import { updateUser } from "@/lib/server/users";

/** GET /api/account — profil user yang login */
export const GET = handle(async (req: Request) => {
  const user = await requireUser(req);
  return json({ user });
});

const Patch = z
  .object({
    displayName: z.string().trim().min(2).max(40),
    // aturan username Roblox: 3–20 karakter, huruf/angka/underscore
    robloxUsername: z.string().trim().regex(/^[A-Za-z0-9_]{3,20}$/, "Invalid Roblox username").nullable(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

/** PATCH /api/account — ubah nama tampilan / username Roblox */
export const PATCH = handle(async (req: Request) => {
  const { uid } = await requireUser(req);
  const patch = await parseBody(req, Patch);
  const user = await updateUser(uid, patch);
  return json({ user });
});

const DeleteBody = z.object({ confirm: z.string().trim().min(1).max(200) });

/**
 * DELETE /api/account — hapus akun sendiri (permanen). Konfirmasi: ketik email akun
 * (atau "DELETE" bila akun tanpa email). Lisensi dicabut; pesanan dipertahankan tanpa identitas.
 */
export const DELETE = handle(async (req: Request) => {
  const user = await requireUser(req);
  await rateLimitShared(`delete-account:${user.uid}`, 5, 60 * 60_000);
  const { confirm } = await parseBody(req, DeleteBody);
  const expected = (user.email || "DELETE").toLowerCase();
  if (confirm.toLowerCase() !== expected) {
    throw new ApiError(400, "CONFIRM_MISMATCH", `Type ${user.email || "DELETE"} to confirm.`);
  }
  await deleteAccount(user.uid);
  // jejak tanpa identitas (uid saja) — email tidak ikut dicatat
  await audit({ uid: user.uid, email: "(self-service)" }, "account.delete", user.uid);
  await destroySession().catch(() => {});
  return json({ ok: true });
});
