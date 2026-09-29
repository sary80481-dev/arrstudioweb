import { z } from "zod";
import { handle, json, parseBody } from "@/lib/server/http";
import { requireUser } from "@/lib/server/session";
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
