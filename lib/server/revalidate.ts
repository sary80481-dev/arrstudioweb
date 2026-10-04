import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Landing dibuat statis (ISR) tanpa listener realtime di browser — itu menghemat ±600 KB JavaScript per pengunjung.
 * Agar perubahan dari /admin (kit, harga) tetap langsung terlihat, halaman landing dibuang dari cache di sini.
 */
export function revalidateLanding() {
  try {
    revalidatePath("/[lang]", "page");
  } catch (err) {
    // di luar konteks request (mis. skrip) tidak ada cache untuk dibuang
    console.warn("[revalidate] skipped", (err as Error).message);
  }
}
