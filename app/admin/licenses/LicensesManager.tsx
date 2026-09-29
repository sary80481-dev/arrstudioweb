"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, Plus, X } from "lucide-react";
import type { Kit } from "@/lib/kits";
import type { LicenseDto } from "@/lib/server/licenses";
import { selectKits, selectLicenses, useAppSelector } from "@/lib/store/store";
import { Btn, Card, FieldShell, PageHeader, Select, StatusPill, TextInput, api } from "../_components/fields";
import { DataTable, columnHelper } from "../_components/DataTable";

const col = columnHelper<LicenseDto>();
const EMPTY: LicenseDto[] = [];

const columns = [
  col.accessor("key", {
    header: "Key",
    cell: (c) => {
      const l = c.row.original;
      return (
        <>
          <div className="flex items-center gap-1">
            <span className="font-mono text-fg">{l.key}</span>
            <CopyIcon text={l.key} />
          </div>
          <p className="text-xs text-dim">
            {l.kitName}
            {l.lastKitVersion && ` · v${l.lastKitVersion}`}
            {l.note && ` · ${l.note}`}
          </p>
          <p className="truncate text-xs text-dim md:hidden">{l.ownerEmail ?? l.ownerUid}</p>
        </>
      );
    },
  }),
  col.accessor((r) => r.ownerEmail ?? r.ownerUid, { id: "owner", header: "Owner", cell: (c) => <span className="block max-w-[220px] truncate text-muted">{c.getValue()}</span> }),
  col.accessor((r) => r.placeId ?? "", {
    id: "place",
    header: "Place",
    cell: (c) =>
      c.getValue() ? (
        <a href={`https://www.roblox.com/games/${c.getValue()}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-fg hover:text-gold">
          {c.getValue()} <ExternalLink size={11} className="text-dim" />
        </a>
      ) : (
        <span className="text-dim">—</span>
      ),
  }),
  col.accessor((r) => state(r).label, {
    id: "status",
    header: "Status",
    cell: (c) => <StatusPill tone={state(c.row.original).tone}>{c.getValue()}</StatusPill>,
  }),
  col.accessor((r) => r.lastVerifiedAt ?? "", {
    id: "lastCheck",
    header: "Last check",
    cell: (c) => (
      <span className="text-muted">
        {when(c.row.original.lastVerifiedAt)}
        {c.row.original.verifyCount > 0 && <span className="text-dim"> · {c.row.original.verifyCount}×</span>}
      </span>
    ),
  }),
  col.accessor((r) => r.note ?? "", { id: "note", header: "Note", enableSorting: false, cell: () => null }),
  col.display({ id: "actions", header: () => <span className="sr-only">Actions</span>, cell: (c) => <RevokeButton license={c.row.original} /> }),
];

type StatusFilter = "all" | "unused" | "bound" | "revoked";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

function state(l: LicenseDto): { label: string; tone: "green" | "amber" | "red" } {
  if (l.status === "revoked") return { label: "Revoked", tone: "red" };
  return l.placeId ? { label: "Bound", tone: "green" } : { label: "Unused", tone: "amber" };
}

function CopyIcon({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      aria-label="Copy key"
      className="rounded p-1 text-dim transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {done ? <Check size={13} className="text-green" /> : <Copy size={13} />}
    </button>
  );
}

export default function LicensesManager() {
  const kits = useAppSelector(selectKits);
  const { items: licenses, error } = useAppSelector(selectLicenses);

  const [kitFilter, setKitFilter] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [issuing, setIssuing] = useState(false);

  // filter kit & status di luar tabel; pencarian teks ditangani DataTable
  const rows = useMemo(() => {
    if (!licenses) return EMPTY;
    if (kitFilter === "all" && status === "all") return licenses;
    return licenses.filter((l) => {
      if (kitFilter !== "all" && l.kit !== kitFilter) return false;
      if (status === "revoked") return l.status === "revoked";
      if (status === "bound") return l.status === "active" && !!l.placeId;
      if (status === "unused") return l.status === "active" && !l.placeId;
      return true;
    });
  }, [licenses, kitFilter, status]);

  return (
    <>
      <PageHeader
        title="Licenses"
        desc="Issue a key after payment — it shows up in the buyer's dashboard right away."
        action={
          <Btn variant="primary" onClick={() => setIssuing(true)}>
            <Plus size={15} /> Issue license
          </Btn>
        }
      />

      {issuing && <IssuePanel kits={kits} onClose={() => setIssuing(false)} />}

      {licenses === null ? (
        <Card className="px-4 py-12 text-center text-sm text-muted">{error ?? "Loading…"}</Card>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(r) => r.key}
          searchPlaceholder="Search key, email, place ID or note"
          emptyText={licenses.length === 0 ? "No licenses issued yet." : "No licenses match these filters."}
          pageSize={20}
          columnStyles={{
            owner: { className: "hidden md:table-cell" },
            place: { className: "hidden sm:table-cell" },
            lastCheck: { className: "hidden xl:table-cell" },
            note: { className: "hidden" },
            actions: { className: "w-24", align: "right" },
          }}
          toolbar={
            <div className="grid grid-cols-2 gap-2 sm:w-80">
              <Select aria-label="Filter by kit" value={kitFilter} onChange={(e) => setKitFilter(e.target.value)}>
                <option value="all">All kits</option>
                {kits.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </Select>
              <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                <option value="all">Any status</option>
                <option value="unused">Unused</option>
                <option value="bound">Bound</option>
                <option value="revoked">Revoked</option>
              </Select>
            </div>
          }
        />
      )}
    </>
  );
}

function RevokeButton({ license }: { license: LicenseDto }) {
  const [busy, setBusy] = useState(false);
  const revoked = license.status === "revoked";

  const toggle = async () => {
    if (!revoked && !confirm(`Revoke ${license.key}? The kit stops working on its next check.`)) return;
    setBusy(true);
    try {
      await api("PATCH", `/api/admin/licenses/${encodeURIComponent(license.key)}`, { status: revoked ? "active" : "revoked" });
    } catch (e) {
      alert((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <Btn size="sm" variant={revoked ? "ghost" : "danger"} onClick={toggle} disabled={busy}>
      {busy && <Loader2 size={13} className="animate-spin" />}
      {revoked ? "Restore" : "Revoke"}
    </Btn>
  );
}

/* ─── PANEL TERBITKAN LISENSI ─── */
function IssuePanel({ kits, onClose }: { kits: Kit[]; onClose: () => void }) {
  const issuable = kits.filter((k) => k.status !== "draft");
  const [kit, setKit] = useState(issuable[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState<string[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIssued([]);
    setBusy(true);
    try {
      const { keys } = await api<{ keys: string[] }>("POST", "/api/admin/licenses", {
        kit,
        ownerEmail: email.trim(),
        count,
        note: note.trim() || undefined,
      });
      setIssued(keys);
      setNote("");
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-fg">Issue license</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-dim hover:bg-surface-2 hover:text-fg">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.4fr_80px_1.2fr_auto] lg:items-end">
        <FieldShell label="Kit" htmlFor="i-kit">
          <Select id="i-kit" value={kit} onChange={(e) => setKit(e.target.value)} required>
            {issuable.length === 0 && <option value="">Create a kit first</option>}
            {issuable.map((k) => (
              <option key={k.id} value={k.id}>{k.name} ({k.version})</option>
            ))}
          </Select>
        </FieldShell>
        <FieldShell label="Buyer email" htmlFor="i-email">
          <TextInput id="i-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="buyer@studio.com" autoFocus />
        </FieldShell>
        <FieldShell label="Qty" htmlFor="i-count">
          <TextInput
            id="i-count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
          />
        </FieldShell>
        <FieldShell label="Note (optional)" htmlFor="i-note">
          <TextInput id="i-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Order #1042" maxLength={200} />
        </FieldShell>
        <Btn type="submit" variant="primary" disabled={busy || !kit || !email} className="sm:col-span-2 lg:col-span-1">
          {busy && <Loader2 size={14} className="animate-spin" />}
          Issue
        </Btn>
      </form>

      {error && <p role="alert" className="px-4 pb-4 text-[13px] text-red-500">{error}</p>}
      {issued.length > 0 && (
        <div className="border-t border-line bg-green/5 px-4 py-3">
          <p className="text-[13px] text-green">
            {issued.length === 1 ? "Key issued" : `${issued.length} keys issued`} — the buyer can see {issued.length === 1 ? "it" : "them"} now.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {issued.map((k) => (
              <li key={k} className="flex items-center gap-1 rounded-md border border-line bg-bg py-1 pl-2.5 pr-1 font-mono text-[13px] text-fg">
                {k}
                <CopyIcon text={k} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
