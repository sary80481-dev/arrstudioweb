"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import QrisCard from "./QrisCard";

/* ============================================================
   Tombol beli → Midtrans Snap (popup di halaman yang sama).
   Belum login → ke /login lalu kembali ke kit yang sama.
   Pembayaran otomatis belum aktif (PAYMENTS_ENABLED) → dialog ke Discord.
   ============================================================ */

type Item = { type: "kit"; kitId: string } | { type: "bundle" };

interface SnapCallbacks {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}
declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: SnapCallbacks) => void };
  }
}

let snapLoading: Promise<void> | null = null;

/**
 * snap.js baru dimuat saat tombol pertama kali diklik — landing tetap ringan.
 * Client key datang dari respons /api/checkout (bukan env NEXT_PUBLIC_), jadi
 * ganti key cukup ubah env di server tanpa build ulang.
 */
function loadSnap(clientKey: string): Promise<void> {
  if (window.snap) return Promise.resolve();
  snapLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    // client key sandbox berawalan "SB-" — sama dengan cara server memilih endpoint
    s.src = clientKey.startsWith("SB-") ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
    s.async = true;
    s.dataset.clientKey = clientKey;
    s.onload = () => resolve();
    s.onerror = () => {
      snapLoading = null;
      reject(new Error("snap.js failed to load"));
    };
    document.head.appendChild(s);
  });
  return snapLoading;
}

export function BuyButton({
  item,
  code,
  returnTo,
  className,
  block = false,
  wrapperClassName,
  children,
}: {
  item: Item;
  /** kode promo yang sudah divalidasi <PromoCode> (server tetap memeriksa ulang) */
  code?: string;
  /** tempat kembali setelah login, mis. "/en#kit-clubkit" */
  returnTo: string;
  className: string;
  /** lebar penuh (mis. di kartu harga) */
  block?: boolean;
  /** ganti kelas pembungkus tombol + pesan error */
  wrapperClassName?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // pembayaran otomatis belum aktif → URL Discord untuk order manual
  const [discordUrl, setDiscordUrl] = useState<string | null>(null);
  const buy = async () => {
    setBusy(true);
    setError("");
    try {
      // server yang menentukan: login dulu (401), lalu Discord (pembayaran mati) atau Snap
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, code }),
      });
      const data = await res.json().catch(() => null);
      if (data?.error?.code === "PAYMENTS_OFFLINE") {
        setDiscordUrl(data.error.url);
        setBusy(false);
        return;
      }
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!res.ok) throw new Error(data?.error?.message ?? "Couldn't start checkout.");

      const finish = `/checkout/finish?order_id=${encodeURIComponent(data.orderId)}`;
      try {
        if (!data.clientKey) throw new Error("no client key");
        await loadSnap(data.clientKey);
      } catch {
        // popup gagal dimuat (mis. diblokir) → halaman pembayaran Midtrans penuh
        window.location.href = data.redirectUrl;
        return;
      }
      window.snap!.pay(data.token, {
        onSuccess: () => router.push(finish),
        onPending: () => router.push(finish),
        onError: () => setError("Payment failed. Please try another method."),
        onClose: () => setBusy(false),
      });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <span className={wrapperClassName ?? (block ? "flex flex-col gap-1.5" : "inline-flex flex-col items-end gap-1.5")}>
      <button type="button" onClick={buy} disabled={busy} className={className}>
        {busy && <Loader2 size={15} className="animate-spin" />}
        {children}
      </button>
      {error && (
        <span role="alert" className={`text-xs text-red-500 ${block ? "text-center" : "max-w-[16rem] text-right"}`}>
          {error}
        </span>
      )}
      {discordUrl && <DiscordOrderDialog url={discordUrl} onClose={() => setDiscordUrl(null)} />}
    </span>
  );
}

/**
 * Selama checkout otomatis belum aktif: jelaskan singkat lalu arahkan ke Discord.
 * Dirender lewat portal — kartu induk memakai transform (animasi Reveal) yang
 * membuat `position: fixed` menempel ke kartu, bukan ke layar.
 */
function DiscordOrderDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const joinRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    joinRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discord-order-title"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm animate-[pagein_0.2s_ease-out] sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[28px] bg-bg p-8 text-center text-fg shadow-float sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors hover:text-fg"
        >
          <X size={16} />
        </button>

        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#5865F2] text-white">
          <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden fill="currentColor">
            <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.36 1.22 1.99a.08.08 0 0 0 .09.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z" />
          </svg>
        </span>

        <h2 id="discord-order-title" className="text-display mt-6 text-3xl">Order through Discord</h2>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">
          Instant checkout is coming soon. For now, join our Discord and open an order ticket — you&apos;ll get your license
          key and kit file right after payment.
        </p>

        <QrisCard className="mt-6 bg-surface-2 text-left" />

        <a
          ref={joinRef}
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#5865F2] text-base font-medium text-white transition-[background-color,transform] hover:bg-[#4752c4] active:scale-[0.98]"
        >
          Join the Discord
          <ArrowUpRight size={17} />
        </a>
        <button type="button" onClick={onClose} className="mt-3 h-11 w-full rounded-full text-[15px] text-muted transition-colors hover:text-fg">
          Maybe later
        </button>
      </div>
    </div>,
    document.body
  );
}
