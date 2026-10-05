"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Images, Link2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { KitPhoto } from "@/lib/kits";
import { WebTemplateInputSchema } from "@/lib/web-template-schema";
import {
  MAX_TEMPLATE_PHOTOS, TEMPLATE_DEVICES, TEMPLATE_MODES, TEMPLATE_SERVICES, TEMPLATE_SERVICE_LABEL, newTemplateId,
  type TemplateDevice, type TemplateMode, type TemplateService, type WebTemplate, type WebTemplateInput,
} from "@/lib/web-templates";
import { KitSlideshow } from "@/components/video/KitSlideshow";
import { Btn, Card, FieldShell, PageHeader, Segmented, Select, StatusPill, TextArea, TextInput, api } from "../_components/fields";
import { GalleryField } from "../kits/GalleryField";
import { discardUrls } from "../kits/blob-check";

const modeLabel: Record<TemplateMode, string> = { link: "Live link", photos: "Photos only" };
const deviceLabel: Record<TemplateDevice, string> = { desktop: "Desktop", phone: "Phone" };

type Draft = WebTemplateInput & { id: string };

const emptyDraft = (order: number, service: TemplateService = "website"): Draft => ({
  id: newTemplateId(),
  name: "",
  service,
  description: "",
  mode: "link",
  url: null,
  device: "desktop",
  photos: [],
  published: true,
  order,
});

export default function TemplatesManager({ templates }: { templates: WebTemplate[] | null }) {
  const router = useRouter();
  const [filter, setFilter] = useState<TemplateService | "all">("all");
  // null = belum memilih; isNew membedakan buat baru vs ubah
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  // foto yang sudah diupload tapi belum disimpan → dibuang dari Blob kalau batal
  const uploads = useRef<KitPhoto[]>([]);

  const list = (templates ?? []).filter((t) => filter === "all" || t.service === filter);
  const nextOrder = (templates ?? []).reduce((n, t) => Math.max(n, t.order + 1), 1);

  const discardPending = () => {
    discardUrls(uploads.current.map((p) => p.url));
    uploads.current = [];
  };

  // tab ditutup saat ada foto belum disimpan
  useEffect(() => {
    const onHide = () => {
      if (uploads.current.length) discardUrls(uploads.current.map((p) => p.url));
      uploads.current = [];
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  const open = (d: Draft | null, fresh = false) => {
    discardPending();
    setError("");
    setDraft(d);
    setIsNew(fresh);
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

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

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const parsed = WebTemplateInputSchema.safeParse({ ...draft, url: draft.url?.trim() || null });
    if (!parsed.success) return setError(parsed.error.issues.map((i) => i.message).join(" · "));
    return run("save", async () => {
      const { id, ...body } = parsed.data;
      if (isNew) await api("POST", "/api/admin/templates", parsed.data);
      else await api("PATCH", `/api/admin/templates/${id}`, body);
      uploads.current = [];
      setDraft(null);
    });
  };

  const remove = (t: WebTemplate) => {
    if (!confirm(`Delete template “${t.name}” and its photos?`)) return;
    run(t.id, async () => {
      await api("DELETE", `/api/admin/templates/${t.id}`);
      if (draft?.id === t.id) setDraft(null);
    });
  };

  return (
    <>
      <PageHeader
        title="Web templates"
        desc="Templates shown under each service on the landing page — a live link visitors can try, or just photos."
        action={
          <Btn variant="primary" onClick={() => open(emptyDraft(nextOrder, filter === "all" ? undefined : filter), true)}>
            <Plus size={14} /> New template
          </Btn>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="h-fit">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <label htmlFor="t-filter" className="text-[13px] font-medium text-fg">Service</label>
            <Select id="t-filter" value={filter} onChange={(e) => setFilter(e.target.value as TemplateService | "all")} className="w-auto">
              <option value="all">All services</option>
              {TEMPLATE_SERVICES.map((s) => (
                <option key={s} value={s}>{TEMPLATE_SERVICE_LABEL[s]}</option>
              ))}
            </Select>
            <span className="ml-auto text-xs text-dim">{list.length} template{list.length === 1 ? "" : "s"}</span>
          </div>

          {templates === null ? (
            <p className="px-4 py-12 text-center text-sm text-muted">Couldn&apos;t load templates. Refresh to try again.</p>
          ) : list.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted">No templates yet. Add the first one.</p>
          ) : (
            <ul className="divide-y divide-line">
              {list.map((t) => (
                <li key={t.id} className={`flex items-center gap-3 px-4 py-3 ${draft?.id === t.id ? "bg-gold-soft/40" : ""}`}>
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2 text-dim">
                    {t.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- miniatur WebP dari Blob
                      <img src={t.photos[0].url} alt="" className="h-full w-full object-cover" />
                    ) : t.mode === "link" ? (
                      <Link2 size={16} />
                    ) : (
                      <Images size={16} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-fg">
                      <span className="truncate">{t.name}</span>
                      <StatusPill tone={t.published ? "green" : "gray"}>{t.published ? "Published" : "Hidden"}</StatusPill>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-dim">
                      {TEMPLATE_SERVICE_LABEL[t.service]} · {modeLabel[t.mode]}
                      {t.mode === "link" && t.url ? ` · ${t.url.replace(/^https:\/\//, "")}` : ` · ${t.photos.length} photo${t.photos.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <Btn size="sm" variant="ghost" aria-label={`Edit ${t.name}`} onClick={() => open({ ...t }, false)}>
                    <Pencil size={14} />
                  </Btn>
                  <Btn size="sm" variant="danger" aria-label={`Delete ${t.name}`} disabled={busy === t.id} onClick={() => remove(t)}>
                    <Trash2 size={14} />
                  </Btn>
                </li>
              ))}
            </ul>
          )}
          {error && !draft && <p className="border-t border-line px-4 py-3 text-[13px] text-red-500">{error}</p>}
        </Card>

        {draft ? (
          <form onSubmit={save}>
            <Card className="h-fit">
              <div className="border-b border-line px-4 py-3">
                <h2 className="text-sm font-semibold text-fg">{isNew ? "New template" : `Edit “${draft.name}”`}</h2>
              </div>
              <div className="space-y-4 p-4">
                <FieldShell label="Name" htmlFor="t-name">
                  <TextInput id="t-name" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Coffee shop landing" maxLength={60} />
                </FieldShell>
                <FieldShell label="Service" htmlFor="t-service" hint="Which service dropdown it appears under">
                  <Select id="t-service" value={draft.service} onChange={(e) => set("service", e.target.value as TemplateService)}>
                    {TEMPLATE_SERVICES.map((s) => (
                      <option key={s} value={s}>{TEMPLATE_SERVICE_LABEL[s]}</option>
                    ))}
                  </Select>
                </FieldShell>
                <FieldShell label="Description" htmlFor="t-desc" hint="Optional · one or two lines">
                  <TextArea id="t-desc" value={draft.description} onChange={(e) => set("description", e.target.value)} maxLength={240} rows={2} />
                </FieldShell>
                <FieldShell label="Preview type">
                  <Segmented options={TEMPLATE_MODES} value={draft.mode} onChange={(v) => set("mode", v)} labels={modeLabel} />
                </FieldShell>
                {draft.mode === "link" && (
                  <FieldShell label="Preview link" htmlFor="t-url" hint="Opens live inside a browser frame. Some sites block being embedded — add photos as a fallback cover.">
                    <div className="flex gap-2">
                      <TextInput
                        id="t-url"
                        type="url"
                        inputMode="url"
                        value={draft.url ?? ""}
                        onChange={(e) => set("url", e.target.value)}
                        placeholder="https://template-demo.vercel.app"
                      />
                      {draft.url && /^https:\/\//.test(draft.url) && (
                        <a href={draft.url} target="_blank" rel="noreferrer" aria-label="Open link" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line-strong text-muted hover:text-fg">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </FieldShell>
                )}
                <FieldShell label="Frame">
                  <Segmented options={TEMPLATE_DEVICES} value={draft.device} onChange={(v) => set("device", v)} labels={deviceLabel} />
                </FieldShell>
                <FieldShell label={draft.mode === "link" ? "Cover photo (optional)" : "Photos"}>
                  <GalleryField
                    folder={`templates/${draft.id}`}
                    max={MAX_TEMPLATE_PHOTOS}
                    value={draft.photos}
                    onChange={(update) => setDraft((d) => (d ? { ...d, photos: update(d.photos) } : d))}
                    onUploaded={(p) => uploads.current.push(p)}
                    disabledHint={draft.mode === "link" ? "The first photo is shown until the visitor opens the live preview." : undefined}
                  />
                  {draft.mode === "photos" && draft.photos.length > 1 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs text-dim">Preview</p>
                      <KitSlideshow photos={draft.photos} title={draft.name || "Preview"} mode="view" className="aspect-video rounded-lg" />
                    </div>
                  )}
                </FieldShell>
                <div className="grid grid-cols-2 gap-3">
                  <FieldShell label="Order" htmlFor="t-order" hint="Lower shows first">
                    <TextInput
                      id="t-order"
                      inputMode="numeric"
                      value={String(draft.order)}
                      onChange={(e) => set("order", Math.min(999, Number(e.target.value.replace(/\D/g, "")) || 0))}
                      className="tabular-nums"
                    />
                  </FieldShell>
                  <FieldShell label="Visibility">
                    <Segmented
                      options={["on", "off"] as const}
                      value={draft.published ? "on" : "off"}
                      onChange={(v) => set("published", v === "on")}
                      labels={{ on: "Published", off: "Hidden" }}
                    />
                  </FieldShell>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
                {error && <p className="mr-auto text-[13px] text-red-500">{error}</p>}
                <Btn onClick={() => open(null)}>Cancel</Btn>
                <Btn type="submit" variant="primary" disabled={busy === "save" || !draft.name.trim()}>
                  {busy === "save" && <Loader2 size={14} className="animate-spin" />}
                  {isNew ? "Create" : "Save"}
                </Btn>
              </div>
            </Card>
          </form>
        ) : (
          <Card className="h-fit">
            <p className="px-4 py-12 text-center text-sm text-muted">Pick a template to edit, or create a new one.</p>
          </Card>
        )}
      </div>
    </>
  );
}
