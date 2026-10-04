import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";
import { listUsers, setUserRole } from "@/lib/server/users";

/** GET /api/admin/users — semua akun terdaftar (admin), untuk memilih pembeli saat menerbitkan lisensi */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return json({ users: await listUsers() });
});

const RoleBody = z.object({ uid: z.string().min(1).max(128), role: z.enum(["user", "admin"]) });

/** PATCH /api/admin/users — jadikan admin / cabut admin. Tidak bisa mengubah peran diri sendiri (cegah terkunci). */
export const PATCH = handle(async (req: Request) => {
  const admin = await requireAdmin(req);
  const { uid, role } = await parseBody(req, RoleBody);
  if (uid === admin.uid) throw new ApiError(400, "SELF_ROLE", "You can't change your own role.");
  const user = await setUserRole(uid, role);
  await audit(admin, "user.role", uid, { role, email: user.email });
  return json({ user });
});
