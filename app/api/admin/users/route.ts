import { handle, json } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";
import { listUsers } from "@/lib/server/users";

/** GET /api/admin/users — semua akun terdaftar (admin), untuk memilih pembeli saat menerbitkan lisensi */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return json({ users: await listUsers() });
});
