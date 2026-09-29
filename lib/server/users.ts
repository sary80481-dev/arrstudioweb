import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";

export type Role = "user" | "admin";

export interface UserDoc {
  email: string;
  displayName: string;
  robloxUsername: string | null;
  role: Role;
  discordId: string | null;
  discordUsername: string | null;
  avatarUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDto {
  uid: string;
  email: string;
  displayName: string;
  robloxUsername: string | null;
  role: Role;
  discordUsername: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

const users = () => db().collection("users");

/** Email di ADMIN_EMAILS otomatis jadi admin saat akun pertama kali dibuat */
const isBootstrapAdmin = (email: string) =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());

export function toUserDto(uid: string, d: UserDoc): UserDto {
  return {
    uid,
    email: d.email,
    displayName: d.displayName,
    robloxUsername: d.robloxUsername,
    role: d.role,
    discordUsername: d.discordUsername ?? null,
    avatarUrl: d.avatarUrl ?? null,
    createdAt: d.createdAt?.toDate().toISOString() ?? null,
  };
}

export type DiscordProfile = Pick<UserDoc, "discordId" | "discordUsername" | "avatarUrl">;

/** Ambil profil; buat dokumen baru jika ini login pertama. Data Discord disegarkan tiap login. */
export async function ensureUser(
  uid: string,
  email: string,
  displayName?: string,
  discord?: DiscordProfile
): Promise<UserDto> {
  const ref = users().doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    if (!discord) return toUserDto(uid, snap.data() as UserDoc);
    await ref.update({ ...discord, updatedAt: FieldValue.serverTimestamp() });
    return toUserDto(uid, { ...(snap.data() as UserDoc), ...discord });
  }

  await ref.set({
    email: email.toLowerCase(),
    displayName: displayName?.trim() || email.split("@")[0] || "Creator",
    robloxUsername: null,
    role: email && isBootstrapAdmin(email) ? "admin" : "user",
    discordId: discord?.discordId ?? null,
    discordUsername: discord?.discordUsername ?? null,
    avatarUrl: discord?.avatarUrl ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return toUserDto(uid, created.data() as UserDoc);
}

export async function getUser(uid: string): Promise<UserDto | null> {
  const snap = await users().doc(uid).get();
  return snap.exists ? toUserDto(uid, snap.data() as UserDoc) : null;
}

export async function updateUser(uid: string, patch: Partial<Pick<UserDoc, "displayName" | "robloxUsername">>) {
  await users().doc(uid).update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  return getUser(uid);
}

export async function findUserByEmail(email: string): Promise<{ uid: string; email: string } | null> {
  const q = await users().where("email", "==", email.toLowerCase()).limit(1).get();
  return q.empty ? null : { uid: q.docs[0].id, email: q.docs[0].get("email") };
}
