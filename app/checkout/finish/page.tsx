"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock, Copy, Download, Loader2, X } from "lucide-react";
import { formatIDR } from "@/lib/kits";
import { Logo, buttonClass } from "@/components/templates/landing/_components/ui";

interface Order {
  orderId: string;
  title: string;
  amount: number;
  status: "pending" | "fulfilling" | "paid" | "failed";
  paymentType: string | null;
  licenseKeys: string[];
  kits: { id: string; name: string }[];
}

const POLL_MS = 3000;
const POLL_FOR_MS = 10 * 60 * 1000;

function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [downloads, setDownloads] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let timer: number | undefined;
    const started = Date.now();
    let stopped = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error?.message ?? "Couldn't load this order.");
        if (stopped) return;
        setOrder(data.order);
        setDownloads(data.downloads ?? {});
        const settled = data.order.status === "paid" || data.order.status === "failed";
        if (!settled && Date.now() - started < POLL_FOR_MS) timer = window.setTimeout(tick, POLL_MS);
      } catch (err) {
        if (!stopped) setError((err as Error).message);
      }
    };
    tick();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [orderId]);

  return { order, downloads, error };
}

function KeyRow({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
      <code className="font-mono text-[15px] tracking-wide text-fg">{value}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
        aria-label={`Copy ${value}`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
      >
        {copied ? <Check size={15} className="text-green" /> : <Copy size={15} />}
      </button>
    </li>
  );
}

function FinishContent() {
  const orderId = useSearchParams().get("order_id");
  const { order, downloads, error } = useOrder(orderId);

  if (!orderId || error) {
    return (
      <Status icon={<X size={22} />} tone="bg-red-500/10 text-red-500" title="We couldn't find this order">
        {error || "The payment link is missing its order number."}
      </Status>
    );
  }

  if (!order || order.status === "fulfilling") {
    return (
      <Status icon={<Loader2 size={22} className="animate-spin" />} tone="bg-surface-2 text-fg" title="Confirming your payment…">
        This usually takes a few seconds.
      </Status>
    );
  }

  if (order.status === "failed") {
    return (
      <Status icon={<X size={22} />} tone="bg-red-500/10 text-red-500" title="Payment didn't go through">
        The payment for <b className="font-medium text-fg">{order.title}</b> was cancelled or expired. You haven&apos;t been charged.
        <div className="mt-8">
          <Link href="/#kits" className={buttonClass("gold", "lg")}>Try again</Link>
        </div>
      </Status>
    );
  }

  if (order.status === "pending") {
    return (
      <Status icon={<Clock size={22} />} tone="bg-gold-soft text-gold" title="Waiting for your payment">
        Finish paying <b className="font-medium text-fg">{formatIDR(order.amount)}</b> for {order.title} (QRIS, virtual account or
        e-wallet). This page updates on its own the moment it clears.
        <p className="mt-6 font-mono text-xs text-dim">Order {order.orderId}</p>
      </Status>
    );
  }

  return (
    <Status icon={<Check size={22} strokeWidth={2.5} />} tone="bg-green/10 text-green" title="You're all set.">
      {order.title} · {formatIDR(order.amount)}. Paste a key into the kit&apos;s Config module and publish.
      <ul className="mt-8 space-y-2 text-left">
        {order.licenseKeys.map((k) => (
          <KeyRow key={k} value={k} />
        ))}
      </ul>
      {order.kits.some((k) => downloads[k.id]) && (
        <div className="mt-6 flex flex-col gap-2">
          {order.kits
            .filter((k) => downloads[k.id])
            .map((k) => (
              <a key={k.id} href={`/api/kits/${encodeURIComponent(k.id)}/download`} download className={buttonClass("gold", "lg", "w-full")}>
                <Download size={16} /> Download {k.name} (.rbxm)
              </a>
            ))}
        </div>
      )}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/dashboard" className={buttonClass("outline", "lg")}>Go to dashboard</Link>
        <Link href="/docs" className={buttonClass("outline", "lg")}>Setup guide</Link>
      </div>
    </Status>
  );
}

function Status({ icon, tone, title, children }: { icon: React.ReactNode; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg animate-[pagein_0.4s_ease-out] text-center">
      <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>{icon}</span>
      <h1 className="text-display mt-8 text-4xl text-fg sm:text-5xl">{title}</h1>
      <div className="mt-4 text-[17px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export default function CheckoutFinishPage() {
  return (
    <main className="flex min-h-svh flex-col bg-bg px-5">
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center">
        <Logo />
      </header>
      <div className="flex flex-1 items-center py-16">
        <Suspense>
          <FinishContent />
        </Suspense>
      </div>
    </main>
  );
}
