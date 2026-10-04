import "server-only";
import { VIDEO_HOST_PATTERN, type KitPhoto, type KitVideo } from "@/lib/kits";

/**
 * Vercel Blob aktif? Store yang dihubungkan dari dashboard sekarang memakai
 * BLOB_STORE_ID + OIDC (token diambil otomatis oleh SDK saat berjalan di Vercel);
 * store lama / setup manual memakai BLOB_READ_WRITE_TOKEN. Keduanya didukung.
 */
export const blobConfigured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

/**
 * Pastikan store di balik token benar-benar ada & bisa dipakai. Upload dari browser
 * yang gagal di sisi Blob hanya muncul sebagai "CORS error" tanpa pesan, jadi admin
 * mengecek ini dulu sebelum mulai kompres / upload.
 */
export async function blobHealth(): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  if (!blobConfigured()) {
    return { ok: false, code: "BLOB_NOT_CONFIGURED", message: "Video storage isn't set up — connect a Vercel Blob store to this project and redeploy." };
  }
  const blob = await import("@vercel/blob");
  try {
    await blob.list({ limit: 1 });
    return { ok: true };
  } catch (err) {
    if (err instanceof blob.BlobStoreNotFoundError) {
      return {
        ok: false,
        code: "BLOB_STORE_MISSING",
        message: "The connected Blob store no longer exists. Connect a store in Vercel → Storage, then redeploy.",
      };
    }
    if (err instanceof blob.BlobStoreSuspendedError) {
      return { ok: false, code: "BLOB_STORE_SUSPENDED", message: "The Vercel Blob store is suspended — check your Vercel plan / usage." };
    }
    if (err instanceof blob.BlobAccessError) {
      return { ok: false, code: "BLOB_TOKEN_INVALID", message: "Vercel Blob rejected this project's credentials. Reconnect the Blob store in Vercel and redeploy." };
    }
    return { ok: false, code: "BLOB_UNAVAILABLE", message: `Vercel Blob is unavailable: ${(err as Error).message}` };
  }
}

const isOurBlob = (url: string) => {
  try {
    return VIDEO_HOST_PATTERN.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

/** Hapus file di Blob — best effort: gagal hapus tidak boleh menggagalkan simpan kit */
export async function deleteBlobs(urls: (string | null | undefined)[]) {
  const list = urls.filter((u): u is string => !!u && isOurBlob(u));
  if (list.length === 0 || !blobConfigured()) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(list);
  } catch (err) {
    console.warn("[blob] delete failed:", (err as Error).message);
  }
}

export const galleryFiles = (g: KitPhoto[] | null | undefined) => (g ?? []).map((p) => p.url);

export const videoFiles = (v: KitVideo | null | undefined) => (v ? [v.url, v.poster] : []);
