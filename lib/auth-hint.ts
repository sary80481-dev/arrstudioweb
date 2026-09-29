"use client";

import { useSyncExternalStore } from "react";

/** Isi cookie `arr_user` (lihat setAuthHint di lib/server/session.ts) — bukan data rahasia */
export interface AuthHint {
  name: string;
  role: "user" | "admin";
}

const COOKIE = "arr_user";

function read(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? m[1] : null;
}

function parse(raw: string | null): AuthHint | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    return typeof v?.n === "string" ? { name: v.n, role: v.r === "admin" ? "admin" : "user" } : null;
  } catch {
    return null;
  }
}

// cookie bisa berubah di tab lain (login/logout) → cek ulang saat tab kembali aktif
function subscribe(onChange: () => void) {
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/**
 * User yang sedang login menurut cookie petunjuk. Server merender versi "belum login"
 * (landing statis), lalu browser menggantinya setelah hydrate — tanpa request jaringan.
 */
export function useAuthHint(): AuthHint | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return parse(raw);
}

/** Hapus petunjuk di browser segera setelah logout (server juga menghapusnya) */
export function clearAuthHint() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}
