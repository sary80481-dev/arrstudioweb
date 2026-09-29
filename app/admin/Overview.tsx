"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ban, Globe, Hourglass, KeyRound, Radio } from "lucide-react";
import { KitIcon } from "@/components/common/KitIcon";
import { KIT_STATUS_LABEL, formatIDR } from "@/lib/kits";
import type { UserDto } from "@/lib/server/users";
import { selectKits, selectLicenses, selectStats, useAppSelector } from "@/lib/store/store";
import { Card, PageHeader, StatusPill, api } from "./_components/fields";

/** 6 akun terbaru + asal pendaftarannya */
function RecentSignups() {
  const [users, setUsers] = useState<UserDto[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api<{ users: UserDto[] }>("GET", "/api/admin/users")
      .then((r) => setUsers(r.users))
      .catch(() => setFailed(true));
  }, []);

  const discord = users?.filter((u) => u.signupMethod === "discord").length ?? 0;

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-fg">
          Recent sign-ups
          {users && (
            <span className="ml-2 font-normal text-dim">
              {users.length} total · {discord} Discord · {users.length - discord} web
            </span>
          )}
        </h2>
        <Link href="/admin/users" className="text-[13px] text-muted hover:text-fg">All users</Link>
      </div>
      {failed ? (
        <p className="px-4 py-8 text-center text-sm text-muted">Couldn&apos;t load users.</p>
      ) : users === null ? (
        <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p>
      ) : users.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted">No accounts yet.</p>
      ) : (
        <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
          {users.slice(0, 6).map((u) => (
            <li key={u.uid} className="flex items-center gap-3 px-4 py-3 sm:border-b sm:border-line">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-xs font-semibold text-gold">
                {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-fg">{u.displayName}</p>
                <p className="truncate text-xs text-dim">{ago(u.createdAt)}</p>
              </div>
              {u.signupMethod === "discord" ? (
                <span className="rounded-full bg-[#5865f2]/12 px-2 py-0.5 text-[11px] font-medium text-[#5865f2]">Discord</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                  <Globe size={11} /> Web
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const ago = (iso: string | null) => {
  if (!iso) return "—";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

export default function Overview() {
  const stats = useAppSelector(selectStats);
  const kits = useAppSelector(selectKits);
  const { items: licenses } = useAppSelector(selectLicenses);

  const revoked = licenses?.filter((l) => l.status === "revoked").length;
  const unused = licenses?.filter((l) => l.status === "active" && !l.placeId).length;
  // estimasi pendapatan dari harga katalog saat ini
  const revenue = kits.reduce((sum, k) => sum + k.price * k.stats.licenses, 0);

  const metrics = [
    { label: "Licenses issued", value: stats.licensesIssued.toLocaleString(), icon: KeyRound },
    { label: "Live places", value: stats.placesActive.toLocaleString(), icon: Radio },
    { label: "Unused keys", value: unused?.toLocaleString() ?? "—", icon: Hourglass },
    { label: "Revoked", value: revoked?.toLocaleString() ?? "—", icon: Ban },
  ];

  return (
    <>
      <PageHeader title="Overview" desc="Numbers update as licenses are issued and places come online." />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`group relative overflow-hidden rounded-xl border px-4 py-4 transition-colors sm:px-5 ${
              i === 0 ? "border-gold/40 bg-gold-soft" : "border-line bg-surface hover:border-line-strong"
            }`}
          >
            <dt className="flex items-center gap-2 text-[13px] text-muted">
              <m.icon size={14} strokeWidth={1.75} className={i === 0 ? "text-gold" : "text-dim"} />
              {m.label}
            </dt>
            <dd className="mt-2 font-display text-4xl font-bold tabular-nums leading-none text-fg">{m.value}</dd>
          </div>
        ))}
      </dl>

      <RecentSignups />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        {/* per kit */}
        <Card>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">Kits</h2>
            <Link href="/admin/kits" className="text-[13px] text-muted hover:text-fg">Manage</Link>
          </div>
          {kits.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No kits yet. <Link href="/admin/kits" className="text-gold hover:underline">Add one</Link>.
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="text-left text-xs text-dim">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-normal">Kit</th>
                  <th className="hidden px-4 py-2 font-normal sm:table-cell">Status</th>
                  <th className="px-4 py-2 text-right font-normal">Keys</th>
                  <th className="px-4 py-2 text-right font-normal">Places</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {kits.map((k) => (
                  <tr key={k.id}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <KitIcon icon={k.icon} size={15} strokeWidth={1.75} className="shrink-0 text-muted" />
                        <span className="truncate text-fg">{k.name}</span>
                        <span className="text-xs tabular-nums text-dim">{k.version}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <StatusPill tone={k.status === "active" ? "green" : k.status === "coming_soon" ? "amber" : "gray"}>
                        {KIT_STATUS_LABEL[k.status]}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg">{k.stats.licenses}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg">{k.stats.activePlaces}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="border-t border-line px-4 py-2.5 text-xs text-dim">
            Est. revenue at current prices: <span className="tabular-nums text-muted">{formatIDR(revenue)}</span>
          </p>
        </Card>

        {/* aktivitas terbaru */}
        <Card>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">Recent licenses</h2>
            <Link href="/admin/licenses" className="text-[13px] text-muted hover:text-fg">View all</Link>
          </div>
          <ul className="divide-y divide-line">
            {licenses === null && <li className="px-4 py-8 text-center text-sm text-muted">Loading…</li>}
            {licenses?.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">No licenses issued yet.</li>}
            {licenses?.slice(0, 7).map((l) => (
              <li key={l.key} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13px] text-fg">{l.key}</p>
                  <p className="truncate text-xs text-dim">{l.kitName} · {l.ownerEmail ?? l.ownerUid}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusPill tone={l.status === "revoked" ? "red" : l.placeId ? "green" : "amber"}>
                    {l.status === "revoked" ? "Revoked" : l.placeId ? "Bound" : "Unused"}
                  </StatusPill>
                  <p className="mt-0.5 text-xs text-dim">{ago(l.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
