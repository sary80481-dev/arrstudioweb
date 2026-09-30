import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { blobUrl } from "@/lib/kit-schema";
import { blobConfigured, blobHealth, deleteBlobs } from "@/lib/server/blob";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";

/** Video sudah dikompres di browser; batas ini hanya pagar untuk file yang lolos tanpa kompresi */
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

const assertConfigured = () => {
  if (!blobConfigured()) {
    throw new ApiError(503, "BLOB_NOT_CONFIGURED", "Video storage isn't set up — connect a Vercel Blob store and set BLOB_READ_WRITE_TOKEN.");
  }
};

/**
 * GET /api/admin/uploads — cek store Blob sebelum admin mulai kompres/upload.
 * Kegagalan di sisi Blob saat upload langsung dari browser hanya terlihat sebagai
 * "CORS error" tanpa pesan, jadi alasannya diambil di sini.
 */
export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  const health = await blobHealth();
  if (!health.ok) throw new ApiError(503, health.code, health.message);
  return json({ ok: true });
});

/**
 * POST /api/admin/uploads — token upload langsung browser → Vercel Blob.
 * File tidak lewat server ini (batas body fungsi Vercel ±4.5 MB), hanya tokennya.
 */
export const POST = handle(async (req: Request) => {
  assertConfigured();
  const body = (await req.json()) as HandleUploadBody;

  const result = await handleUpload({
    request: req,
    body,
    onBeforeGenerateToken: async (pathname) => {
      await requireAdmin(req);
      // video/poster showcase, atau file kit (.rbxm biner / .rbxmx XML) di subfolder packages/
      const media = /^kits\/[a-z0-9-]+\/[\w.-]+\.(mp4|webp)$/.test(pathname);
      const kitFile = /^kits\/[a-z0-9-]+\/packages\/[\w.-]+\.rbxmx?$/.test(pathname);
      if (!media && !kitFile) throw new ApiError(400, "INVALID_PATH", "Invalid upload path.");
      return {
        allowedContentTypes: kitFile ? ["application/octet-stream", "application/xml"] : ["video/mp4", "image/webp"],
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
        // nama file unik per upload → aman di-cache selamanya
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      };
    },
  });
  return json(result);
});

/** DELETE /api/admin/uploads — buang file yang diupload tapi batal dipakai (sheet ditutup tanpa simpan) */
export const DELETE = handle(async (req: Request) => {
  await requireAdmin(req);
  const { urls } = await parseBody(req, z.object({ urls: z.array(blobUrl).min(1).max(10) }));
  await deleteBlobs(urls);
  return json({ ok: true });
});
