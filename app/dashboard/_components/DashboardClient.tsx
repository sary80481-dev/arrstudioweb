"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, BookOpen, Check, ChevronDown, Copy, Download, KeyRound, Layers, LayoutGrid, LifeBuoy, Loader2, Lock, LogOut,
  MoreHorizontal, Plus, Radio, ShieldCheck, Sparkles, Users, Wallet, X,
} from "lucide-react";
import { KitIcon } from "@/components/common/KitIcon";
import { isLocked, type InstallmentDto } from "@/lib/installment";
import { DISCORD_INVITE } from "@/lib/links";
import { formatIDR } from "@/lib/kits";
import { signOut } from "@/lib/auth-client";
import type { LicenseDto } from "@/lib/server/licenses";
import { useLicensesSync, useRealtimeAuthSync } from "@/lib/realtime";
import { selectLicenses, selectRealtime, useAppSelector } from "@/lib/store/store";
import { Logo, buttonClass } from "@/components/templates/landing/_components/ui";
import ThemeToggle from "@/components/theme/ThemeToggle";

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
   SHELL: sidebar (desktop) / bottom bar (HP) + tiga tampilan
   Overview → apa yang perlu perhatian · Licenses → detail per lisensi · Payments → cicilan
   ============================================================ */
type View = "overview" | "licenses" | "payments";

const NAV: { id: View; label: string; icon: typeof KeyRound }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "licenses", label: "Licenses", icon: KeyRound },
  { id: "payments", label: "Payments", icon: Wallet },
];

function licenseState(l: LicenseDto): { label: string; dot: string; cls: string } {
  if (l.status === "revoked") return { label: "Revoked", dot: "bg-red-500", cls: "bg-red-500/10 text-red-500" };
  if (isLocked(l)) return { label: "Awaiting payment", dot: "bg-gold", cls: "bg-gold-soft text-gold" };
  if (l.places.length) return { label: "Active", dot: "bg-green", cls: "bg-green/10 text-green" };
  return { label: "Not used yet", dot: "bg-dim", cls: "bg-bg text-muted" };
}

export function Dashboard({
  uid,
  name,
  email,
  isAdmin,
  downloads,
  kits,
  places: initialPlaces = {},
}: {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
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

  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<{ key: string; tab?: Tab } | null>(null);
  const current = licenses.find((l) => l.key === selected?.key) ?? licenses[0];

  const lockedList = licenses.filter((l) => l.status === "active" && isLocked(l));
  const open = (key: string, tab?: Tab) => {
    setSelected({ key, tab });
    setView("licenses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const badge = (id: View) => (id === "licenses" ? licenses.length : id === "payments" ? lockedList.length : 0);
  const initial = (name || email || "?").trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-svh bg-bg lg:grid lg:grid-cols-[256px_1fr]">
      {/* ═══ SIDEBAR (desktop) ═══ */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-line px-4 py-5 lg:flex">
        <div className="px-2"><Logo /></div>

        <nav aria-label="Dashboard" className="mt-8 space-y-1">
          {NAV.map((n) => {
            const on = view === n.id;
            const count = badge(n.id);
            return (
              <button
                key={n.id}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => setView(n.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
                  on ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2/60 hover:text-fg"
                }`}
              >
                <n.icon size={18} strokeWidth={1.8} className={on ? "text-gold" : ""} />
                {n.label}
                {count > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs tabular-nums ${n.id === "payments" ? "bg-gold-soft text-gold" : "bg-bg text-muted"}`}>{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-1 border-t border-line pt-4 text-[15px]">
          <Link href="/docs" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition-colors hover:bg-surface-2/60 hover:text-fg">
            <BookOpen size={18} strokeWidth={1.8} /> Setup guide
          </Link>
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition-colors hover:bg-surface-2/60 hover:text-fg">
            <LifeBuoy size={18} strokeWidth={1.8} /> Support <ArrowUpRight size={13} className="ml-auto" />
          </a>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gold transition-colors hover:bg-gold-soft">
              <ShieldCheck size={18} strokeWidth={1.8} /> Admin
            </Link>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2.5 rounded-2xl bg-surface-2 p-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand">{initial}</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-medium text-fg">{name}</span>
            <span className="block truncate text-xs text-dim">{email}</span>
          </span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0">
        {/* ═══ TOP BAR (HP) ═══ */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl lg:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link href="/admin" aria-label="Admin" className="flex h-9 w-9 items-center justify-center rounded-full text-gold hover:bg-gold-soft">
                <ShieldCheck size={17} />
              </Link>
            )}
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          {view === "overview" && (
            <Overview
              name={name}
              live={live}
              licenses={licenses}
              kits={kits}
              downloads={downloads}
              lockedList={lockedList}
              open={open}
              goPayments={() => setView("payments")}
            />
          )}

          {view === "licenses" && (
            <>
              <ViewHeader title="Licenses" desc="Keys, files and the places they run in." live={live} />
              {licenses.length === 0 ? (
                <EmptyLicenses />
              ) : (
                <>
                  {licenses.length > 1 && (
                    <div role="tablist" aria-label="Choose a license" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                      {licenses.map((l) => {
                        const st = licenseState(l);
                        const on = l.key === current?.key;
                        return (
                          <button
                            key={l.key}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => setSelected({ key: l.key })}
                            className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-colors ${
                              on ? "border-gold/60 bg-surface-2" : "border-line bg-bg text-muted hover:bg-surface-2/60"
                            }`}
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-bg text-gold">
                              <KitIcon icon={kits[l.kit]?.icon ?? "sparkles"} size={16} strokeWidth={1.7} />
                            </span>
                            <span className="leading-tight">
                              <span className="block max-w-[140px] truncate text-sm font-medium text-fg">{l.kitName}</span>
                              <span className="flex items-center gap-1.5 text-xs text-dim">
                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {current && (
                    <LicenseCard
                      key={`${current.key}:${selected?.tab ?? ""}`}
                      license={current}
                      kit={kits[current.kit]}
                      downloadable={!!downloads[current.kit]}
                      places={info}
                      initialTab={selected?.key === current.key ? selected.tab : undefined}
                    />
                  )}
                </>
              )}
            </>
          )}

          {view === "payments" && <Payments licenses={licenses} kits={kits} open={open} />}
        </main>
      </div>

      {/* ═══ BOTTOM NAV (HP) ═══ */}
      <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {NAV.map((n) => {
          const on = view === n.id;
          const count = n.id === "payments" ? badge(n.id) : 0;
          return (
            <button
              key={n.id}
              type="button"
              aria-current={on ? "page" : undefined}
              onClick={() => setView(n.id)}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${on ? "text-fg" : "text-dim"}`}
            >
              <span className="relative">
                <n.icon size={21} strokeWidth={1.8} className={on ? "text-gold" : ""} />
                {count > 0 && <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-bg" />}
              </span>
              {n.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ViewHeader({ title, desc, live }: { title: string; desc: string; live?: boolean }) {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-display text-3xl text-fg sm:text-4xl">{title}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-muted sm:text-base">
        {desc} {live !== undefined && <LiveBadge live={live} />}
      </p>
    </div>
  );
}

function EmptyLicenses() {
  return (
    <div className="flex flex-col items-center rounded-[28px] bg-surface-2 px-6 py-16 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-bg text-gold">
        <KeyRound size={28} strokeWidth={1.6} />
      </span>
      <h2 className="text-display mt-6 text-3xl text-fg">No licenses yet</h2>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
        Buy a kit and its key appears here instantly — with the kit file to download and room for your places.
      </p>
      <Link href="/#kits" className={buttonClass("gold", "lg", "mt-8")}>Browse kits</Link>
    </div>
  );
}

/* ─── OVERVIEW ─── */
function Overview({
  name,
  live,
  licenses,
  kits,
  downloads,
  lockedList,
  open,
  goPayments,
}: {
  name: string;
  live: boolean;
  licenses: LicenseDto[];
  kits: Record<string, KitMeta>;
  downloads: Record<string, boolean>;
  lockedList: LicenseDto[];
  open: (key: string, tab?: Tab) => void;
  goPayments: () => void;
}) {
  const first = name.split(" ")[0] || "there";
  const usable = licenses.filter((l) => l.status === "active");
  const used = licenses.reduce((n, l) => n + l.places.length, 0);
  const slots = usable.reduce((n, l) => n + l.maxPlaces, 0);
  const due = lockedList.reduce((n, l) => n + (l.installment?.remaining ?? 0), 0);
  const kitCount = new Set(licenses.map((l) => l.kit)).size;

  const stats: { label: string; value: string; hint: string; icon: typeof KeyRound; tone?: string; onClick?: () => void }[] = [
    { label: "Licenses", value: String(licenses.length), hint: `${kitCount} ${kitCount === 1 ? "kit" : "kits"}`, icon: KeyRound },
    { label: "Places in use", value: `${used}/${slots}`, hint: slots - used > 0 ? `${slots - used} free` : "All slots used", icon: Layers },
    due > 0
      ? { label: "Balance due", value: formatIDR(due), hint: `${lockedList.length} unpaid`, icon: Wallet, tone: "text-gold", onClick: goPayments }
      : { label: "Balance due", value: "Rp 0", hint: "All paid", icon: Wallet, tone: "text-green" },
  ];

  return (
    <>
      <ViewHeader title={`Hi, ${first}`} desc="Here's where your kits stand." live={live} />

      {licenses.length === 0 ? (
        <EmptyLicenses />
      ) : (
        <div className="space-y-8">
          {/* perlu perhatian */}
          {lockedList.length > 0 && (
            <section aria-label="Needs attention" className="space-y-3">
              {lockedList.map((l) => {
                const i = l.installment!;
                const pct = Math.min(100, Math.round((i.paid / i.total) * 100));
                return (
                  <div key={l.key} className="relative overflow-hidden rounded-[24px] border border-gold/30 bg-gold-soft p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gold">
                          <Lock size={13} /> Action needed
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-fg sm:text-2xl">
                          {formatIDR(i.remaining)} left to unlock {l.kitName}
                        </h2>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg/70" role="progressbar" aria-label="Amount paid" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full rounded-full bg-gold-grad transition-[width] duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 text-[13px] text-muted">
                          <span className="tabular-nums text-fg">{formatIDR(i.paid)}</span> of {formatIDR(i.total)} paid · {pct}%
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:w-52">
                        <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className={buttonClass("gold", "md", "w-full")}>
                          Send proof <ArrowUpRight size={16} />
                        </a>
                        <button type="button" onClick={() => open(l.key, "payment")} className={buttonClass("outline", "md", "w-full bg-bg/50")}>
                          View payment
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* angka ringkas */}
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((st) => {
              const Tag = st.onClick ? "button" : "div";
              return (
                <Tag
                  key={st.label}
                  {...(st.onClick ? { type: "button" as const, onClick: st.onClick } : {})}
                  className={`flex items-center gap-4 rounded-2xl bg-surface-2 p-4 text-left sm:flex-col sm:items-start sm:gap-3 sm:p-5 ${st.onClick ? "transition-colors hover:bg-surface-2/70" : ""}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg text-gold">
                    <st.icon size={19} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0">
                    <dt className="text-[13px] text-muted">{st.label}</dt>
                    <dd className={`text-display truncate text-2xl tabular-nums sm:mt-0.5 sm:text-3xl ${st.tone ?? "text-fg"}`}>{st.value}</dd>
                    <span className="text-xs text-dim">{st.hint}</span>
                  </span>
                </Tag>
              );
            })}
          </dl>

          {/* lisensi kamu */}
          <section aria-label="Your licenses">
            <h2 className="mb-3 text-lg font-semibold tracking-[-0.01em] text-fg">Your licenses</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {licenses.map((l) => {
                const st = licenseState(l);
                const locked = isLocked(l);
                const kit = kits[l.kit];
                return (
                  <li key={l.key}>
                    <div className="group flex h-full flex-col rounded-2xl bg-surface-2 p-4 transition-shadow hover:shadow-card sm:p-5">
                      <button type="button" onClick={() => open(l.key)} className="flex items-start gap-3.5 text-left">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg text-gold">
                          <KitIcon icon={kit?.icon ?? "sparkles"} size={21} strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-semibold text-fg group-hover:text-gold">{l.kitName}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-dim">
                            <span className={`rounded-full px-2 py-0.5 font-medium ${st.cls}`}>{st.label}</span>
                            <span className="tabular-nums">{l.places.length}/{l.maxPlaces} places</span>
                          </span>
                        </span>
                        <ArrowUpRight size={16} className="shrink-0 text-dim transition-colors group-hover:text-fg" />
                      </button>

                      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5">
                        {l.status === "revoked" ? (
                          <span className="text-[13px] text-dim">This license was revoked.</span>
                        ) : locked ? (
                          <>
                            <Lock size={14} className="text-dim" />
                            <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-dim">ARR-••••-••••-••••</code>
                            <button type="button" onClick={() => open(l.key, "payment")} className="shrink-0 text-[13px] font-medium text-gold hover:underline">Pay</button>
                          </>
                        ) : (
                          <>
                            <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-muted">{l.key}</code>
                            <CopyButton text={l.key} label="Copy" className="bg-bg! py-1" />
                            {downloads[l.kit] && (
                              <a
                                href={`/api/kits/${encodeURIComponent(l.kit)}/download`}
                                download
                                aria-label={`Download ${l.kitName}`}
                                title="Download .rbxm"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold transition-colors hover:bg-gold hover:text-on-gold"
                              >
                                <Download size={15} />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}

/* ─── PAYMENTS: semua cicilan ─── */
function Payments({ licenses, kits, open }: { licenses: LicenseDto[]; kits: Record<string, KitMeta>; open: (key: string, tab?: Tab) => void }) {
  const plans = licenses.filter((l) => l.installment);
  const paid = plans.reduce((n, l) => n + l.installment!.paid, 0);
  const total = plans.reduce((n, l) => n + l.installment!.total, 0);
  const remaining = total - paid;

  return (
    <>
      <ViewHeader title="Payments" desc="Installments, what you've paid and what's left." />

      {plans.length === 0 ? (
        <div className="flex flex-col items-center rounded-[28px] bg-surface-2 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg text-green"><Check size={26} /></span>
          <h2 className="text-display mt-5 text-2xl text-fg">Nothing to pay</h2>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">None of your licenses are on an installment plan. If you split a payment, it shows up here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <dl className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              ["Total", formatIDR(total), "text-fg"],
              ["Paid", formatIDR(paid), "text-green"],
              ["Remaining", formatIDR(remaining), remaining > 0 ? "text-gold" : "text-dim"],
            ].map(([label, value, tone]) => (
              <div key={label} className="min-w-0 rounded-2xl bg-surface-2 px-3.5 py-3.5 sm:px-5 sm:py-4">
                <dt className="text-xs text-dim sm:text-[13px]">{label}</dt>
                <dd className={`mt-1 truncate text-sm font-semibold tabular-nums sm:text-xl ${tone}`}>{value}</dd>
              </div>
            ))}
          </dl>

          <ul className="space-y-3">
            {plans.map((l) => {
              const i = l.installment!;
              const locked = isLocked(l);
              const pct = Math.min(100, Math.round((i.paid / i.total) * 100));
              return (
                <li key={l.key} className="rounded-2xl bg-surface-2 p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg text-gold">
                      <KitIcon icon={kits[l.kit]?.icon ?? "sparkles"} size={20} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <h2 className="truncate text-base font-semibold text-fg">{l.kitName}</h2>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${locked ? "bg-gold-soft text-gold" : "bg-green/10 text-green"}`}>
                          {locked ? `${formatIDR(i.remaining)} left` : "Paid in full"}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg" role="progressbar" aria-label={`${l.kitName} paid`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                        <div className={`h-full rounded-full transition-[width] duration-500 ${locked ? "bg-gold-grad" : "bg-green"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-2 text-[13px] text-muted">
                        <span className="tabular-nums text-fg">{formatIDR(i.paid)}</span> of {formatIDR(i.total)} · {pct}%
                      </p>
                    </div>
                  </div>

                  <details className="group mt-4 border-t border-line pt-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
                      History ({i.payments.length})
                      <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
                    </summary>
                    {i.payments.length > 0 ? <PaymentHistory payments={i.payments} /> : <p className="mt-2 text-[13px] text-dim">No payments confirmed yet.</p>}
                  </details>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    {locked && (
                      <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className={buttonClass("gold", "sm", "max-sm:w-full")}>
                        Send proof on Discord <ArrowUpRight size={15} />
                      </a>
                    )}
                    <button type="button" onClick={() => open(l.key)} className={buttonClass("outline", "sm", "max-sm:w-full")}>
                      Open license
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

/* ============================================================
   KARTU LISENSI
   ============================================================ */
type Tab = "payment" | "places" | "activity";

function LicenseCard({
  license,
  kit,
  downloadable,
  places,
  initialTab,
}: {
  license: LicenseDto;
  kit: KitMeta | undefined;
  downloadable: boolean;
  places: Record<string, PlaceInfo | null>;
  /** tab yang dibuka pertama (mis. dari tombol "View payment") */
  initialTab?: Tab;
}) {
  const revoked = license.status === "revoked";
  const used = license.places.length;
  const free = Math.max(0, license.maxPlaces - used);
  const outdated = older(license.lastKitVersion, kit?.version ?? null);
  const inst = license.installment;
  const locked = isLocked(license);
  const pct = inst ? Math.min(100, Math.round((inst.paid / inst.total) * 100)) : 100;

  const tabs: { id: Tab; label: string; badge?: string; alert?: boolean }[] = [
    ...(inst ? [{ id: "payment" as const, label: "Payment", badge: locked ? `${pct}%` : "Paid", alert: locked }] : []),
    { id: "places", label: "Places", badge: `${used}/${license.maxPlaces}` },
    { id: "activity", label: "Activity" },
  ];
  // belum lunas → buka tab Payment dulu; selebihnya Places
  const [picked, setPicked] = useState<Tab>(initialTab ?? (locked ? "payment" : "places"));
  const tab = tabs.some((t) => t.id === picked) ? picked : tabs[0].id;

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = tabs[(next + tabs.length) % tabs.length];
    setPicked(target.id);
    document.getElementById(`${license.key}-tab-${target.id}`)?.focus();
  };

  const status = revoked
    ? { label: "Revoked", cls: "bg-red-500/10 text-red-500" }
    : locked
      ? { label: "Awaiting payment", cls: "bg-gold-soft text-gold" }
      : used
        ? { label: "Active", cls: "bg-green/10 text-green" }
        : { label: "Not used yet", cls: "bg-bg text-muted" };

  return (
    <article className={`grid overflow-hidden rounded-[24px] bg-surface-2 sm:rounded-[28px] xl:grid-cols-[minmax(0,320px)_1fr] ${revoked ? "opacity-70" : ""}`}>
      {/* ═══ KIRI: identitas, key, unduh ═══ */}
      <aside className="relative isolate flex flex-col gap-5 overflow-hidden p-5 sm:p-6 xl:border-r xl:border-line">
        {kit?.poster && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- poster dari Vercel Blob, sudah webp kecil */}
            <img src={kit.poster} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-2/60 via-surface-2/90 to-surface-2" />
          </>
        )}

        <div className="flex items-start gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bg text-gold">
            <KitIcon icon={kit?.icon ?? "sparkles"} size={24} strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-[-0.025em] text-fg">{license.kitName}</h2>
            <p className="mt-0.5 truncate text-sm text-muted">{kit?.tagline || "License"}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.cls}`}>{status.label}</span>
              {outdated && !revoked && !locked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-xs text-gold">
                  <Sparkles size={12} /> v{kit?.version}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KEY */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dim">License key</p>
          {locked ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-line-strong p-3 pl-3.5">
              <Lock size={15} className="shrink-0 text-dim" />
              <code className="min-w-0 flex-1 truncate font-mono text-[15px] tracking-wide text-dim">ARR-••••-••••-••••</code>
            </div>
          ) : (
            <div className="rounded-2xl bg-bg p-3">
              <code className="block break-all px-1 py-1 font-mono text-[15px] tracking-wide text-fg">{license.key}</code>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <CopyButton text={license.key} label="Copy key" className="justify-center bg-surface-2! py-2" />
                <CopyButton text={`LicenseKey = "${license.key}",`} label="Config line" className="justify-center bg-surface-2! py-2" />
              </div>
            </div>
          )}
        </div>

        {/* UNDUH */}
        {!revoked && (
          <div className="mt-auto">
            {locked ? (
              <button type="button" onClick={() => setPicked("payment")} className={buttonClass("gold", "md", "w-full")}>
                <Lock size={15} /> Unlock — {formatIDR(inst!.remaining)} left
              </button>
            ) : downloadable ? (
              <a href={`/api/kits/${encodeURIComponent(license.kit)}/download`} download className={buttonClass("gold", "md", "w-full")}>
                <Download size={16} /> Download .rbxm
              </a>
            ) : (
              <span className={buttonClass("outline", "md", "pointer-events-none w-full text-muted!")}>
                <Download size={16} /> File coming soon
              </span>
            )}
            <p className="mt-2.5 text-center text-xs text-dim">
              {locked ? "Key, file and places unlock when fully paid." : <>Paste the key into <code className="font-mono text-muted">Config</code>, then publish.</>}
            </p>
          </div>
        )}
      </aside>

      {/* ═══ KANAN: tab ═══ */}
      <div className="flex min-w-0 flex-col">
        <div role="tablist" aria-label={`${license.kitName} sections`} onKeyDown={onTabKey} className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-3 sm:px-5 sm:pt-4">
          {tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                id={`${license.key}-tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`${license.key}-panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setPicked(t.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-t-xl px-3.5 py-2.5 text-sm font-medium transition-colors sm:px-4 ${
                  on ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {t.label}
                {t.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${t.alert ? "bg-gold-soft text-gold" : "bg-bg text-muted"}`}>{t.badge}</span>
                )}
                <span aria-hidden className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`${license.key}-panel-${tab}`} aria-labelledby={`${license.key}-tab-${tab}`} className="flex-1 p-5 sm:p-6">
          {tab === "payment" && inst && <PaymentTab installment={inst} pct={pct} locked={locked} />}

          {tab === "places" &&
            (locked ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-dim"><Lock size={18} /></span>
                <p className="mt-4 font-medium text-fg">Places are locked</p>
                <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                  You can add places once this license is fully paid. Until then the kit won&apos;t pass its license check.
                </p>
                <button type="button" onClick={() => setPicked("payment")} className={buttonClass("outline", "sm", "mt-4")}>View payment</button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-[15px] font-semibold text-fg">Where this key runs</h3>
                  <p className="text-sm text-muted">
                    <span className="tabular-nums text-fg">{used}</span> of {license.maxPlaces} used
                    {free > 0 && !revoked && <> · {free} free</>}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
            ))}

          {tab === "activity" && (
            <>
              <dl className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Last check", ago(license.lastVerifiedAt), fullDate(license.lastVerifiedAt)],
                  ["Installed", license.lastKitVersion ? `v${license.lastKitVersion}` : "—", ""],
                  ["Total checks", compact(license.verifyCount), ""],
                ].map(([label, value, title]) => (
                  <div key={label} className="rounded-2xl bg-bg px-4 py-3.5">
                    <dt className="text-xs text-dim">{label}</dt>
                    <dd className="mt-1 truncate text-lg font-semibold text-fg" title={title}>{value}</dd>
                  </div>
                ))}
              </dl>
              {outdated && !revoked && !locked && (
                <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-gold-soft p-4 text-[13px] leading-relaxed text-gold">
                  <Sparkles size={15} className="mt-0.5 shrink-0" />
                  Version v{kit?.version} is available — download the latest file and replace the kit in your places.
                </p>
              )}
              <p className="mt-4 text-[13px] leading-relaxed text-dim">
                {locked ? "No checks yet — the license check starts working once this license is fully paid." : "The kit checks this license each time a game server starts."}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── TAB PEMBAYARAN: ringkasan, langkah, riwayat ─── */
function PaymentTab({ installment: inst, pct, locked }: { installment: InstallmentDto; pct: number; locked: boolean }) {
  const steps = [
    ["Transfer", "Pay the next installment"],
    ["Send proof", "Share the receipt on Discord"],
    ["Unlocked", "We confirm — everything opens"],
  ];
  const R = 38;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* cincin progres */}
        <div className="relative mx-auto h-28 w-28 shrink-0 sm:mx-0" role="img" aria-label={`${pct}% paid`}>
          <svg viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" strokeWidth="9" className="stroke-bg" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct / 100)}
              className={`${locked ? "stroke-gold" : "stroke-green"} transition-[stroke-dashoffset] duration-700`}
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-display text-2xl text-fg tabular-nums">{pct}%</span>
            <span className="text-[11px] text-dim">paid</span>
          </span>
        </div>

        <dl className="grid flex-1 grid-cols-3 gap-2 sm:gap-3">
          {[
            ["Total", formatIDR(inst.total), "text-fg"],
            ["Paid", formatIDR(inst.paid), "text-green"],
            ["Remaining", formatIDR(inst.remaining), locked ? "text-gold" : "text-dim"],
          ].map(([label, value, tone]) => (
            <div key={label} className="min-w-0 rounded-2xl bg-bg px-3 py-3 sm:px-4">
              <dt className="text-[11px] text-dim sm:text-xs">{label}</dt>
              <dd className={`mt-1 truncate text-[13px] font-semibold tabular-nums sm:text-base ${tone}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {locked ? (
        <>
          <ol className="grid gap-2 sm:grid-cols-3">
            {steps.map(([title, text], i) => (
              <li key={title} className={`flex items-start gap-3 rounded-2xl p-3.5 ${i === 0 ? "bg-gold-soft" : "bg-bg"}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? "bg-gold text-on-gold" : "bg-surface-2 text-fg"}`}>{i + 1}</span>
                <span className="min-w-0 text-[13px] leading-snug text-muted">
                  <span className="block font-medium text-fg">{title}</span>
                  {text}
                </span>
              </li>
            ))}
          </ol>
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className={buttonClass("gold", "md", "w-full sm:w-auto")}>
            Send proof on Discord <ArrowUpRight size={16} />
          </a>
        </>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl bg-green/10 p-3.5 text-sm text-green">
          <Check size={16} /> Paid in full — everything is unlocked.
        </p>
      )}

      <div>
        <h3 className="mb-1 text-[15px] font-semibold text-fg">Payment history</h3>
        {inst.payments.length > 0 ? <PaymentHistory payments={inst.payments} /> : <p className="text-[13px] text-dim">No payments confirmed yet.</p>}
      </div>
    </div>
  );
}

function PaymentHistory({ payments }: { payments: InstallmentDto["payments"] }) {
  return (
    <ul className="divide-y divide-line text-[13px]">
      {payments.map((p, i) => (
        <li key={i} className="flex items-baseline justify-between gap-3 py-2.5">
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
