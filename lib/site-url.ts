const PRODUCTION_URL = "https://arrstudioweb.vercel.app";

const isLocal = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);

/**
 * APP_URL dari env (tanpa "/" di akhir), atau undefined bila kosong.
 * Nilai localhost diabaikan saat berjalan di Vercel — sering ikut tersalin dari .env lokal.
 */
export function configuredAppUrl(): string | undefined {
  const url = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (!url || (process.env.VERCEL && isLocal(url))) return undefined;
  return url;
}

/** URL publik situs untuk ditampilkan (docs, contoh kode Roblox) */
export function siteUrl(): string {
  const url = configuredAppUrl();
  if (url) return url;
  if (process.env.VERCEL) {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    return host ? `https://${host}` : PRODUCTION_URL;
  }
  return "http://localhost:3000";
}
