import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { z } from "zod";
import { blobUrl } from "@/lib/kit-schema";
import { blobConfigured, blobHealth, deleteBlobs } from "@/lib/server/blob";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";

/** Video sudah dikompres di browser; batas ini hanya pagar untuk file yang lolos tanpa kompresi */
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

/** Foto galeri (setelah kompresi) tidak mungkin sebesar ini — pagar untuk klien yang melewati kompresi */
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

const assertConfigured = () => {
  if (!blobConfigured()) {
    throw new ApiError(503, "BLOB_NOT_CONFIGURED", "Video storage isn't set up — connect a Vercel Blob store to this project and redeploy.");
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
 * POST /api/admin/uploads — URL presigned untuk upload langsung browser → Vercel Blob.
 * File tidak lewat server ini (batas body fungsi Vercel ±4.5 MB), hanya izin uploadnya.
 * Jalur presigned bekerja dengan store ber-OIDC (BLOB_STORE_ID) maupun token lama.
 */
export const POST = handle(async (req: Request) => {
  assertConfigured();
  const body = (await req.json()) as HandleUploadPresignedBody;

  const result = await handleUploadPresigned({
    request: req,
    body,
    // callback "upload selesai" tidak dipakai (URL disimpan oleh form admin sendiri);
    // SDK tetap mewajibkan kunci ini ada, dan Vercel menyediakannya saat store dihubungkan
    webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY || "unused",
    getSignedToken: async (pathname) => {
      await requireAdmin(req);
      // nama file sudah diberi akhiran acak oleh client — izin presigned terikat ke pathname persis
      const media = /^kits\/[a-z0-9-]+\/[\w.-]+\.(mp4|webp)$/.test(pathname);
      const kitFile = /^kits\/[a-z0-9-]+\/packages\/[\w.-]+\.rbxmx?$/.test(pathname);
      // foto galeri: sudah dikompres di browser (WebP/JPEG ≤ ±400 KB) → batas kecil
      const photo =
        /^kits\/[a-z0-9-]+\/gallery\/[\w.-]+\.(webp|jpg)$/.test(pathname) ||
        /^templates\/[a-z0-9]+\/[\w.-]+\.(webp|jpg)$/.test(pathname);
      if (!media && !kitFile && !photo) throw new ApiError(400, "INVALID_PATH", "Invalid upload path.");

      const allowedContentTypes = kitFile
        ? ["application/octet-stream", "application/xml"]
        : photo
          ? ["image/webp", "image/jpeg"]
          : ["video/mp4", "image/webp"];
      const { issueSignedToken } = await import("@vercel/blob");
      const token = await issueSignedToken({
        pathname,
        operations: ["put"],
        allowedContentTypes,
        maximumSizeInBytes: photo ? MAX_PHOTO_BYTES : MAX_UPLOAD_BYTES,
        validUntil: Date.now() + 30 * 60 * 1000,
      });
      return {
        token,
        urlOptions: {
          allowedContentTypes,
          maximumSizeInBytes: photo ? MAX_PHOTO_BYTES : MAX_UPLOAD_BYTES,
          allowOverwrite: false,
          // nama file unik per upload → aman di-cache selamanya
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        },
      };
    },
  });
  return json(result);
});

/** DELETE /api/admin/uploads — buang file yang diupload tapi batal dipakai (sheet ditutup tanpa simpan) */
export const DELETE = handle(async (req: Request) => {
  await requireAdmin(req);
  const { urls } = await parseBody(req, z.object({ urls: z.array(blobUrl).min(1).max(40) }));
  await deleteBlobs(urls);
  return json({ ok: true });
});
