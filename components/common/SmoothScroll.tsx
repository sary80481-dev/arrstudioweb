"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Instance aktif — dipakai tombol "kembali ke atas" dsb. */
let instance: Lenis | null = null;

/** Scroll halus ke posisi/elemen; jatuh ke scroll native bila Lenis tidak aktif. */
export function smoothScrollTo(target: number | string | HTMLElement, offset = 0) {
  if (instance) return instance.scrollTo(target, { offset });
  if (typeof target === "number") return window.scrollTo({ top: target + offset, behavior: "smooth" });
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Scroll halus (inersia) untuk halaman panjang. Tidak menghaluskan scroll di dalam
 * modal / elemen ber-`data-lenis-prevent`, dan berhenti saat body dikunci (modal terbuka).
 * Menghormati prefers-reduced-motion.
 */
export default function SmoothScroll({ anchorOffset = -96 }: { anchorOffset?: number }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 1,
      stopInertiaOnNavigate: true,
      prevent: (node) =>
        document.body.style.overflow === "hidden" || !!node.closest?.('[aria-modal="true"], [data-lenis-prevent]'),
    });
    instance = lenis;

    // link "#…" di halaman yang sama: batalkan lompatan bawaan (bentrok dengan Lenis → tersentak),
    // scroll halus dikurangi tinggi navbar, lalu perbarui hash (listener hashchange tetap jalan)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: anchorOffset });
      if (location.hash !== url.hash) {
        history.pushState(null, "", url.hash);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
      if (instance === lenis) instance = null;
    };
  }, [anchorOffset]);

  return null;
}
