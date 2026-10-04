"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Download, QrCode } from "lucide-react";

/**
 * Poster QRIS merchant (GoPay Merchant — ARRR STUDIO). Dipakai untuk pembayaran manual
 * (order lewat Discord & cicilan): pembeli scan, isi nominal sendiri, lalu kirim bukti transfer.
 * Gambar baru dimuat saat dibuka (details) → tidak membebani halaman.
 */
export default function QrisCard({
  amountHint,
  defaultOpen = false,
  className = "",
}: {
  /** nominal yang disarankan, mis. "Rp 599.000" (QRIS statis: pembeli mengetik nominal sendiri) */
  amountHint?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl bg-bg ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
          <QrCode size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-fg">Pay with QRIS</span>
          <span className="block text-xs text-muted">Any bank or e-wallet — GoPay, BCA, Mandiri, BNI, BRI, …</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-dim transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-3.5 pb-4">
          <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-xl">
            <Image
              src="/qris-poster.jpg"
              alt="QRIS — ARRR STUDIO"
              width={1129}
              height={1600}
              sizes="280px"
              className="h-auto w-full"
            />
          </div>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            This is a static QRIS: enter the amount yourself{amountHint ? <> (<span className="font-medium text-fg">{amountHint}</span>)</> : null}, then send the
            transfer proof to us on Discord.
          </p>
          <a
            href="/qris-poster.jpg"
            download="qris-arrr-studio.jpg"
            className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2"
          >
            <Download size={13} /> Save QR image
          </a>
        </div>
      )}
    </div>
  );
}
