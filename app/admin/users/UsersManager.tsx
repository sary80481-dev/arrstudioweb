"use client";

import { useMemo, useState } from "react";
import { Globe, Link2, ShieldCheck } from "lucide-react";
import type { SignupMethod, UserDto } from "@/lib/server/users";
import { selectLicenses, useAppSelector } from "@/lib/store/store";
import { Card, PageHeader, Segmented, StatusPill } from "../_components/fields";
import { DataTable, columnHelper } from "../_components/DataTable";

type Row = UserDto & { licenses: number };
type Filter = "all" | SignupMethod | "linked";

const col = columnHelper<Row>();

const joined = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

function DiscordMark({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.2a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4a12.9 12.9 0 0 1-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  );
}

function Method({ u }: { u: Row }) {
  if (u.signupMethod === "discord")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5865f2]/12 px-2 py-0.5 text-xs font-medium text-[#5865f2]">
        <DiscordMark /> Discord
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
        <Globe size={12} /> Web form
      </span>
      {u.discordLinked && (
        <span title="Also signed in with Discord later" className="inline-flex items-center gap-1 text-xs text-[#5865f2]">
          <Link2 size={12} /> linked
        </span>
      )}
    </span>
  );
}

const columns = [
  col.accessor((r) => `${r.displayName} ${r.email} ${r.discordUsername ?? ""}`, {
    id: "user",
    header: "User",
    cell: (c) => {
      const u = c.row.original;
      return (
        <div className="flex items-center gap-3">
          {u.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatarUrl} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-xs font-semibold text-gold">
              {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-fg">
              {u.displayName}
              {u.role === "admin" && <ShieldCheck size={13} className="shrink-0 text-gold" aria-label="Admin" />}
            </p>
            <p className="truncate text-xs text-dim">
              {u.email || <span className="italic">no email</span>}
              {u.discordUsername && <> · @{u.discordUsername}</>}
            </p>
            <div className="mt-1 sm:hidden">
              <Method u={u} />
            </div>
          </div>
        </div>
      );
    },
  }),
  col.accessor("signupMethod", { header: "Signed up via", cell: (c) => <Method u={c.row.original} /> }),
  col.accessor((r) => r.robloxUsername ?? "", {
    id: "roblox",
    header: "Roblox",
    cell: (c) => (c.getValue() ? <span className="text-fg">{c.getValue()}</span> : <span className="text-dim">—</span>),
  }),
  col.accessor("licenses", {
    header: "Licenses",
    cell: (c) =>
      c.getValue() > 0 ? <StatusPill tone="green">{c.getValue()}</StatusPill> : <span className="text-dim">0</span>,
  }),
  col.accessor((r) => r.createdAt ?? "", { id: "joined", header: "Joined", cell: (c) => <span className="text-muted">{joined(c.row.original.createdAt)}</span> }),
];

export default function UsersManager({ users }: { users: UserDto[] | null }) {
  const { items: licenses } = useAppSelector(selectLicenses);
  const [filter, setFilter] = useState<Filter>("all");
  // waktu acuan "minggu ini" diambil sekali saat mount
  const [now] = useState(() => Date.now());

  // jumlah lisensi per pemilik, dari listener realtime admin
  const rows = useMemo<Row[]>(() => {
    const count = new Map<string, number>();
    licenses?.forEach((l) => count.set(l.ownerUid, (count.get(l.ownerUid) ?? 0) + 1));
    return (users ?? []).map((u) => ({ ...u, licenses: count.get(u.uid) ?? 0 }));
  }, [users, licenses]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? rows
        : filter === "linked"
          ? rows.filter((u) => u.signupMethod === "web" && u.discordLinked)
          : rows.filter((u) => u.signupMethod === filter),
    [rows, filter]
  );

  const total = rows.length;
  const viaDiscord = rows.filter((u) => u.signupMethod === "discord").length;
  const viaWeb = total - viaDiscord;
  const linked = rows.filter((u) => u.signupMethod === "web" && u.discordLinked).length;
  const weekAgo = now - 7 * 864e5;
  const newThisWeek = rows.filter((u) => u.createdAt && new Date(u.createdAt).getTime() > weekAgo).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <>
      <PageHeader title="Users" desc="Everyone who has an account, and how they signed up." />

      {users === null ? (
        <Card className="px-4 py-12 text-center text-sm text-muted">Couldn&apos;t load users. Refresh to try again.</Card>
      ) : (
        <>
          {/* ringkasan + bar proporsi Discord vs web */}
          <Card className="mb-5 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Total accounts", value: total },
                { label: "Via Discord", value: viaDiscord, note: `${pct(viaDiscord)}%` },
                { label: "Via web form", value: viaWeb, note: `${pct(viaWeb)}%` },
                { label: "New this week", value: newThisWeek },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[13px] text-muted">{m.label}</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-fg">
                    {m.value.toLocaleString()}
                    {m.note && <span className="ml-1.5 text-sm font-normal text-dim">{m.note}</span>}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
              <span className="bg-[#5865f2] transition-[width] duration-700" style={{ width: `${pct(viaDiscord)}%` }} />
              <span className="bg-gold transition-[width] duration-700" style={{ width: `${pct(viaWeb)}%` }} />
            </div>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#5865f2]" /> Discord</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" /> Web form</span>
              {linked > 0 && <span>{linked} web account{linked === 1 ? "" : "s"} later linked Discord</span>}
            </p>
          </Card>

          <DataTable
            data={filtered}
            columns={columns}
            getRowId={(r) => r.uid}
            searchPlaceholder="Search name, email or Discord username"
            emptyText={total === 0 ? "No accounts yet." : "No users match this filter."}
            columnStyles={{
              signupMethod: { className: "hidden sm:table-cell" },
              roblox: { className: "hidden lg:table-cell" },
              licenses: { align: "right" },
              joined: { className: "hidden md:table-cell", align: "right" },
            }}
            toolbar={
              <Segmented<Filter>
                options={["all", "discord", "web", "linked"]}
                value={filter}
                onChange={setFilter}
                labels={{ all: "All", discord: "Discord", web: "Web form", linked: "Linked" }}
              />
            }
          />
        </>
      )}
    </>
  );
}
