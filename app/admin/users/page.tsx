import { currentUser } from "@/lib/server/session";
import { listUsers } from "@/lib/server/users";
import UsersManager from "./UsersManager";

// daftar akun selalu segar — jangan di-cache saat build
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // layout /admin sudah memastikan hanya admin yang sampai sini
  const [users, me] = await Promise.all([listUsers().catch(() => null), currentUser()]);
  return <UsersManager users={users} selfUid={me?.uid ?? ""} />;
}
