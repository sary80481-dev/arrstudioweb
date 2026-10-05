"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { KitIcon } from "@/components/common/KitIcon";
import { KitInputSchema } from "@/lib/kit-schema";
import {
  INTEGRATIONS, KIT_STATUSES, KIT_STATUS_LABEL, defaultConfigPath, formatIDR, slugify,
  type Kit, type KitInput, type KitPhoto, type KitStatus, type KitVideo,
} from "@/lib/kits";
import { selectKits, useAppSelector } from "@/lib/store/store";
import {
  Btn, Card, ChipGroup, FieldShell, IconPicker, PageHeader, ScoreSlider, Segmented, StatusPill, TagListInput, TextArea,
  TextInput, api,
} from "../_components/fields";
import { DataTable, columnHelper } from "../_components/DataTable";
import { PackageField } from "./PackageField";
import { KitSlideshow } from "@/components/video/KitSlideshow";
import { GalleryField } from "./GalleryField";
import { VideoField, discardVideos } from "./VideoField";
import { discardUrls } from "./blob-check";

const col = columnHelper<Kit>();

const statusTone: Record<KitStatus, "green" | "amber" | "gray"> = { active: "green", coming_soon: "amber", draft: "gray" };
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

const emptyKit = (order: number): KitInput => ({
  name: "",
  tag: "",
  tagline: "",
  description: "",
  version: "1.0.0",
  price: 299000,
  status: "draft",
  icon: "sparkles",
  features: [],
  integrations: [],
  attributes: { systems: 80, integration: 80, setup: 80 },
  configPath: "",
  rating: null,
  order,
  placesPerLicense: 3,
  video: null,
  gallery: [],
});

export default function KitsManager() {
  // katalog lengkap (termasuk draft) — realtime dari Redux
  const kits = useAppSelector(selectKits);
  const [editing, setEditing] = useState<Kit | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  };

  const columns = useMemo(
    () => [
      col.accessor("name", {
        header: "Kit",
        cell: (c) => {
          const kit = c.row.original;
          return (
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-bg text-muted">
                <KitIcon icon={kit.icon} size={15} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{kit.name}</p>
                <p className="truncate text-xs text-dim">
                  <span className="font-mono">{kit.id}</span>
                  <span className="md:hidden"> · {KIT_STATUS_LABEL[kit.status]}</span>
                </p>
              </div>
            </div>
          );
        },
      }),
      col.accessor("version", { header: "Version", cell: (c) => <span className="font-mono text-xs text-fg">{c.getValue()}</span> }),
      col.accessor("price", { header: "Price", cell: (c) => <span className="tabular-nums text-fg">{formatIDR(c.getValue())}</span> }),
      col.accessor("status", {
        header: "Status",
        cell: (c) => <StatusPill tone={statusTone[c.getValue()]}>{KIT_STATUS_LABEL[c.getValue()]}</StatusPill>,
      }),
      col.accessor((r) => r.stats.licenses, { id: "licenses", header: "Keys", cell: (c) => <span className="tabular-nums text-fg">{c.getValue()}</span> }),
      col.accessor((r) => r.stats.activePlaces, { id: "places", header: "Places", cell: (c) => <span className="tabular-nums text-fg">{c.getValue()}</span> }),
      col.accessor("updatedAt", { header: "Updated", cell: (c) => <span className="text-muted">{date(c.getValue())}</span> }),
      col.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: (c) => (
          <RowMenu kit={c.row.original} busy={busy === c.row.original.id} onEdit={() => setEditing(c.row.original)} onDelete={() => remove(c.row.original)} />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy]
  );

  const remove = (kit: Kit) => {
    if (!confirm(`Delete ${kit.name}? This can't be undone.`)) return;
    run(kit.id, () => api("DELETE", `/api/admin/kits/${kit.id}`));
  };

  return (
    <>
      <PageHeader
        title="Kits"
        desc="What's listed on the site. Saving publishes immediately."
        action={
          <Btn variant="primary" onClick={() => setEditing("new")}>
            <Plus size={15} /> New kit
          </Btn>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-[13px] text-red-500">{error}</p>}

      {kits.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <p className="text-sm font-medium text-fg">No kits yet</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted">Import the two built-in kits to start, or create one from scratch.</p>
          <div className="mt-5 flex gap-2">
            <Btn onClick={() => run("seed", () => api("POST", "/api/admin/kits?seed=1"))} disabled={busy === "seed"}>
              {busy === "seed" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Import ClubKit Pro & Summit Kit
            </Btn>
          </div>
        </Card>
      ) : (
        <DataTable
          data={kits}
          columns={columns}
          getRowId={(r) => r.id}
          searchPlaceholder="Search kits"
          onRowClick={(r) => setEditing(r)}
          pageSize={10}
          footerNote="click a row to edit"
          columnStyles={{
            price: { className: "hidden sm:table-cell" },
            status: { className: "hidden md:table-cell" },
            licenses: { className: "hidden lg:table-cell", align: "right" },
            places: { className: "hidden lg:table-cell", align: "right" },
            updatedAt: { className: "hidden xl:table-cell" },
            actions: { className: "w-12" },
          }}
        />
      )}

      {editing && (
        <KitSheet
          kit={editing === "new" ? null : editing}
          nextOrder={Math.max(0, ...kits.map((k) => k.order)) + 1}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function RowMenu({ kit, busy, onEdit, onDelete }: { kit: Kit; busy: boolean; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const locked = kit.stats.licenses > 0;

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        aria-label={`Actions for ${kit.name}`}
        aria-expanded={open}
        className="rounded-md p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-fg"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <MoreHorizontal size={16} />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-line bg-surface p-1 shadow-card">
          <button type="button" onClick={onEdit} className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] text-fg hover:bg-surface-2">
            <Pencil size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={locked}
            title={locked ? "Has licenses — set it to Draft instead" : undefined}
            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:text-dim disabled:hover:bg-transparent"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── SHEET TAMBAH / UBAH ─── */
function KitSheet({ kit, nextOrder, onClose }: { kit: Kit | null; nextOrder: number; onClose: () => void }) {
  const isNew = !kit;
  const [form, setForm] = useState<KitInput>(() => (kit ? { ...kit } : emptyKit(nextOrder)));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  // video yang diupload selama sheet terbuka — yang tidak jadi disimpan dihapus dari Blob
  const uploads = useRef<KitVideo[]>([]);
  const photoUploads = useRef<KitPhoto[]>([]);
  // tab media: video ATAU foto (video menang bila keduanya ada)
  const [mediaTab, setMediaTab] = useState<"video" | "photos">(() => (kit && !kit.video && kit.gallery.length > 0 ? "photos" : "video"));

  const close = useCallback(() => {
    discardVideos(uploads.current);
    discardUrls(photoUploads.current.map((p) => p.url));
    uploads.current = [];
    photoUploads.current = [];
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  const set = <K extends keyof KitInput>(k: K, v: KitInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const candidate = {
      ...form,
      id: isNew ? form.id || slugify(form.name) : undefined,
      configPath: form.configPath || defaultConfigPath(form.name),
    };
    const parsed = KitInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isNew) await api("POST", "/api/admin/kits", parsed.data);
      else {
        const { id: _id, ...patch } = parsed.data;
        void _id;
        await api("PATCH", `/api/admin/kits/${kit.id}`, patch);
      }
      uploads.current = uploads.current.filter((v) => v.url !== parsed.data.video?.url);
      photoUploads.current = photoUploads.current.filter((p) => !parsed.data.gallery.some((g) => g.url === p.url));
      close();
    } catch (err) {
      setServerError((err as Error).message);
      setSaving(false);
    }
  };

  const section = "space-y-4 border-t border-line pt-5 first:border-t-0 first:pt-0";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="kit-sheet-title">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-black/40" />

      <form onSubmit={submit} className="relative flex h-full w-full flex-col border-l border-line bg-bg shadow-card sm:max-w-[560px]" noValidate>
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 id="kit-sheet-title" className="truncate text-base font-semibold text-fg">{isNew ? "New kit" : `Edit ${kit.name}`}</h2>
            {!isNew && <p className="text-xs text-dim">Last updated {date(kit.updatedAt)}</p>}
          </div>
          <button type="button" onClick={close} aria-label="Close" className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-fg">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section className={section}>
            <FieldShell
              label="Showcase"
              error={errors.video || errors.gallery}
              hint={
                mediaTab === "video"
                  ? "A video plays on the landing page, kit card and sign-in screen."
                  : "Photos become a cinematic slideshow on the landing page, kit card and sign-in screen."
              }
            >
              <div role="tablist" aria-label="Showcase type" className="mb-3 inline-flex rounded-md bg-surface-2 p-0.5">
                {(["video", "photos"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={mediaTab === t}
                    onClick={() => setMediaTab(t)}
                    className={`rounded px-3 py-1.5 text-[13px] transition-colors ${mediaTab === t ? "bg-surface font-medium text-fg shadow-sm" : "text-muted hover:text-fg"}`}
                  >
                    {t === "video" ? "Video" : `Photos${form.gallery.length ? ` (${form.gallery.length})` : ""}`}
                  </button>
                ))}
              </div>
              {(() => {
                const kitId = (isNew ? form.id || slugify(form.name) : kit.id) || "draft";
                return mediaTab === "video" ? (
                  <VideoField
                    kitId={kitId}
                    kitName={form.name}
                    value={form.video}
                    onChange={(v) => set("video", v)}
                    onUploaded={(v) => uploads.current.push(v)}
                  />
                ) : (
                  <>
                    <GalleryField
                      folder={`kits/${kitId}/gallery`}
                      value={form.gallery}
                      onChange={(update) => setForm((f) => ({ ...f, gallery: update(f.gallery) }))}
                      onUploaded={(p) => photoUploads.current.push(p)}
                      disabledHint={form.video ? "A video is also set and takes priority — remove it (Video tab) to show these photos." : undefined}
                    />
                    {form.gallery.length > 1 && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs text-dim">Preview</p>
                        <KitSlideshow photos={form.gallery} title={form.name || "Preview"} mode="view" className="aspect-video rounded-lg" />
                      </div>
                    )}
                  </>
                );
              })()}
            </FieldShell>
            <FieldShell label="Kit file" hint={isNew ? undefined : "Saved as soon as it uploads — no need to press Save."}>
              {isNew ? (
                <p className="rounded-lg bg-surface-2 px-3 py-3 text-[13px] text-muted">Create the kit first, then upload its .rbxm file.</p>
              ) : (
                <PackageField kitId={kit.id} />
              )}
            </FieldShell>
          </section>

          <section className={section}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell label="Name" htmlFor="k-name" error={errors.name}>
                <TextInput id="k-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Summit Kit" autoFocus={isNew} />
              </FieldShell>
              <FieldShell label="Kit ID" htmlFor="k-id" error={errors.id} hint={isNew ? "Used in Lua. Can't change later." : "Fixed"}>
                <TextInput
                  id="k-id"
                  value={isNew ? form.id ?? "" : kit.id}
                  onChange={(e) => set("id", e.target.value.toLowerCase())}
                  placeholder={slugify(form.name) || "summit-kit"}
                  disabled={!isNew}
                  className="font-mono text-[13px]"
                />
              </FieldShell>
              <FieldShell label="Category" htmlFor="k-tag" error={errors.tag}>
                <TextInput id="k-tag" value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Live events" />
              </FieldShell>
              <FieldShell label="Tagline" htmlFor="k-tagline" error={errors.tagline}>
                <TextInput id="k-tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Run launches like a festival." />
              </FieldShell>
            </div>
            <FieldShell label="Description" htmlFor="k-desc" error={errors.description} hint={`${form.description.length}/400`}>
              <TextArea id="k-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={400} />
            </FieldShell>
          </section>

          <section className={section}>
            <FieldShell label="Status" error={errors.status}>
              <Segmented options={KIT_STATUSES} value={form.status} onChange={(v) => set("status", v)} labels={KIT_STATUS_LABEL} />
            </FieldShell>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FieldShell label="Version" htmlFor="k-ver" error={errors.version}>
                <TextInput id="k-ver" value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="1.0.0" className="font-mono text-[13px]" />
              </FieldShell>
              <FieldShell label="Price (Rp)" htmlFor="k-price" error={errors.price} className="col-span-1 sm:col-span-2">
                <TextInput
                  id="k-price"
                  inputMode="numeric"
                  value={form.price ? form.price.toLocaleString("id-ID") : ""}
                  onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")) || 0)}
                  placeholder="299.000"
                  className="tabular-nums"
                />
              </FieldShell>
              <FieldShell label="Rating" htmlFor="k-rating" error={errors.rating}>
                <TextInput
                  id="k-rating"
                  type="number"
                  min={0}
                  max={5}
                  step="0.1"
                  value={form.rating ?? ""}
                  placeholder="—"
                  onChange={(e) => set("rating", e.target.value === "" ? null : Number(e.target.value))}
                />
              </FieldShell>
            </div>
            <div className="grid grid-cols-[1fr_96px] gap-4">
              <FieldShell label="Config path" htmlFor="k-config" error={errors.configPath} hint="Where buyers paste the key.">
                <TextInput
                  id="k-config"
                  value={form.configPath}
                  onChange={(e) => set("configPath", e.target.value)}
                  placeholder={defaultConfigPath(form.name)}
                  className="font-mono text-[13px]"
                />
              </FieldShell>
              <FieldShell label="Sort order" htmlFor="k-order" error={errors.order}>
                <TextInput id="k-order" type="number" min={0} value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
              </FieldShell>
            </div>
            <FieldShell
              label="Places per license"
              htmlFor="k-places"
              error={errors.placesPerLicense}
              hint="How many places one key from a single purchase can run in. Existing licenses keep their own limit."
            >
              <TextInput
                id="k-places"
                type="number"
                min={1}
                max={100}
                value={form.placesPerLicense}
                onChange={(e) => set("placesPerLicense", Number(e.target.value) || 1)}
                className="w-28"
              />
            </FieldShell>
          </section>

          <section className={section}>
            <FieldShell label="Icon">
              <IconPicker value={form.icon} onChange={(v) => set("icon", v)} />
            </FieldShell>
            <FieldShell label="Features" htmlFor="k-feat" error={errors.features} hint="Enter to add · up to 12">
              <TagListInput id="k-feat" value={form.features} onChange={(v) => set("features", v)} placeholder="Stage & lighting presets" />
            </FieldShell>
            <FieldShell label="Plugs into" error={errors.integrations}>
              <ChipGroup options={INTEGRATIONS} value={form.integrations} onChange={(v) => set("integrations", v)} />
            </FieldShell>
            <FieldShell label="Stat bars">
              <div className="space-y-2.5 rounded-md border border-line bg-surface px-3 py-3">
                <ScoreSlider id="k-a1" label="Systems" value={form.attributes.systems} onChange={(v) => set("attributes", { ...form.attributes, systems: v })} />
                <ScoreSlider id="k-a2" label="Integration" value={form.attributes.integration} onChange={(v) => set("attributes", { ...form.attributes, integration: v })} />
                <ScoreSlider id="k-a3" label="Setup speed" value={form.attributes.setup} onChange={(v) => set("attributes", { ...form.attributes, setup: v })} />
              </div>
            </FieldShell>
          </section>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          {serverError && <p role="alert" className="mr-auto truncate text-[13px] text-red-500" title={serverError}>{serverError}</p>}
          <Btn onClick={close}>Cancel</Btn>
          <Btn type="submit" variant="primary" disabled={saving}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isNew ? "Create kit" : "Save changes"}
          </Btn>
        </footer>
      </form>
    </div>
  );
}
