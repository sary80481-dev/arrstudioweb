import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";

/* Jejak aksi admin (uang, lisensi, peran). Koleksi `auditLogs` tertutup untuk browser
   (firestore.rules) — hanya terbaca lewat /admin/audit. Gagal mencatat tidak menggagalkan aksinya. */

export interface AuditEntry {
  id: string;
  at: string | null;
  adminEmail: string;
  action: string;
  target: string;
  data: Record<string, unknown> | null;
}

const logs = () => db().collection("auditLogs");

export async function audit(
  admin: { uid: string; email: string },
  action: string,
  target: string,
  data?: Record<string, unknown>
) {
  await logs()
    .add({ at: FieldValue.serverTimestamp(), adminUid: admin.uid, adminEmail: admin.email, action, target, data: data ?? null })
    .catch((err) => console.error("[audit] couldn't write", action, target, err));
}

export async function listAudit(limit = 200): Promise<AuditEntry[]> {
  const snap = await logs().orderBy("at", "desc").limit(limit).get();
  return snap.docs.map((d) => {
    const v = d.data() as { at?: Timestamp; adminEmail: string; action: string; target: string; data: Record<string, unknown> | null };
    return { id: d.id, at: v.at?.toDate().toISOString() ?? null, adminEmail: v.adminEmail, action: v.action, target: v.target, data: v.data };
  });
}
