"use client";

/* ============================================================
   Kompresi foto di browser sebelum upload — cepat & kecil.
   • Sisi panjang maks 1920 px (cukup tajam untuk layar penuh / retina di kartu).
   • WebP kualitas ~0.8 (JPEG bila browser tak bisa encode WebP) → biasanya 120–350 KB per foto.
   • createImageBitmap dengan resize: decoding langsung ke ukuran target (jauh lebih cepat & hemat memori
     dibanding menggambar foto 12 MP penuh), EXIF orientasi ikut dikoreksi.
   • File asli dipakai bila sudah lebih kecil dan masih dalam batas ukuran.
   ============================================================ */

export const MAX_EDGE = 1920;
const QUALITY = 0.8;
/** file asli (webp/jpeg) di bawah ini & ≤ MAX_EDGE dipakai apa adanya */
const KEEP_ORIGINAL_UNDER = 300 * 1024;

export class PhotoError extends Error {}

export interface CompressedPhoto {
  blob: Blob;
  ext: "webp" | "jpg";
  contentType: "image/webp" | "image/jpeg";
  width: number;
  height: number;
  originalSize: number;
}

async function toBlob(canvas: HTMLCanvasElement | OffscreenCanvas, type: string, quality: number): Promise<Blob | null> {
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type, quality });
  return new Promise((r) => canvas.toBlob(r, type, quality));
}

/** ukuran (sudah memperhitungkan EXIF) dibaca dari <img> — header saja, tanpa decode piksel penuh */
async function dimensions(file: File): Promise<{ w: number; h: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((ok, fail) => {
      img.onload = () => ok();
      img.onerror = () => fail(new Error("decode"));
    });
    return { w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Decode langsung ke ukuran target (sekali jalan) — foto 12 MP tidak pernah dimuat penuh ke memori */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    const { w, h } = await dimensions(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    return await createImageBitmap(file, {
      imageOrientation: "from-image",
      ...(scale < 1 ? { resizeWidth: Math.round(w * scale), resizeHeight: Math.round(h * scale), resizeQuality: "high" as const } : {}),
    });
  } catch {
    throw new PhotoError(`“${file.name}” can't be read. Use JPG, PNG or WebP (HEIC works only in Safari).`);
  }
}

export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  if (!file.type.startsWith("image/")) throw new PhotoError(`“${file.name}” isn't an image.`);
  const bmp = await decode(file);
  try {
    const { width, height } = bmp;

    const canvas: HTMLCanvasElement | OffscreenCanvas =
      typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(width, height) : Object.assign(document.createElement("canvas"), { width, height });
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) throw new PhotoError("This browser can't process images.");
    ctx.drawImage(bmp, 0, 0);

    let blob = await toBlob(canvas, "image/webp", QUALITY);
    let ext: "webp" | "jpg" = "webp";
    // Safari lama: toBlob("image/webp") diam-diam menghasilkan PNG
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob(canvas, "image/jpeg", QUALITY + 0.04);
      ext = "jpg";
    }
    if (!blob) throw new PhotoError(`“${file.name}” couldn't be compressed.`);

    const originalOk = (file.type === "image/webp" || file.type === "image/jpeg") && file.size < KEEP_ORIGINAL_UNDER && file.size <= blob.size;
    if (originalOk) {
      return {
        blob: file,
        ext: file.type === "image/webp" ? "webp" : "jpg",
        contentType: file.type === "image/webp" ? "image/webp" : "image/jpeg",
        width,
        height,
        originalSize: file.size,
      };
    }
    return { blob, ext, contentType: ext === "webp" ? "image/webp" : "image/jpeg", width, height, originalSize: file.size };
  } finally {
    bmp.close();
  }
}
