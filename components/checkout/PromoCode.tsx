"use client";

import { useState } from "react";
import { Check, Loader2, Tag } from "lucide-react";
import { formatIDR } from "@/lib/kits";

/* Kode promo: input + "Apply" memeriksa kode ke server (tanpa membuat order).
   State `applied` dipegang induk supaya harga di kartu ikut berubah (coret + harga baru)
   dan kodenya diteruskan ke <BuyButton code>. */

type Item = { type: "kit"; kitId: string } | { type: "bundle" };

export interface AppliedPromo {
  code: string;
  originalAmount: number;
  discount: number;
  amount: number;
}

export function PromoCode({
  item,
  applied,
  onChange,
  className = "",
}: {
  item: Item;
  applied: AppliedPromo | null;
  onChange: (a: AppliedPromo | null) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, code: value }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? "Couldn't check the code.");
      onChange(data as AppliedPromo);
    } catch (err) {
      onChange(null);
      setError((err as Error).message);
    }
    setBusy(false);
  };

  const clear = () => {
    onChange(null);
    setValue("");
    setError("");
  };

  if (applied) {
    return (
      <p className={`flex items-center gap-1.5 text-xs text-green ${className}`}>
        <Check size={13} className="shrink-0" strokeWidth={2.5} />
        <span className="min-w-0 truncate">
          <span className="font-mono">{applied.code}</span> · −{formatIDR(applied.discount)}
        </span>
        <button type="button" onClick={clear} className="ml-auto shrink-0 text-muted underline-offset-2 hover:text-fg hover:underline">
          Remove
        </button>
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-fg ${className}`}
      >
        <Tag size={12} /> Have a promo code?
      </button>
    );
  }

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-col gap-1.5 min-[420px]:flex-row sm:max-lg:flex-col xl:flex-row">
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          placeholder="Promo code"
          aria-label="Promo code"
          maxLength={24}
          className="h-9 min-w-0 flex-1 rounded-full border border-line-strong bg-bg px-3.5 text-sm uppercase text-fg placeholder:normal-case placeholder:text-dim focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={apply}
          disabled={busy || !value.trim()}
          className="flex h-9 shrink-0 items-center justify-center rounded-full border border-line-strong px-4 text-sm text-fg transition-colors hover:bg-surface-2 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p role="alert" className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/** Harga: kalau kode dipakai → harga asli dicoret, harga baru di sebelahnya */
export function Price({
  price,
  applied,
  format = formatIDR,
  className = "",
  oldClassName = "text-[0.7em] font-normal text-dim",
}: {
  price: number;
  applied: AppliedPromo | null;
  format?: (n: number) => string;
  className?: string;
  oldClassName?: string;
}) {
  if (!applied) return <span className={className}>{format(price)}</span>;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <s className={`${oldClassName} tabular-nums`} aria-label={`Was ${format(applied.originalAmount)}`}>{format(applied.originalAmount)}</s>
      <span className={className}>{format(applied.amount)}</span>
    </span>
  );
}
