"use client";

import { api } from "../_components/fields";

let ready: Promise<void> | null = null;

/**
 * Cek store Vercel Blob sekali per sesi sebelum upload. Tanpa ini, store yang
 * hilang / token basi baru ketahuan setelah video selesai dikompres — dan hanya
 * tampil sebagai "CORS error". Gagal → cek diulang pada percobaan berikutnya.
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
