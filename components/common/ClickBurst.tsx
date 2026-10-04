"use client";

import { useEffect } from "react";

/**
 * Cincin "pop" kecil di titik klik (gaya kartun). Hanya untuk mouse, mati bila
 * reduced-motion. Satu elemen per klik, dihapus sendiri setelah animasinya selesai.
 */
export default function ClickBurst() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const el = document.createElement("span");
      el.className = "click-burst";
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.addEventListener("animationend", () => el.remove(), { once: true });
      document.body.appendChild(el);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
