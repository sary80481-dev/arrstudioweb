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
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const revoked = license.status === "revoked";
  const used = license.places.length;
  const full = used >= license.maxPlaces;

  const release = async (placeId: string) => {
    if (!confirm(`Remove place ${placeId} from this license? The kit stops working there, and you can remove another place again in 30 days.`)) return;
    setError("");
    setRemoving(placeId);
    const res = await fetch(`/api/licenses/${encodeURIComponent(license.key)}/places/${placeId}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    setRemoving(null);
    if (!res.ok) {
      const retry = body?.error?.retryAt ? ` You can remove a place again after ${date(body.error.retryAt)}.` : "";
      setError((body?.error?.message ?? "Could not remove this place.") + retry);
    }
    // data baru datang sendiri lewat onSnapshot
  };

  return (
    <Panel highlight={!revoked && used > 0} innerClassName="p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gold">{license.kitName}</p>
          <p className="mt-1.5 break-all font-mono text-lg text-fg">{license.key}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            revoked ? "bg-red-500/10 text-red-500" : used ? "bg-green/10 text-green" : "bg-gold-soft text-gold"
          }`}
        >
          {revoked ? "Revoked" : used ? "Active" : "Unused"}
        </span>
      </div>

      {/* potongan Config siap tempel */}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-bg px-4 py-3">
        <code className="min-w-0 truncate font-mono text-[13px] text-muted">
          <span className="text-fg">LicenseKey</span> = <span className="text-green">&quot;{license.key}&quot;</span>,
        </code>
        <CopyButton text={`LicenseKey = "${license.key}",`} label="Copy for Config" />
      </div>

      {!revoked &&
        (downloadable ? (
          <a
            href={`/api/kits/${encodeURIComponent(license.kit)}/download`}
            download
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Download size={15} /> Download {license.kitName} (.rbxm)
          </a>
        ) : (
          <p className="mt-3 text-center text-xs text-dim">The kit file will be available to download here soon.</p>
        ))}

      {/* ─── PLACES: satu key, beberapa slot ─── */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-fg">Places</p>
          <p className={`text-sm tabular-nums ${full ? "text-gold" : "text-muted"}`}>
            {used} / {license.maxPlaces} used
          </p>
        </div>
        {/* bilah slot */}
        <div className="mt-2 flex gap-1">
          {Array.from({ length: license.maxPlaces }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < used ? "bg-brand" : "bg-bg"}`} />
          ))}
        </div>

        {used > 0 && (
          <ul className="mt-3 space-y-1.5">
            {license.places.map((p) => (
              <li key={p} className="flex items-center justify-between gap-3 rounded-2xl bg-bg px-4 py-2.5">
                <a
                  href={`https://www.roblox.com/games/${p}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-sm text-fg hover:text-gold"
                >
                  {p} <ExternalLink size={12} className="shrink-0" />
                </a>
                {!revoked && (
                  <button
                    type="button"
                    onClick={() => release(p)}
                    disabled={removing !== null}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                  >
                    {removing === p && <Loader2 size={12} className="animate-spin" />}
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!revoked && (
          <p className="mt-3 text-xs leading-relaxed text-dim">
            {full
              ? "All slots are in use. To use this key in a new place, remove one you no longer need."
              : "Paste the same key into any place — it links itself on the first server start."}
            {license.releaseAvailableAt && ` Next removal available ${date(license.releaseAvailableAt)}.`}
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-dim">Last check</dt>
          <dd className="mt-0.5 text-fg">{date(license.lastVerifiedAt)}</dd>
        </div>
        <div>
          <dt className="text-dim">Version</dt>
          <dd className="mt-0.5 font-mono text-fg">{license.lastKitVersion ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-dim">Checks</dt>
          <dd className="mt-0.5 font-mono text-fg">{license.verifyCount}</dd>
        </div>
      </dl>
    </Panel>
  );
}
