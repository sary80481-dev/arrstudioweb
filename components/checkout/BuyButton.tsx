"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthHint } from "@/lib/auth-hint";

/* ============================================================
   Tombol beli → Midtrans Snap (popup di halaman yang sama).
   Belum login → ke /login lalu kembali ke kit yang sama.
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

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
// client key sandbox berawalan "SB-" — sama dengan cara server memilih endpoint
const SNAP_JS = CLIENT_KEY?.startsWith("SB-")
  ? "https://app.sandbox.midtrans.com/snap/snap.js"
  : "https://app.midtrans.com/snap/snap.js";

let snapLoading: Promise<void> | null = null;

/** snap.js baru dimuat saat tombol pertama kali diklik — landing tetap ringan */
function loadSnap(): Promise<void> {
  if (window.snap) return Promise.resolve();
  snapLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SNAP_JS;
    s.async = true;
    if (CLIENT_KEY) s.dataset.clientKey = CLIENT_KEY;
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
  returnTo,
  className,
  block = false,
  children,
}: {
  item: Item;
  /** tempat kembali setelah login, mis. "/en#kit-clubkit" */
  returnTo: string;
  className: string;
  /** lebar penuh (mis. di kartu harga) */
  block?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const user = useAuthHint();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const buy = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push(`/login?expired=1&next=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!res.ok) throw new Error(data?.error?.message ?? "Couldn't start checkout.");

      const finish = `/checkout/finish?order_id=${encodeURIComponent(data.orderId)}`;
      try {
        await loadSnap();
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
    <span className={block ? "flex flex-col gap-1.5" : "inline-flex flex-col items-end gap-1.5"}>
      <button type="button" onClick={buy} disabled={busy} className={className}>
        {busy && <Loader2 size={15} className="animate-spin" />}
        {children}
      </button>
      {error && (
        <span role="alert" className={`text-xs text-red-500 ${block ? "text-center" : "max-w-[16rem] text-right"}`}>
          {error}
        </span>
      )}
    </span>
  );
}
