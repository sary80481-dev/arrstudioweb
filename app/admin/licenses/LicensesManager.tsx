"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { formatIDR, type Kit } from "@/lib/kits";
import { isLocked } from "@/lib/installment";
import type { LicenseDto } from "@/lib/server/licenses";
import type { UserDto } from "@/lib/server/users";
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
  col.accessor((r) => r.places.join(" "), {
    id: "place",
    header: "Places",
    cell: (c) => {
      const l = c.row.original;
      return (
        <span className="flex flex-col gap-0.5">
          <span className="text-xs tabular-nums text-muted">
            {l.places.length}/{l.maxPlaces} slots
          </span>
          {l.places.map((p) => (
            <a key={p} href={`https://www.roblox.com/games/${p}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-fg hover:text-gold">
              {p} <ExternalLink size={11} className="text-dim" />
            </a>
          ))}
        </span>
      );
    },
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
  col.display({ id: "actions", header: () => <span className="sr-only">Actions</span>, cell: (c) => (
      <div className="flex justify-end gap-1">
        {c.row.original.installment && <PaymentsButton license={c.row.original} />}
        {c.row.original.status === "revoked" ? (
          <DeleteButton license={c.row.original} />
        ) : (
          <SlotsButton license={c.row.original} />
        )}
        <RevokeButton license={c.row.original} />
      </div>
    ) }),
];

type StatusFilter = "all" | "unused" | "bound" | "revoked";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

function state(l: LicenseDto): { label: string; tone: "green" | "amber" | "red" } {
  if (l.status === "revoked") return { label: "Revoked", tone: "red" };
  if (isLocked(l)) return { label: `Installment ${formatIDR(l.installment!.paid)} / ${formatIDR(l.installment!.total)}`, tone: "amber" };
  return l.places.length ? { label: "Bound", tone: "green" } : { label: "Unused", tone: "amber" };
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
      if (status === "bound") return l.status === "active" && l.places.length > 0;
      if (status === "unused") return l.status === "active" && l.places.length === 0;
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
            actions: { className: "w-40", align: "right" },
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

/** Hapus permanen — hanya muncul untuk lisensi yang sudah dicabut */
function DeleteButton({ license }: { license: LicenseDto }) {
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!confirm(`Delete ${license.key} permanently? This can't be undone.`)) return;
    setBusy(true);
    try {
      await api("DELETE", `/api/admin/licenses/${encodeURIComponent(license.key)}`);
      // baris hilang sendiri lewat onSnapshot
    } catch (e) {
      alert((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Btn size="sm" variant="danger" onClick={remove} disabled={busy} aria-label={`Delete ${license.key}`} title="Delete permanently">
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      Delete
    </Btn>
  );
}

/** Catatan cicilan: riwayat, tambah pembayaran yang sudah dicek, batalkan yang terakhir */
function PaymentsButton({ license }: { license: LicenseDto }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inst = license.installment!;
  // data lisensi datang realtime (onSnapshot) → dialog ikut berubah setelah simpan

  const run = async (method: "POST" | "DELETE", body?: unknown) => {
    setError("");
    setBusy(true);
    try {
      await api(method, `/api/admin/licenses/${encodeURIComponent(license.key)}/payments`, body);
      setAmount("");
      setNote("");
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <>
      <Btn size="sm" variant="ghost" onClick={() => setOpen(true)} title="Installment payments">Pay</Btn>
      {open && (
        <div role="dialog" aria-modal="true" onClick={() => setOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-surface text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-fg">Installment</h2>
                <p className="font-mono text-xs text-dim">{license.key}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-dim hover:bg-surface-2 hover:text-fg"><X size={16} /></button>
            </div>

            <dl className="grid grid-cols-3 gap-3 px-4 py-3 text-[13px]">
              <div><dt className="text-dim">Total</dt><dd className="tabular-nums text-fg">{formatIDR(inst.total)}</dd></div>
              <div><dt className="text-dim">Paid</dt><dd className="tabular-nums text-green">{formatIDR(inst.paid)}</dd></div>
              <div><dt className="text-dim">Remaining</dt><dd className="tabular-nums text-fg">{formatIDR(inst.remaining)}</dd></div>
            </dl>
            <p className="px-4 pb-3 text-xs text-dim">
              {inst.remaining > 0 ? "Locked for the buyer until fully paid." : "Fully paid — unlocked for the buyer."}
            </p>

            {inst.payments.length > 0 && (
              <ul className="divide-y divide-line border-y border-line text-[13px]">
                {inst.payments.map((p, i) => (
                  <li key={i} className="flex justify-between gap-3 px-4 py-2">
                    <span className="text-muted">{when(p.at)}{p.note && ` · ${p.note}`}</span>
                    <span className="tabular-nums text-fg">{formatIDR(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}

            {inst.remaining > 0 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run("POST", { amount: Number(amount) || 0, note: note.trim() || undefined });
                }}
                className="space-y-3 p-4"
              >
                <FieldShell label="Payment received (Rp)" htmlFor="pay-amount" hint={`Up to ${formatIDR(inst.remaining)}`}>
                  <TextInput
                    id="pay-amount"
                    inputMode="numeric"
                    value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    className="tabular-nums"
                  />
                </FieldShell>
                <FieldShell label="Note (optional)" htmlFor="pay-note">
                  <TextInput id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Transfer BCA, 4 Okt" maxLength={200} />
                </FieldShell>
                <Btn type="submit" variant="primary" disabled={busy || !Number(amount)} className="w-full">
                  {busy && <Loader2 size={14} className="animate-spin" />} Record payment
                </Btn>
              </form>
            )}
            {error && <p role="alert" className="px-4 pb-3 text-[13px] text-red-500">{error}</p>}
            {inst.payments.length > 0 && (
              <div className="border-t border-line px-4 py-3">
                <Btn
                  size="sm"
                  variant="danger"
                  disabled={busy}
                  onClick={() => confirm("Undo the last payment?") && run("DELETE")}
                >
                  Undo last payment
                </Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Ubah jumlah slot place (mis. pembeli menambah place lewat Discord) */
function SlotsButton({ license }: { license: LicenseDto }) {
  const [busy, setBusy] = useState(false);

  const edit = async () => {
    const raw = prompt(`Place slots for ${license.key} (currently used in ${license.places.length}):`, String(license.maxPlaces));
    if (raw === null) return;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 100) return alert("Enter a whole number from 1 to 100.");
    setBusy(true);
    try {
      await api("PATCH", `/api/admin/licenses/${encodeURIComponent(license.key)}`, { maxPlaces: n });
    } catch (e) {
      alert((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <Btn size="sm" variant="ghost" onClick={edit} disabled={busy} title="Change place slots">
      {busy && <Loader2 size={13} className="animate-spin" />}
      Slots
    </Btn>
  );
}

/* ─── PANEL TERBITKAN LISENSI ─── */
function IssuePanel({ kits, onClose }: { kits: Kit[]; onClose: () => void }) {
  const issuable = kits.filter((k) => k.status !== "draft");
  const [kit, setKit] = useState(issuable[0]?.id ?? "");
  const [buyer, setBuyer] = useState<UserDto | null>(null);
  const [count, setCount] = useState(1);
  // null = ikut pengaturan kit (placesPerLicense)
  const [places, setPlaces] = useState<number | null>(null);
  const [note, setNote] = useState("");
  // cicilan: total per lisensi (default harga kit) + pembayaran pertama
  const [installment, setInstallment] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [firstPaid, setFirstPaid] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState<string[]>([]);

  const totalValue = total ?? issuable.find((k) => k.id === kit)?.price ?? 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIssued([]);
    setBusy(true);
    try {
      const { keys } = await api<{ keys: string[] }>("POST", "/api/admin/licenses", {
        kit,
        ownerUid: buyer?.uid,
        count,
        maxPlaces: places ?? undefined,
        note: note.trim() || undefined,
        installment: installment ? { total: totalValue, paid: firstPaid } : undefined,
      });
      setIssued(keys);
      setNote("");
      setFirstPaid(0);
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

      <form onSubmit={submit} className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.4fr_72px_80px_1.2fr_auto] lg:items-end">
        <FieldShell label="Kit" htmlFor="i-kit">
          <Select id="i-kit" value={kit} onChange={(e) => setKit(e.target.value)} required>
            {issuable.length === 0 && <option value="">Create a kit first</option>}
            {issuable.map((k) => (
              <option key={k.id} value={k.id}>{k.name} ({k.version})</option>
            ))}
          </Select>
        </FieldShell>
        <FieldShell label="Buyer" htmlFor="i-buyer">
          <BuyerPicker value={buyer} onChange={setBuyer} />
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
        <FieldShell label="Places" htmlFor="i-places">
          <TextInput
            id="i-places"
            type="number"
            min={1}
            max={100}
            value={places ?? issuable.find((k) => k.id === kit)?.placesPerLicense ?? 3}
            onChange={(e) => setPlaces(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          />
        </FieldShell>
        <FieldShell label="Note (optional)" htmlFor="i-note">
          <TextInput id="i-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Order #1042" maxLength={200} />
        </FieldShell>
        <Btn type="submit" variant="primary" disabled={busy || !kit || !buyer} className="sm:col-span-2 lg:col-span-1">
          {busy && <Loader2 size={14} className="animate-spin" />}
          Issue
        </Btn>
      </form>

      <div className="border-t border-line px-4 py-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-fg">
          <input type="checkbox" checked={installment} onChange={(e) => setInstallment(e.target.checked)} className="accent-[var(--gold)]" />
          Track payments (installments)
          <span className="font-normal text-dim">— locked until fully paid; enter the full total as first payment to unlock right away</span>
        </label>
        {installment && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:max-w-md">
            <FieldShell label="Total price per license (Rp)" htmlFor="i-total">
              <TextInput id="i-total" inputMode="numeric" value={totalValue ? totalValue.toLocaleString("id-ID") : ""} onChange={(e) => setTotal(Number(e.target.value.replace(/\D/g, "")) || 0)} className="tabular-nums" />
            </FieldShell>
            <FieldShell label="First payment (Rp)" htmlFor="i-first" hint={firstPaid >= totalValue && totalValue > 0 ? "Paid in full — unlocked right away" : `Remaining ${formatIDR(Math.max(0, totalValue - firstPaid))}`}>
              <TextInput id="i-first" inputMode="numeric" value={firstPaid ? firstPaid.toLocaleString("id-ID") : ""} onChange={(e) => setFirstPaid(Math.min(Number(e.target.value.replace(/\D/g, "")) || 0, totalValue))} className="tabular-nums" />
            </FieldShell>
          </div>
        )}
      </div>

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

/* ─── PEMILIH PEMBELI ───
   Cari akun terdaftar berdasarkan nama, email, username Discord atau Roblox —
   admin tidak perlu tahu email pembeli (akun Discord bisa saja tanpa email). */
const buyerFields = (u: UserDto) => [u.displayName, u.email, u.discordUsername, u.robloxUsername];

function BuyerPicker({ value, onChange }: { value: UserDto | null; onChange: (u: UserDto | null) => void }) {
  const [users, setUsers] = useState<UserDto[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api<{ users: UserDto[] }>("GET", "/api/admin/users")
      .then((r) => setUsers(r.users))
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = users ?? [];
    return (q ? list.filter((u) => buyerFields(u).some((f) => f?.toLowerCase().includes(q))) : list).slice(0, 8);
  }, [users, query]);

  const pick = (u: UserDto) => {
    onChange(u);
    setQuery("");
    setOpen(false);
  };

  if (value) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-line-strong bg-bg pl-2.5 pr-1 text-sm">
        <span className="min-w-0 flex-1 truncate">
          <span className="text-fg">{value.displayName}</span>
          <span className="ml-1.5 text-dim">{value.email || (value.discordUsername && `@${value.discordUsername}`)}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Change buyer" className="rounded p-1 text-dim hover:bg-surface-2 hover:text-fg">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-dim" />
      <TextInput
        id="i-buyer"
        role="combobox"
        aria-expanded={open}
        aria-controls="i-buyer-list"
        autoComplete="off"
        autoFocus
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, matches.length - 1));
          else if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
          else if (e.key === "Escape") setOpen(false);
          else if (e.key === "Enter" && open && matches[active]) pick(matches[active]);
          else return;
          e.preventDefault();
        }}
        placeholder={users ? "Name, email, Discord or Roblox" : "Loading users…"}
        className="pl-8"
      />
      {open && (
        <ul
          id="i-buyer-list"
          role="listbox"
          // mousedown sebelum blur, supaya klik pada opsi tidak menutup daftar duluan
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-line-strong bg-surface py-1 shadow-lg"
        >
          {loadError && <li className="px-3 py-2 text-[13px] text-red-500">{loadError}</li>}
          {!loadError && !users && <li className="px-3 py-2 text-[13px] text-dim">Loading…</li>}
          {users && matches.length === 0 && <li className="px-3 py-2 text-[13px] text-dim">No matching account — the buyer must sign in once first.</li>}
          {matches.map((u, i) => (
            <li
              key={u.uid}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(u)}
              className={`cursor-pointer px-3 py-2 text-sm ${i === active ? "bg-surface-2" : ""}`}
            >
              <p className="truncate text-fg">{u.displayName}</p>
              <p className="truncate text-xs text-dim">
                {[u.email || "no email", u.discordUsername && `Discord @${u.discordUsername}`, u.robloxUsername && `Roblox ${u.robloxUsername}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
