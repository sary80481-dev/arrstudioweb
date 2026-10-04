import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase/admin";
import { ApiError } from "./http";

/* ============================================================
   2FA admin (TOTP, RFC 6238 — Google Authenticator / Authy / 1Password) + kode cadangan.
   Firebase MFA bawaan butuh paket berbayar (Identity Platform), jadi dibuat sendiri:

   • Rahasia TOTP disimpan terenkripsi (AES-256-GCM) di koleksi `adminMfa/{uid}` — tertutup untuk browser.
   • Setelah kode benar, server memasang cookie `__mfa` bertanda tangan (12 jam, httpOnly) → itulah "lulus 2FA".
   • Semua API admin, halaman admin dan klaim admin untuk Firestore realtime menuntut cookie itu.
   • Kode TOTP tidak bisa dipakai dua kali (lastStep); kode cadangan sekali pakai.

   Darurat (HP hilang & kode cadangan habis): hapus dokumen adminMfa/{uid} di Firebase console, atau set env
   ADMIN_MFA_DISABLED=true sementara di Vercel → masuk → daftar ulang → hapus env itu.
   ============================================================ */

const COOKIE = "__mfa";
const COOKIE_MS = 12 * 60 * 60 * 1000;
const STEP_S = 30;
const DIGITS = 6;
const ISSUER = "ArrStudio";

const col = () => db().collection("adminMfa");

/** Kunci turunan: MFA_SECRET kalau diset, kalau tidak diturunkan dari private key service account yang sudah ada */
function masterKey(): Buffer {
  const base = process.env.MFA_SECRET || process.env.FIREBASE_PRIVATE_KEY;
  if (!base) throw new ApiError(503, "MFA_NOT_CONFIGURED", "Set MFA_SECRET (or FIREBASE_PRIVATE_KEY) on the server.");
  return createHash("sha256").update(`arr-mfa:v1:${base}`).digest();
}
const mac = (data: string) => createHmac("sha256", masterKey()).update(data).digest("hex");

export const mfaDisabled = () => process.env.ADMIN_MFA_DISABLED === "true";

/**
 * Akun yang dikecualikan dari 2FA — pilihan pemilik untuk akunnya sendiri.
 * Tambahan lewat env ADMIN_MFA_EXEMPT_EMAILS (pisahkan dengan koma). Akun ini TIDAK punya lapisan 2FA:
 * keamanannya bergantung penuh pada password / login Discord-nya.
 */
const EXEMPT_DEFAULT = ["siharprogramming07@gmail.com"];
export function mfaExempt(email?: string | null): boolean {
  if (!email) return false;
  const list = [...EXEMPT_DEFAULT, ...(process.env.ADMIN_MFA_EXEMPT_EMAILS ?? "").split(",")]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

/* ─── enkripsi rahasia ─── */
function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", masterKey(), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64");
}
function decrypt(blob: string): string {
  const raw = Buffer.from(blob, "base64");
  const d = createDecipheriv("aes-256-gcm", masterKey(), raw.subarray(0, 12));
  d.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8");
}

/* ─── TOTP ─── */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function b32encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
function b32decode(s: string): Buffer {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of s.toUpperCase().replace(/=+$/, "")) {
    const i = B32.indexOf(ch);
    if (i < 0) continue;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function hotp(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", secret).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 10 ** DIGITS).padStart(DIGITS, "0");
}

const safeEq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Cocokkan kode dengan jendela ±1 langkah (toleransi jam HP); kembalikan langkah yang cocok */
function matchTotp(secret: Buffer, code: string): number | null {
  const now = Math.floor(Date.now() / 1000 / STEP_S);
  for (const w of [0, -1, 1]) if (safeEq(hotp(secret, now + w), code)) return now + w;
  return null;
}

/* ─── dokumen ─── */
interface MfaDoc {
  secretEnc?: string;
  pendingEnc?: string;
  enabled: boolean;
  lastStep: number;
  backupHashes: string[];
}

export async function isEnrolled(uid: string): Promise<boolean> {
  const d = (await col().doc(uid).get()).data() as MfaDoc | undefined;
  return !!d?.enabled;
}

/** Mulai pendaftaran: buat rahasia baru (belum aktif sampai kode pertama benar) */
export async function beginEnrollment(uid: string, email: string) {
  const secret = randomBytes(20);
  const b32 = b32encode(secret);
  const existing = (await col().doc(uid).get()).data() as MfaDoc | undefined;
  await col().doc(uid).set({
    enabled: existing?.enabled ?? false,
    secretEnc: existing?.secretEnc ?? null,
    lastStep: existing?.lastStep ?? 0,
    backupHashes: existing?.backupHashes ?? [],
    pendingEnc: encrypt(b32),
  });
  const label = encodeURIComponent(`${ISSUER}:${email || uid}`);
  const uri = `otpauth://totp/${label}?secret=${b32}&issuer=${ISSUER}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_S}`;
  return { secret: b32, uri };
}

const newBackupCodes = () => Array.from({ length: 10 }, () => randomBytes(5).toString("hex"));
const normalizeBackup = (c: string) => c.toLowerCase().replace(/[^a-f0-9]/g, "");
const fmtBackup = (c: string) => `${c.slice(0, 5)}-${c.slice(5)}`;

/** Konfirmasi dengan kode pertama → aktif; kembalikan kode cadangan (hanya ditampilkan sekali) */
export async function confirmEnrollment(uid: string, code: string): Promise<string[]> {
  const ref = col().doc(uid);
  const d = (await ref.get()).data() as MfaDoc | undefined;
  if (!d?.pendingEnc) throw new ApiError(409, "MFA_NO_SETUP", "Start the setup again.");
  const secret = b32decode(decrypt(d.pendingEnc));
  const step = matchTotp(secret, code.replace(/\s/g, ""));
  if (step === null) throw new ApiError(400, "MFA_INVALID_CODE", "That code isn't right. Check the time on your phone and try again.");

  const codes = newBackupCodes();
  await ref.set({
    enabled: true,
    secretEnc: d.pendingEnc,
    lastStep: step,
    backupHashes: codes.map((c) => mac(`backup:${uid}:${c}`)),
  });
  return codes.map(fmtBackup);
}

/** Periksa kode TOTP atau kode cadangan (sekali pakai). Melempar ApiError bila salah. */
export async function verifyMfa(uid: string, input: string): Promise<void> {
  const ref = col().doc(uid);
  const bad = () => new ApiError(400, "MFA_INVALID_CODE", "That code isn't right.");
  await db().runTransaction(async (tx) => {
    const d = (await tx.get(ref)).data() as MfaDoc | undefined;
    if (!d?.enabled || !d.secretEnc) throw new ApiError(409, "MFA_NOT_ENROLLED", "Set up two-factor authentication first.");
    const clean = input.replace(/[\s-]/g, "");

    if (/^\d{6}$/.test(clean)) {
      const step = matchTotp(b32decode(decrypt(d.secretEnc)), clean);
      // langkah yang sama / lebih lama = kode pernah dipakai (replay)
      if (step === null || step <= d.lastStep) throw bad();
      tx.update(ref, { lastStep: step });
      return;
    }
    const h = mac(`backup:${uid}:${normalizeBackup(clean)}`);
    const i = d.backupHashes.findIndex((x) => safeEq(x, h));
    if (clean.length !== 10 || i < 0) throw bad();
    tx.update(ref, { backupHashes: d.backupHashes.filter((_, k) => k !== i) });
  });
}

/* ─── cookie "lulus 2FA" ─── */
export async function issueMfaCookie(uid: string) {
  const exp = Date.now() + COOKIE_MS;
  (await cookies()).set(COOKIE, `${uid}.${exp}.${mac(`cookie:${uid}:${exp}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MS / 1000,
  });
}

export async function clearMfaCookie() {
  (await cookies()).delete(COOKIE);
}

/** true bila cookie 2FA valid untuk uid ini (atau 2FA dimatikan darurat lewat env) */
export async function mfaPassed(uid: string, email?: string | null): Promise<boolean> {
  if (mfaDisabled() || mfaExempt(email)) return true;
  const v = (await cookies()).get(COOKIE)?.value;
  const [u, exp, sig] = v?.split(".") ?? [];
  if (!u || !exp || !sig || u !== uid || Number(exp) < Date.now()) return false;
  try {
    return safeEq(sig, mac(`cookie:${uid}:${exp}`));
  } catch {
    return false;
  }
}

/** Untuk API admin: lempar 403 bila belum lulus 2FA (flag `setup` = belum pernah mendaftar) */
export async function assertMfa(uid: string, email?: string | null) {
  if (await mfaPassed(uid, email)) return;
  throw new ApiError(403, "MFA_REQUIRED", "Two-factor verification required.", { setup: !(await isEnrolled(uid)) });
}
