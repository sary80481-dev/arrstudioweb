"use client";

/* ============================================================
   Kompresi video di browser (WebCodecs via mediabunny) sebelum upload.
   Target: tetap HD — sisi pendek maks 1080p, H.264 + AAC dalam MP4
   (diputar di semua browser), bitrate cukup tinggi untuk gameplay Roblox
   yang banyak gerak. File tidak pernah dibuat lebih besar dari aslinya.
   ============================================================ */

/** Sisi panjang / pendek maksimum → 1920×1080 untuk landscape, 1080×1920 untuk portrait */
const MAX_LONG = 1920;
const MAX_SHORT = 1080;
/** 6 Mbps di 1080p — setara kualitas YouTube 1080p, turun proporsional untuk resolusi lebih kecil */
const BITRATE_1080P = 6_000_000;
const MIN_BITRATE = 1_500_000;
const AUDIO_BITRATE = 128_000;
export const MAX_DURATION_S = 180;
/** Browser tanpa encoder H.264 → file asli diupload apa adanya asal tidak lebih dari ini */
const MAX_RAW_BYTES = 80 * 1024 * 1024;

export interface CompressResult {
  video: Blob;
  poster: Blob | null;
  width: number;
  height: number;
  duration: number;
  originalSize: number;
  /** false bila file asli dipakai (sudah efisien, atau browser tak bisa encode) */
  compressed: boolean;
}

export class VideoError extends Error {}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** Ukuran target dengan rasio asli, dibatasi 1080p */
function fitHD(w: number, h: number) {
  const scale = Math.min(1, MAX_LONG / Math.max(w, h), MAX_SHORT / Math.min(w, h));
  return { width: even(w * scale), height: even(h * scale), scaled: scale < 1 };
}

const targetBitrate = (w: number, h: number) =>
  Math.max(MIN_BITRATE, Math.round((BITRATE_1080P * (w * h)) / (1920 * 1080)));

async function canvasToWebp(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob | null> {
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type: "image/webp", quality: 0.82 });
  return new Promise((r) => canvas.toBlob(r, "image/webp", 0.82));
}

export async function compressVideo(
  file: File,
  { onProgress, signal }: { onProgress?: (p: number) => void; signal?: AbortSignal } = {}
): Promise<CompressResult> {
  // ±200 KB — dimuat hanya saat admin memilih video
  const mb = await import("mediabunny");
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });

  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new VideoError("This file has no video track.");

    const duration = await input.computeDuration();
    if (duration > MAX_DURATION_S) {
      throw new VideoError(`Keep showcase videos under ${MAX_DURATION_S / 60} minutes (this one is ${Math.round(duration)}s).`);
    }

    const srcW = track.displayWidth;
    const srcH = track.displayHeight;
    const { width, height, scaled } = fitHD(srcW, srcH);
    const bitrate = targetBitrate(width, height);
    const srcBitrate = (file.size * 8) / Math.max(duration, 0.1);

    // poster: frame di ~10% durasi (frame pertama sering hitam / fade-in)
    let poster: Blob | null = null;
    try {
      const sink = new mb.CanvasSink(track, { width: Math.min(width, 1280), poolSize: 1 });
      const frame = await sink.getCanvas(Math.min(duration * 0.1, 2));
      if (frame) poster = await canvasToWebp(frame.canvas);
    } catch {
      // tanpa poster pun video tetap bisa dipakai
    }

    const isMp4Avc = file.type === "video/mp4" && track.codec === "avc";
    // sudah H.264, ≤1080p dan bitrate-nya tidak berlebih → encode ulang hanya menurunkan kualitas
    const alreadyLean = isMp4Avc && !scaled && srcBitrate <= bitrate * 1.15;

    const encodable = await mb.canEncodeVideo("avc", { width, height, quality: new mb.Quality({ bitrate }) });
    if (!encodable) {
      if (isMp4Avc && file.size <= MAX_RAW_BYTES) {
        return { video: file, poster, width: srcW, height: srcH, duration, originalSize: file.size, compressed: false };
      }
      throw new VideoError("This browser can't encode H.264. Use the latest Chrome, Edge or Safari, or upload an MP4 under 80 MB.");
    }

    const output = new mb.Output({
      // moov di depan → video mulai diputar sebelum selesai diunduh
      format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new mb.BufferTarget(),
    });

    const conversion = await mb.Conversion.init({
      input,
      output,
      video: alreadyLean
        ? {} // salin paket apa adanya, hanya remux ke MP4 fast-start
        : {
            width,
            height,
            fit: "contain",
            codec: "avc",
            quality: new mb.Quality({ bitrate: Math.min(bitrate, Math.round(srcBitrate)), bitrateMode: "variable" }),
            keyFrameInterval: 2,
            forceTranscode: true,
          },
      audio: { codec: "aac", quality: new mb.Quality({ bitrate: AUDIO_BITRATE }) },
    });
    if (!conversion.isValid) throw new VideoError("This video format isn't supported. Try exporting it as MP4 (H.264).");

    conversion.onProgress = (p) => onProgress?.(p);
    const abort = () => void conversion.cancel();
    signal?.addEventListener("abort", abort, { once: true });
    try {
      await conversion.execute();
    } finally {
      signal?.removeEventListener("abort", abort);
    }

    const buffer = (output.target as InstanceType<typeof mb.BufferTarget>).buffer;
    if (!buffer) throw new VideoError("Compression produced no output.");
    const video = new Blob([buffer], { type: "video/mp4" });

    // hasil lebih besar dari file asli yang sudah layak putar → pakai yang asli
    if (video.size >= file.size && isMp4Avc && !scaled) {
      return { video: file, poster, width: srcW, height: srcH, duration, originalSize: file.size, compressed: false };
    }
    return { video, poster, width, height, duration, originalSize: file.size, compressed: true };
  } finally {
    input.dispose();
  }
}

/** 12_345_678 → "11.8 MB" */
export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** 83.4 → "1:23" */
export function formatDuration(s: number) {
  const t = Math.round(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
