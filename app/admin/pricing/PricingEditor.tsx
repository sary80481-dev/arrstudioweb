"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/kits";
import type { PricingSettings } from "@/lib/pricing";
import { PricingSchema } from "@/lib/pricing-schema";
import { selectKits, selectPricing, useAppSelector } from "@/lib/store/store";
import { Btn, Card, FieldShell, PageHeader, TextInput, api } from "../_components/fields";

export default function PricingEditor() {
  const saved = useAppSelector(selectPricing);
  const kits = useAppSelector(selectKits);
  const active = kits.filter((k) => k.status === "active");

  // draft lokal; `null` = belum diubah → tampilkan nilai tersimpan (realtime)
  const [draft, setDraft] = useState<PricingSettings | null>(null);
  const form = draft ?? saved;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = <K extends keyof PricingSettings>(k: K, v: PricingSettings[K]) => {
    setDone(false);
    setDraft({ ...form, [k]: v });
  };

  const sumSingles = active.reduce((s, k) => s + k.price, 0);
  const saving_ = sumSingles > 0 ? Math.round((1 - form.bundlePrice / sumSingles) * 100) : 0;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = PricingSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid values");
    setError("");
    setSaving(true);
    try {
      await api("PATCH", "/api/admin/settings/pricing", parsed.data);
      setDraft(null);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Pricing" desc="Single-kit prices are set per kit. The bundle is configured here." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={save}>
          <Card>
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold text-fg">Studio bundle</h2>
              <p className="text-[13px] text-muted">Every active kit in one purchase, with several license keys.</p>
            </div>

            <div className="space-y-5 p-4">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-[13px] font-medium text-fg">Show bundle on the site</span>
                  <span className="block text-xs text-dim">Hidden bundles disappear from the pricing section.</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.bundleEnabled}
                  onClick={() => set("bundleEnabled", !form.bundleEnabled)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${form.bundleEnabled ? "bg-gold" : "bg-line-strong"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] ${form.bundleEnabled ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell
                  label="Bundle price (Rp)"
                  htmlFor="p-price"
                  hint={sumSingles > 0 ? `Buying each kit separately: ${formatIDR(sumSingles)}` : undefined}
                >
                  <TextInput
                    id="p-price"
                    inputMode="numeric"
                    value={form.bundlePrice ? form.bundlePrice.toLocaleString("id-ID") : ""}
                    onChange={(e) => set("bundlePrice", Number(e.target.value.replace(/\D/g, "")) || 0)}
                    className="tabular-nums"
                  />
                </FieldShell>
                <FieldShell label="License keys (places)" htmlFor="p-places" hint="Each key binds to one place.">
                  <TextInput
                    id="p-places"
                    type="number"
                    min={1}
                    max={50}
                    value={form.bundlePlaces}
                    onChange={(e) => set("bundlePlaces", Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  />
                </FieldShell>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
              {error && <p className="mr-auto text-[13px] text-red-500">{error}</p>}
              {done && !dirty && (
                <p className="mr-auto flex items-center gap-1.5 text-[13px] text-green">
                  <Check size={14} /> Saved — live on the site
                </p>
              )}
              <Btn onClick={() => setDraft(null)} disabled={!dirty || saving}>Reset</Btn>
              <Btn type="submit" variant="primary" disabled={!dirty || saving}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save
              </Btn>
            </div>
          </Card>
        </form>

        {/* pratinjau */}
        <Card className="h-fit">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">Preview</h2>
          </div>
          <dl className="divide-y divide-line text-[13px]">
            <div className="flex justify-between gap-3 px-4 py-2.5">
              <dt className="text-muted">Single license</dt>
              <dd className="text-right tabular-nums text-fg">
                {active.length === 0
                  ? "—"
                  : active.length === 1
                    ? formatIDR(active[0].price)
                    : `${formatIDR(Math.min(...active.map((k) => k.price)))} – ${formatIDR(Math.max(...active.map((k) => k.price)))}`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2.5">
              <dt className="text-muted">Studio bundle</dt>
              <dd className="text-right tabular-nums text-fg">{form.bundleEnabled ? formatIDR(form.bundlePrice) : "Hidden"}</dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2.5">
              <dt className="text-muted">Includes</dt>
              <dd className="text-right text-fg">{active.map((k) => k.name).join(", ") || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-2.5">
              <dt className="text-muted">Buyer saves</dt>
              <dd className={`text-right tabular-nums ${saving_ > 0 ? "text-green" : "text-red-500"}`}>
                {sumSingles > 0 ? `${saving_}%` : "—"}
              </dd>
            </div>
          </dl>
          <p className="border-t border-line px-4 py-2.5 text-xs text-dim">
            Kit prices: <Link href="/admin/kits" className="text-gold hover:underline">Kits</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
