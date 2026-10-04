"use client";

import { api } from "../_components/fields";

let ready: Promise<void> | null = null;

/**
 * Cek store Vercel Blob sekali per sesi sebelum upload. Tanpa ini, store yang
 * hilang / belum terhubung baru ketahuan setelah video selesai dikompres — dan
 * hanya tampil sebagai "CORS error". Gagal → cek diulang pada percobaan berikutnya.
 */
export function ensureBlobReady(): Promise<void> {
  ready ??= api("GET", "/api/admin/uploads").then(
    () => undefined,
    (err) => {
      ready = null;
      throw err;
    }
  );
  return ready;
}

/** "My Kit v2.rbxm" → "My_Kit_v2-9f3a1c7e2b4d6a80.rbxm" — unik & tak bisa ditebak */
export function uniqueName(name: string) {
  const safe = name.replace(/[^\w.-]+/g, "_");
  const dot = safe.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [safe.slice(0, dot), safe.slice(dot)] : [safe, ""];
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${base.slice(0, 60)}-${rand}${ext}`;
}

/** Upload langsung browser → Vercel Blob lewat URL presigned dari /api/admin/uploads */
export async function uploadToBlob(
  pathname: string,
  body: Blob,
  contentType: string,
  signal: AbortSignal,
  onProgress?: (p: number) => void
): Promise<string> {
  const { uploadPresigned } = await import("@vercel/blob/client");
  const res = await uploadPresigned(pathname, body, {
    access: "public",
    handleUploadUrl: "/api/admin/uploads",
    contentType,
    abortSignal: signal,
    onUploadProgress: ({ percentage }) => onProgress?.(percentage / 100),
  });
  return res.url;
}

/** File di Blob yang diupload tapi tidak jadi dipakai (sheet ditutup tanpa simpan) — best effort */
export function discardUrls(urls: string[]) {
  for (let i = 0; i < urls.length; i += 40) {
    fetch("/api/admin/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: urls.slice(i, i + 40) }),
      keepalive: true,
    }).catch(() => {});
  }
}
