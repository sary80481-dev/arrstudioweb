"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, BookOpen, Check, ChevronDown, Copy, Download, KeyRound, Loader2, Lock, LogOut, MoreHorizontal, Plus, Radio, Sparkles, Users, X,
} from "lucide-react";
import { KitIcon } from "@/components/common/KitIcon";
import { isLocked, type InstallmentDto } from "@/lib/installment";
import { DISCORD_INVITE } from "@/lib/links";
import { formatIDR } from "@/lib/kits";
import { signOut } from "@/lib/auth-client";
import type { LicenseDto } from "@/lib/server/licenses";
import { useLicensesSync, useRealtimeAuthSync } from "@/lib/realtime";
import { selectLicenses, selectRealtime, useAppSelector } from "@/lib/store/store";
import { buttonClass } from "@/components/templates/landing/_components/ui";

/* ============================================================
   Dashboard pembeli — halaman akun ala produk:
   ringkasan di atas, satu kartu per lisensi, place sebagai kartu game
   (ikon & nama dari Roblox), slot kosong bisa diisi langsung.
   ============================================================ */

export interface KitMeta {
  icon: string;
  version: string;
  poster: string | null;
  tagline: string;
}

export interface PlaceInfo {
  placeId: string;
  name: string;
  creator: string | null;
  iconUrl: string | null;
  playing: number;
  visits: number;
}

/* ─── helper ─── */

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }) : null;

/** "2 minutes ago" — lebih mudah dibaca dari tanggal lengkap */
function ago(iso: string | null) {
  if (!iso) return "Never";
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["second", 60], ["minute", 60], ["hour", 24], ["day", 30], ["month", 12], ["year", Infinity]];
  let v = s;
  for (const [unit, size] of steps) {
    if (Math.abs(v) < size) return rtf ? rtf.format(Math.round(v), unit) : new Date(iso).toLocaleString();
    v /= size;
  }
  return new Date(iso).toLocaleString();
}

const fullDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "");
const compact = (n: number) => new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);

/** Terima Place ID atau link game ("roblox.com/games/137119588172614/…") */
export function parsePlaceId(raw: string): string | null {
  const t = raw.trim();
  const fromUrl = t.match(/roblox\.com\/(?:[a-z-]+\/)?games\/(\d{1,20})/i)?.[1];
  const id = fromUrl ?? (/^\d{1,20}$/.test(t) ? t : null);
  return id && !id.startsWith("0") ? id : null;
}

/** "1.2.0" < "1.10.0" */
function older(a: string | null, b: string | null) {
  if (!a || !b) return false;
  const pa = a.split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) < (pb[i] ?? 0);
  return false;
}

/* ─── komponen kecil yang diekspor ─── */

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      aria-label="Sign out"
      title="Sign out"
      onClick={async () => {
        setBusy(true);
        await signOut();
        router.push("/login");
        router.refresh();
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
    </button>
  );
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors ${
        done ? "bg-green/10 text-green" : "bg-bg text-fg hover:bg-fg/[0.08]"
      } ${className}`}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? "Copied" : label}
    </button>
  );
}

export function LiveBadge({ live }: { live: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${live ? "bg-green/10 text-green" : "bg-surface-2 text-dim"}`}>
      <Radio size={12} className={live ? "animate-pulse" : ""} />
      {live ? "Live" : "Connecting…"}
    </span>
  );
}

/* ─── info game dari Roblox (nama, ikon, pemain) ─── */
function usePlaceInfo(placeIds: string[], initial: Record<string, PlaceInfo | null>) {
  const [info, setInfo] = useState<Record<string, PlaceInfo | null>>(initial);
  // hanya place yang belum diketahui (mis. baru ditambahkan) yang diambil dari client
  const key = [...new Set(placeIds)].filter((id) => !(id in info)).sort().join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/roblox/places?ids=${key}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && d?.places && setInfo((prev) => ({ ...prev, ...d.places })))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]);

  return info;
}

/* ============================================================
   HALAMAN
   ============================================================ */
export function LiveLicenses({
  uid,
  name,
  downloads,
  kits,
  places: initialPlaces = {},
}: {
  uid: string;
  name: string;
  downloads: Record<string, boolean>;
  kits: Record<string, KitMeta>;
  /** info game yang sudah diambil server (render pertama langsung lengkap) */
  places?: Record<string, PlaceInfo | null>;
}) {
  // sambungkan realtime → Redux; data awal sudah di-preload dari server
  useRealtimeAuthSync();
  useLicensesSync({ ownerUid: uid });
  const { items } = useAppSelector(selectLicenses);
  const realtime = useAppSelector(selectRealtime);
  const licenses = useMemo(() => items ?? [], [items]);
  const live = !!realtime.uid;

  const places = licenses.flatMap((l) => l.places);
  const info = usePlaceInfo(places, initialPlaces);
  const slots = licenses.filter((l) => l.status === "active").reduce((n, l) => n + l.maxPlaces, 0);
  const kitCount = new Set(licenses.map((l) => l.kit)).size;
  const first = name.split(" ")[0] || "there";

  return (
    <>
      {/* ─── SAPAAN + RINGKASAN ─── */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-display text-4xl text-fg sm:text-5xl md:text-6xl">
            Hi, {first}. <span className="text-muted">Your kits.</span>
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-muted sm:text-[17px]">
            Keys, files and the places they run in. <LiveBadge live={live} />
          </p>
        </div>
        <Link href="/docs" className={buttonClass("outline", "md")}>
          <BookOpen size={16} /> Setup guide
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-2.5 sm:mt-10 sm:gap-3">
        {[
          [licenses.length, licenses.length === 1 ? "License" : "Licenses"],
          [`${places.length}/${slots}`, "Places in use"],
          [kitCount, kitCount === 1 ? "Kit" : "Kits"],
        ].map(([v, l]) => (
          <div key={String(l)} className="flex flex-col-reverse rounded-2xl bg-surface-2 px-4 py-4 sm:rounded-[22px] sm:px-5 sm:py-5 md:px-7 md:py-6">
            <dt className="mt-1 text-[13px] text-muted md:text-sm">{l}</dt>
            <dd className="text-display text-3xl text-fg tabular-nums md:text-4xl">{v}</dd>
          </div>
        ))}
      </dl>

      {licenses.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[28px] bg-surface-2 px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-bg text-gold">
            <KeyRound size={28} strokeWidth={1.6} />
          </span>
          <h2 className="text-display mt-6 text-3xl text-fg">No licenses yet</h2>
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-muted">
            Buy a kit and its key appears here instantly — with the kit file to download and room for your places.
          </p>
          <Link href="/#kits" className={buttonClass("gold", "lg", "mt-8")}>Browse kits</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {licenses.map((l) => (
            <LicenseCard key={l.key} license={l} kit={kits[l.kit]} downloadable={!!downloads[l.kit]} places={info} />
          ))}
        </div>
      )}
    </>
  );
}

/* ============================================================
   KARTU LISENSI
   ============================================================ */
function LicenseCard({
  license,
  kit,
  downloadable,
  places,
}: {
  license: LicenseDto;
  kit: KitMeta | undefined;
  downloadable: boolean;
  places: Record<string, PlaceInfo | null>;
}) {
  const revoked = license.status === "revoked";
  const used = license.places.length;
  const free = Math.max(0, license.maxPlaces - used);
  const outdated = older(license.lastKitVersion, kit?.version ?? null);
  const inst = license.installment;
  const locked = isLocked(license);

  const status = revoked
    ? { label: "Revoked", cls: "bg-red-500/10 text-red-500" }
    : locked
      ? { label: "Awaiting payment", cls: "bg-gold-soft text-gold" }
      : used
        ? { label: "Active", cls: "bg-green/10 text-green" }
        : { label: "Not used yet", cls: "bg-bg text-muted" };

  return (
    <article className={`overflow-hidden rounded-[24px] bg-surface-2 sm:rounded-[28px] ${revoked ? "opacity-70" : ""}`}>
      {/* ─── KEPALA ─── */}
      <div className="relative isolate overflow-hidden px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-7">
        {kit?.poster && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- poster dari Vercel Blob, sudah webp kecil */}
            <img src={kit.poster} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-2/70 via-surface-2/90 to-surface-2" />
          </>
        )}
        <div className="flex items-start gap-3.5 sm:gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bg text-gold sm:h-14 sm:w-14 sm:rounded-[18px]">
            <KitIcon icon={kit?.icon ?? "sparkles"} size={24} strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-[-0.025em] text-fg sm:text-2xl">{license.kitName}</h2>
            <p className="mt-0.5 truncate text-sm text-muted">{kit?.tagline || "License"}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.cls}`}>{status.label}</span>
              {outdated && !revoked && !locked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-xs text-gold">
                  <Sparkles size={12} /> v{kit?.version} available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-5 sm:px-8 sm:pb-6">
        {/* ─── BELUM LUNAS: pembayaran + key terkunci ─── */}
        {!revoked && inst && locked && <PaymentPanel installment={inst} />}

        {/* ─── KEY ─── */}
        {locked ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-3 pl-4 opacity-80 sm:rounded-[20px]">
            <Lock size={16} className="shrink-0 text-dim" />
            <code className="min-w-0 flex-1 truncate font-mono text-[15px] tracking-wide text-dim sm:text-lg">ARR-••••-••••-••••</code>
            <span className="shrink-0 rounded-full bg-bg px-3 py-1.5 text-xs text-dim">Locked</span>
          </div>
        ) : (
          <div className="rounded-2xl bg-bg p-3 sm:rounded-[20px] sm:p-2 sm:pl-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 break-all px-1 font-mono text-[15px] tracking-wide text-fg sm:py-1.5 sm:text-lg md:text-xl">{license.key}</code>
              <div className="grid grid-cols-2 gap-1.5 sm:flex">
                <CopyButton text={license.key} label="Copy key" className="justify-center bg-surface-2! py-2" />
                <CopyButton text={`LicenseKey = "${license.key}",`} label="Config line" className="justify-center bg-surface-2! py-2" />
              </div>
            </div>
          </div>
        )}

        {/* ─── UNDUH ─── */}
        {!revoked && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {locked ? (
              <span className={buttonClass("outline", "md", "pointer-events-none text-muted! max-sm:w-full")}>
                <Lock size={15} /> Download unlocks when fully paid
              </span>
            ) : downloadable ? (
              <a href={`/api/kits/${encodeURIComponent(license.kit)}/download`} download className={buttonClass("gold", "md", "max-sm:w-full")}>
                <Download size={16} /> Download .rbxm
              </a>
            ) : (
              <span className={buttonClass("outline", "md", "pointer-events-none text-muted! max-sm:w-full")}>
                <Download size={16} /> File coming soon
              </span>
            )}
            {!locked && (
              <p className="text-[13px] text-dim">
                Paste the key into <code className="font-mono text-muted">Config</code>, then publish.
              </p>
            )}
          </div>
        )}

        {/* riwayat cicilan yang sudah lunas */}
        {!revoked && inst && !locked && inst.payments.length > 0 && (
          <details className="group rounded-2xl bg-bg px-4 py-3 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-muted [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-green" /> Paid in full · {formatIDR(inst.total)}</span>
              <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
            </summary>
            <PaymentHistory payments={inst.payments} />
          </details>
        )}
      </div>

      {/* ─── PLACES ─── */}
      <div className="px-5 pb-5 sm:px-8 sm:pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-fg">Places</h3>
          <p className="text-sm text-muted">
            <span className="tabular-nums text-fg">{used}</span> of {license.maxPlaces} used
            {free > 0 && !revoked && !locked && <> · {free} free</>}
          </p>
        </div>

        {locked ? (
          <p className="mt-3 flex items-start gap-2.5 rounded-2xl border border-dashed border-line-strong p-4 text-[13px] leading-relaxed text-dim">
            <Lock size={14} className="mt-0.5 shrink-0" />
            Places can be added once this license is fully paid. The kit won&apos;t pass its license check until then.
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {license.places.map((p) => (
                <PlaceCard key={p} license={license} placeId={p} info={places[p]} canRemove={!revoked} />
              ))}
              {!revoked && Array.from({ length: free }, (_, i) => <AddPlace key={`free-${i}`} license={license} first={i === 0} />)}
            </div>
            {!revoked && (
              <p className="mt-4 text-[13px] leading-relaxed text-dim">
                A new place also links itself the first time its server starts with this key.
                {license.releaseAvailableAt && <> You can remove a place again {ago(license.releaseAvailableAt)}.</>}
              </p>
            )}
          </>
        )}
      </div>

      {/* ─── KAKI: status teknis ─── */}
      <dl className="grid grid-cols-3 gap-3 bg-bg/40 px-5 py-4 text-sm sm:gap-4 sm:px-8">
        <div className="min-w-0">
          <dt className="text-dim">Last check</dt>
          <dd className="mt-0.5 truncate text-fg" title={fullDate(license.lastVerifiedAt)}>{ago(license.lastVerifiedAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-dim">Installed</dt>
          <dd className="mt-0.5 truncate font-mono text-fg">{license.lastKitVersion ? `v${license.lastKitVersion}` : "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-dim">Checks</dt>
          <dd className="mt-0.5 truncate font-mono text-fg">{compact(license.verifyCount)}</dd>
        </div>
      </dl>
    </article>
  );
}

/* ─── CICILAN: progres, sisa, langkah berikutnya ─── */
function PaymentPanel({ installment: inst }: { installment: InstallmentDto }) {
  const pct = Math.min(100, Math.round((inst.paid / inst.total) * 100));
  const steps = [
    ["Transfer", "Pay the next installment."],
    ["Send proof", "Share the transfer receipt with us on Discord."],
    ["Unlocked", "We confirm it and everything opens up here."],
  ];

  return (
    <section className="rounded-2xl bg-bg p-4 sm:rounded-[20px] sm:p-6" aria-label="Installment payment">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
          <Lock size={16} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-fg sm:text-lg">Finish your payment to unlock</h3>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted sm:text-sm">
            Your key, kit file and places open as soon as the last installment is confirmed.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-display text-3xl text-fg tabular-nums sm:text-4xl">{pct}%</span>
          <span className="text-[13px] text-muted">paid</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label="Amount paid"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-gold-grad transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3 sm:text-left">
        {[
          ["Total", formatIDR(inst.total), "text-fg"],
          ["Paid", formatIDR(inst.paid), "text-green"],
          ["Remaining", formatIDR(inst.remaining), "text-gold"],
        ].map(([label, value, tone]) => (
          <div key={label} className="min-w-0 rounded-xl bg-surface-2 px-2 py-2.5 sm:px-4 sm:py-3">
            <dt className="text-[11px] text-dim sm:text-xs">{label}</dt>
            <dd className={`mt-0.5 truncate text-[13px] font-semibold tabular-nums sm:text-base ${tone}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-fg">{i + 1}</span>
            <span className="min-w-0 text-[13px] leading-snug text-muted">
              <span className="block font-medium text-fg">{title}</span>
              {text}
            </span>
          </li>
        ))}
      </ol>

      <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className={buttonClass("gold", "md", "mt-5 w-full sm:w-auto")}>
        Send proof on Discord <ArrowUpRight size={16} />
      </a>

      {inst.payments.length > 0 && (
        <details className="group mt-4 border-t border-line pt-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-muted [&::-webkit-details-marker]:hidden">
            Payment history ({inst.payments.length})
            <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
          </summary>
          <PaymentHistory payments={inst.payments} />
        </details>
      )}
    </section>
  );
}

function PaymentHistory({ payments }: { payments: InstallmentDto["payments"] }) {
  return (
    <ul className="mt-3 divide-y divide-line text-[13px]">
      {payments.map((p, i) => (
        <li key={i} className="flex items-baseline justify-between gap-3 py-2">
          <span className="min-w-0 text-muted">
            <span className="block text-fg">{p.note || "Payment"}</span>
            <span className="text-xs text-dim">{fullDate(p.at)}</span>
          </span>
          <span className="shrink-0 tabular-nums text-fg">{formatIDR(p.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── SLOT TERISI: kartu game ─── */
function PlaceCard({
  license,
  placeId,
  info,
  canRemove,
}: {
  license: LicenseDto;
  placeId: string;
  /** undefined = masih dimuat, null = Roblox bilang tidak ada */
  info: PlaceInfo | null | undefined;
  canRemove: boolean;
}) {
  const [menu, setMenu] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);
  const cooldown = !!license.releaseAvailableAt;
  const closeMenu = () => {
    setMenu(false);
    setConfirming(false);
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/licenses/${encodeURIComponent(license.key)}/places/${placeId}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(body?.error?.retryAt ? `You can remove a place again ${ago(body.error.retryAt)}.` : body?.error?.message ?? "Couldn't remove it.");
      setConfirming(false);
      return;
    }
    // kartu hilang sendiri lewat onSnapshot
  };

  const url = `https://www.roblox.com/games/${placeId}`;

  return (
    <div className="relative flex min-h-[92px] items-center gap-3.5 rounded-[20px] bg-bg p-3.5 pr-12 transition-shadow hover:shadow-card">
      {info?.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- ikon dari CDN Roblox
        <img src={info.iconUrl} alt="" className="h-16 w-16 shrink-0 rounded-[14px] bg-surface-2 object-cover" />
      ) : (
        <span className={`h-16 w-16 shrink-0 rounded-[14px] bg-surface-2 ${info === undefined ? "animate-pulse" : ""}`} />
      )}

      <div className="min-w-0">
        {info === undefined ? (
          <>
            <span className="block h-4 w-32 animate-pulse rounded-full bg-surface-2" />
            <span className="mt-2 block font-mono text-xs text-dim">{placeId}</span>
          </>
        ) : (
          <>
            <a href={url} target="_blank" rel="noreferrer" className="block truncate text-[15px] font-semibold text-fg hover:text-gold">
              {info?.name ?? `Place ${placeId}`}
            </a>
            <p className="truncate text-xs text-muted">{info ? `by ${info.creator ?? "unknown"}` : "Not found on Roblox"}</p>
            <p className="mt-1.5 flex items-center gap-2.5 text-xs text-dim">
              {info ? (
                <>
                  <span className={`inline-flex items-center gap-1 ${info.playing > 0 ? "text-green" : ""}`}>
                    <Users size={12} /> {compact(info.playing)} playing
                  </span>
                  <span>{compact(info.visits)} visits</span>
                </>
              ) : (
                <span className="font-mono">{placeId}</span>
              )}
            </p>
          </>
        )}
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>

      {/* menu ⋯ */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => (menu ? closeMenu() : setMenu(true))}
        aria-label={`Options for place ${placeId}`}
        aria-haspopup="menu"
        aria-expanded={menu}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <MoreHorizontal size={16} />}
      </button>

      {menu && (
        <Popover anchorRef={btnRef} onClose={closeMenu} title={info?.name ?? `Place ${placeId}`}>
          <a href={url} target="_blank" rel="noreferrer" onClick={closeMenu} className={menuItem}>
            <ArrowUpRight size={16} className="text-muted" /> Open in Roblox
          </a>
          <CopyRow text={placeId} />
          {canRemove &&
            (confirming ? (
              <div className="mt-1 rounded-xl bg-red-500/10 p-3.5">
                <p className="text-[13px] leading-relaxed text-red-500">
                  The kit stops working in this place. After this, you can remove another place in 30 days.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-full bg-surface-2 py-2.5 text-sm text-fg transition-colors hover:bg-fg/[0.1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                  >
                    {busy && <Loader2 size={14} className="animate-spin" />}
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={cooldown}
                className={`${menuItem} text-red-500! hover:bg-red-500/10 disabled:cursor-not-allowed disabled:text-dim! disabled:hover:bg-transparent`}
              >
                <X size={16} />
                <span>
                  Remove from license
                  {cooldown && <span className="block text-xs text-dim">Available {ago(license.releaseAvailableAt)}</span>}
                </span>
              </button>
            ))}
        </Popover>
      )}
    </div>
  );
}

const menuItem =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-surface-2 max-sm:py-3.5 max-sm:text-base";

const MENU_W = 272;
const GAP = 8;
const EDGE = 12;

/**
 * Menu mengambang yang dirender di <body> (portal) — tidak terpotong oleh kartu
 * ber-overflow-hidden. Desktop: menempel ke tombol, membuka ke atas bila ruang
 * di bawah kurang, ikut bergeser saat scroll/resize. HP: bottom sheet.
 */
function Popover({
  anchorRef,
  onClose,
  title,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [sheet, setSheet] = useState(false);

  useLayoutEffect(() => {
    const place = () => {
      const isSheet = window.matchMedia("(max-width: 639px)").matches;
      setSheet(isSheet);
      const a = anchorRef.current?.getBoundingClientRect();
      const h = menuRef.current?.offsetHeight ?? 0;
      if (!a || isSheet) return;
      const below = window.innerHeight - a.bottom - GAP - EDGE;
      const up = h > below && a.top - GAP - EDGE > below;
      setPos({
        top: up ? Math.max(EDGE, a.top - GAP - h) : a.bottom + GAP,
        left: Math.min(Math.max(EDGE, a.right - MENU_W), window.innerWidth - MENU_W - EDGE),
      });
    };
    place();
    // tinggi menu berubah (mis. panel konfirmasi terbuka) → hitung ulang posisi
    const ro = new ResizeObserver(place);
    if (menuRef.current) ro.observe(menuRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef]);

  // klik di luar / Escape → tutup
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  // bottom sheet mengunci scroll halaman di belakangnya
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  return createPortal(
    sheet ? (
      <div className="fixed inset-0 z-[90]">
        <div aria-hidden className="absolute inset-0 animate-[pagein_0.2s_ease-out] bg-black/50 backdrop-blur-[2px]" />
        <div
          ref={menuRef}
          role="menu"
          aria-label={title}
          className="absolute inset-x-0 bottom-0 animate-[sheet-up_0.28s_cubic-bezier(0.2,0.7,0.2,1)] rounded-t-[28px] bg-surface p-3 pb-[max(env(safe-area-inset-bottom),16px)] shadow-float"
        >
          <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-line-strong" />
          <p className="truncate px-3 pb-2 pt-1 text-sm font-semibold text-fg">{title}</p>
          {children}
        </div>
      </div>
    ) : (
      <div
        ref={menuRef}
        role="menu"
        aria-label={title}
        style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width: MENU_W, visibility: pos ? "visible" : "hidden" }}
        className="fixed z-[90] animate-[pagein_0.15s_ease-out] rounded-2xl bg-surface p-1.5 shadow-float ring-1 ring-line"
      >
        {children}
      </div>
    ),
    document.body
  );
}

function CopyRow({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className={menuItem}
    >
      {done ? <Check size={16} className="text-green" /> : <Copy size={16} className="text-muted" />}
      {done ? "Copied" : "Copy place ID"}
    </button>
  );
}

/* ─── SLOT KOSONG: klik → isi Place ID / link game ─── */
function AddPlace({ license, first }: { license: LicenseDto; first: boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const parsed = parsePlaceId(value);
  const close = () => {
    setOpen(false);
    setValue("");
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!parsed) return setError("Paste a Place ID or a roblox.com/games/… link.");
    setBusy(true);
    setError("");
    const res = await fetch(`/api/licenses/${encodeURIComponent(license.key)}/places`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: parsed }),
    });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) return setError(body?.error?.issues?.[0]?.message ?? body?.error?.message ?? "Couldn't add this place.");
    // slot terisi lewat onSnapshot
    close();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-h-[92px] items-center gap-3.5 rounded-[20px] bg-bg/50 p-3.5 text-left transition-colors hover:bg-bg"
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-surface text-muted transition-colors group-hover:bg-brand group-hover:text-on-brand">
          <Plus size={22} />
        </span>
        <span>
          <span className="block text-[15px] font-semibold text-fg">{first ? "Add a place" : "Free slot"}</span>
          <span className="block text-xs text-muted">Place ID or game link</span>
        </span>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex min-h-[92px] flex-col justify-center rounded-[20px] bg-bg p-3 ring-2 ring-gold/60">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Escape" && close()}
          placeholder="Place ID or roblox.com/games/…"
          aria-label="Place ID or Roblox game link"
          className="h-10 min-w-0 flex-1 rounded-xl bg-surface-2 px-3 font-mono text-sm text-fg placeholder:font-sans placeholder:text-dim focus:outline-none focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Cancel"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
        >
          <X size={16} />
        </button>
      </div>
      <p className={`mt-2 px-1 text-xs ${error ? "text-red-500" : "text-dim"}`}>
        {error || (parsed && parsed !== value.trim() ? `Place ID ${parsed}` : "We check it on Roblox before saving.")}
      </p>
    </form>
  );
}
