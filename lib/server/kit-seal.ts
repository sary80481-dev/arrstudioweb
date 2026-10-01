import "server-only";
import { createHmac } from "node:crypto";

/**
 * Kunci pembuka modul kit yang disegel (ArrSeal, ChaCha20 di sisi Roblox).
 *
 * Diturunkan dari KIT_SEAL_SECRET per kit, jadi tidak perlu disimpan di database.
 * Hanya dikirim ke server Roblox yang lisensinya valid & place-nya cocok — tanpa kunci ini
 * modul yang disegel tidak bisa dijalankan, walau cek lisensinya dihapus dari kit.
 *
 * Mengganti KIT_SEAL_SECRET = semua kit yang sudah disegel harus disegel ulang.
 */
export function kitUnlockKey(kit: string, opts?: { version?: string; licenseId?: string }): string | null {
  const secret = process.env.KIT_SEAL_SECRET;
  if (!secret) return null;
  const label = opts?.version && opts?.licenseId
    ? `arr-seal:v2:${kit}:${opts.version}:${opts.licenseId}`
    : `arr-seal:v1:${kit}`;
  return createHmac("sha256", secret).update(label).digest("hex");
}
