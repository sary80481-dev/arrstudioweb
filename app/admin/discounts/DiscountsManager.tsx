"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { formatIDR } from "@/lib/kits";
import type { Discount, DiscountScope, DiscountType } from "@/lib/discount";
import { Btn, Card, FieldShell, PageHeader, Segmented, Select, StatusPill, TextInput, api } from "../_components/fields";

const scopeLabel: Record<DiscountScope, string> = { all: "All items", kit: "Single kits", bundle: "Studio bundle" };
const valueLabel = (d: Pick<Discount, "type" | "value">) => (d.type === "percent" ? `${d.value}%` : formatIDR(d.value));

function statusOf(d: Discount): { tone: "green" | "amber" | "gray" | "red"; label: string } {
  if (!d.active) return { tone: "gray", label: "Off" };
  if (d.expiresAt && new Date(d.expiresAt).getTime() < Date.now()) return { tone: "red", label: "Expired" };
  if (d.maxUses > 0 && d.usedCount >= d.maxUses) return { tone: "amber", label: "Used up" };
  return { tone: "green", label: "Active" };
}

export default function DiscountsManager({ discounts }: { discounts: Discount[] | null }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percent");
  const [value, setValue] = useState("");
  const [appliesTo, setAppliesTo] = useState<DiscountScope>("all");
  const [maxUses, setMaxUses] = useState("");
  const [expires, setExpires] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setError("");
    setBusy(key);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(null);
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    return run("create", async () => {
      await api("POST", "/api/admin/discounts", {
        code,
        type,
        value: Number(value.replace(/\D/g, "")) || 0,
        appliesTo,
        maxUses: Number(maxUses) || 0,
        // berlaku sampai akhir hari yang dipilih (waktu lokal)
        expiresAt: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
      });
      setCode("");
      setValue("");
      setMaxUses("");
      setExpires("");
    });
  };

  return (
    <>
      <PageHeader title="Discounts" desc="Promo codes buyers can enter at checkout. Prices are always recalculated on the server." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          {discounts === null ? (
            <p className="px-4 py-12 text-center text-sm text-muted">Couldn&apos;t load discounts. Refresh to try again.</p>
          ) : discounts.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted">No discount codes yet. Create the first one.</p>
          ) : (
            <ul className="divide-y divide-line">
              {discounts.map((d) => {
                const st = statusOf(d);
                return (
                  <li key={d.code} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-fg">
                        <span className="font-mono tracking-wide">{d.code}</span>
                        <StatusPill tone={st.tone}>{st.label}</StatusPill>
                      </p>
                      <p className="mt-0.5 text-xs text-dim">
                        {valueLabel(d)} off · {scopeLabel[d.appliesTo]} · used {d.usedCount}
                        {d.maxUses > 0 ? ` / ${d.maxUses}` : ""}
                        {d.expiresAt && <> · until {new Date(d.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</>}
                      </p>
                    </div>
                    <Btn
                      size="sm"
                      disabled={busy === d.code}
                      onClick={() => run(d.code, () => api("PATCH", `/api/admin/discounts/${d.code}`, { active: !d.active }))}
                    >
                      {d.active ? "Turn off" : "Turn on"}
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      aria-label={`Delete ${d.code}`}
                      disabled={busy === d.code}
                      onClick={() => {
                        if (confirm(`Delete code ${d.code}?`)) run(d.code, () => api("DELETE", `/api/admin/discounts/${d.code}`));
                      }}
                    >
                      <Trash2 size={14} />
                    </Btn>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <form onSubmit={create}>
          <Card className="h-fit">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold text-fg">New code</h2>
            </div>
            <div className="space-y-4 p-4">
              <FieldShell label="Code" htmlFor="d-code" hint="Letters, digits, - or _ (3–24). Case-insensitive for buyers.">
                <TextInput id="d-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="LAUNCH20" className="font-mono" maxLength={24} />
              </FieldShell>
              <FieldShell label="Type">
                <Segmented
                  options={["percent", "fixed"] as const}
                  value={type}
                  onChange={setType}
                  labels={{ percent: "Percent", fixed: "Fixed (Rp)" }}
                />
              </FieldShell>
              <FieldShell label={type === "percent" ? "Percent off" : "Amount off (Rp)"} htmlFor="d-value">
                <TextInput id="d-value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} className="tabular-nums" />
              </FieldShell>
              <FieldShell label="Applies to" htmlFor="d-scope">
                <Select id="d-scope" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as DiscountScope)}>
                  {(Object.keys(scopeLabel) as DiscountScope[]).map((s) => (
                    <option key={s} value={s}>{scopeLabel[s]}</option>
                  ))}
                </Select>
              </FieldShell>
              <div className="grid grid-cols-2 gap-3">
                <FieldShell label="Max uses" htmlFor="d-max" hint="Empty = unlimited">
                  <TextInput id="d-max" inputMode="numeric" value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ""))} className="tabular-nums" />
                </FieldShell>
                <FieldShell label="Expires" htmlFor="d-exp" hint="Optional">
                  <TextInput id="d-exp" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
                </FieldShell>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
              {error && <p className="mr-auto text-[13px] text-red-500">{error}</p>}
              <Btn type="submit" variant="primary" disabled={busy === "create" || !code || !value}>
                {busy === "create" && <Loader2 size={14} className="animate-spin" />}
                Create
              </Btn>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
