import "server-only";
import { VIDEO_HOST_PATTERN, type KitVideo } from "@/lib/kits";

/** Vercel Blob aktif? (token otomatis ada saat store dihubungkan ke proyek di Vercel) */
export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

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

export const videoFiles = (v: KitVideo | null | undefined) => (v ? [v.url, v.poster] : []);
