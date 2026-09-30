"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, ExternalLink, KeyRound, Loader2, LogOut, Radio } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import type { LicenseDto } from "@/lib/server/licenses";
import { useLicensesSync, useRealtimeAuthSync } from "@/lib/realtime";
import { selectLicenses, selectRealtime, useAppSelector } from "@/lib/store/store";
import { Button, Panel } from "@/components/templates/landing/_components/ui";

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
        router.push("/login");
        router.refresh();
      }}
      className="flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-gold"
    >
      {done ? <Check size={13} className="text-green" /> : <Copy size={13} />}
      {done ? "Copied" : label}
    </button>
  );
}

/** Indikator koneksi realtime */
export function LiveBadge({ live }: { live: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${live ? "text-green" : "text-dim"}`}>
      <Radio size={13} className={live ? "animate-pulse" : ""} />
      {live ? "Live" : "Connecting…"}
    </span>
  );
}

/** Daftar lisensi milik user — realtime: lisensi yang baru diterbitkan admin langsung muncul */
export function LiveLicenses({ uid, downloads }: { uid: string; downloads: Record<string, boolean> }) {
  // sambungkan realtime → Redux; data awal sudah di-preload dari server
  useRealtimeAuthSync();
  useLicensesSync({ ownerUid: uid });
  const { items } = useAppSelector(selectLicenses);
  const realtime = useAppSelector(selectRealtime);
  const licenses = items ?? [];
  const live = !!realtime.uid;

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="text-muted">
          {licenses.length} {licenses.length === 1 ? "license" : "licenses"} on this account.
        </p>
        <LiveBadge live={live} />
      </div>

      {licenses.length === 0 ? (
        <Panel className="mt-10" innerClassName="flex flex-col items-center px-6 py-16 text-center">
          <KeyRound size={36} strokeWidth={1.5} className="text-gold" />
          <h2 className="mt-5 font-display text-3xl font-bold uppercase text-fg">No licenses yet</h2>
          <p className="mt-2 max-w-md text-muted">
            Once you buy a kit, its license key appears here instantly — ready to paste into the kit&apos;s Config module.
          </p>
          <Button href="/#pricing" className="mt-7">See pricing</Button>
        </Panel>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {licenses.map((l) => (
            <LicenseCard key={l.key} license={l} downloadable={!!downloads[l.kit]} />
          ))}
        </div>
      )}
    </>
  );
}

function LicenseCard({ license, downloadable }: { license: LicenseDto; downloadable: boolean }) {
  const [placeId, setPlaceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const revoked = license.status === "revoked";

  const rebind = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(`/api/licenses/${encodeURIComponent(license.key)}/rebind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: placeId.trim() }),
    });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      const retry = body?.error?.retryAt ? ` Try again after ${date(body.error.retryAt)}.` : "";
      setError((body?.error?.message ?? "Could not move this license.") + retry);
      return;
    }
    // data baru datang sendiri lewat onSnapshot
    setPlaceId("");
  };

  return (
    <Panel highlight={!revoked && !!license.placeId} innerClassName="p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-gold">{license.kitName}</p>
          <p className="mt-2 break-all font-mono text-lg text-fg">{license.key}</p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 font-display text-xs font-bold uppercase tracking-[0.2em] ${
            revoked ? "bg-red-500/10 text-red-500" : license.placeId ? "bg-green/10 text-green" : "bg-gold-soft text-gold"
          }`}
        >
          {revoked ? "Revoked" : license.placeId ? "Bound" : "Unused"}
        </span>
      </div>

      {/* potongan Config siap tempel */}
      <div className="mt-5 flex items-center justify-between gap-3 border border-line bg-bg px-4 py-3">
        <code className="min-w-0 truncate font-mono text-[13px] text-muted">
          <span className="text-fg">LicenseKey</span> = <span className="text-green">&quot;{license.key}&quot;</span>,
        </code>
        <CopyButton text={`LicenseKey = "${license.key}",`} label="Copy for Config" />
      </div>

      {!revoked && (
        downloadable ? (
          <a
            href={`/api/kits/${encodeURIComponent(license.kit)}/download`}
            download
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Download size={15} /> Download {license.kitName} (.rbxm)
          </a>
        ) : (
          <p className="mt-3 text-center text-xs text-dim">The kit file will be available to download here soon.</p>
        )
      )}

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-dim">Place</dt>
          <dd className="mt-0.5 text-fg">
            {license.placeId ? (
              <a
                href={`https://www.roblox.com/games/${license.placeId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono hover:text-gold"
              >
                {license.placeId} <ExternalLink size={12} />
              </a>
            ) : (
              "Binds on first server start"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-dim">Last check</dt>
          <dd className="mt-0.5 text-fg">{date(license.lastVerifiedAt)}</dd>
        </div>
        <div>
          <dt className="text-dim">Installed version</dt>
          <dd className="mt-0.5 font-mono text-fg">{license.lastKitVersion ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-dim">Checks</dt>
          <dd className="mt-0.5 font-mono text-fg">{license.verifyCount}</dd>
        </div>
      </dl>

      {!revoked && (
        <form onSubmit={rebind} className="mt-6 border-t border-line pt-5">
          <label htmlFor={`place-${license.key}`} className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {license.placeId ? "Move to another place" : "Bind to a place now"}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={`place-${license.key}`}
              inputMode="numeric"
              placeholder="Place ID, e.g. 13284790215"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value.replace(/\D/g, ""))}
              className="h-11 min-w-0 flex-1 border border-line-strong bg-bg px-3 font-mono text-sm text-fg placeholder:text-dim focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !placeId}
              className="chamfer-sm flex h-11 items-center justify-center gap-2 bg-gold-grad px-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-on-gold transition hover:brightness-110 disabled:opacity-50"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
          {license.rebindAvailableAt && (
            <p className="mt-2 text-xs text-dim">Next move available {date(license.rebindAvailableAt)}.</p>
          )}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </form>
      )}
    </Panel>
  );
}
