"use client";

import Link from "next/link";
import { KitIcon } from "@/components/common/KitIcon";
import { KIT_STATUS_LABEL, formatIDR } from "@/lib/kits";
import { selectKits, selectLicenses, selectStats, useAppSelector } from "@/lib/store/store";
import { Card, PageHeader, StatusPill } from "./_components/fields";

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
    { label: "Licenses issued", value: stats.licensesIssued.toLocaleString() },
    { label: "Live places", value: stats.placesActive.toLocaleString() },
    { label: "Unused keys", value: unused?.toLocaleString() ?? "—" },
    { label: "Revoked", value: revoked?.toLocaleString() ?? "—" },
  ];

  return (
    <>
      <PageHeader title="Overview" desc="Numbers update as licenses are issued and places come online." />

      {/* gap-px di atas bg-line = garis pemisah 1px yang rapi di semua breakpoint */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface px-4 py-4 sm:px-5">
            <dt className="text-[13px] text-muted">{m.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-fg">{m.value}</dd>
          </div>
        ))}
      </dl>

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
