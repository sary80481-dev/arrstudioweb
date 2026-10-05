import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import type { WebTemplate, WebTemplateInput } from "@/lib/web-templates";
import { deleteBlobs, galleryFiles } from "./blob";
import { ApiError } from "./http";
import { revalidateLanding } from "./revalidate";

type TemplateDoc = Omit<WebTemplate, "id" | "updatedAt"> & { updatedAt?: Timestamp; createdAt?: Timestamp };

const col = () => db().collection("webTemplates");

const toTemplate = (id: string, d: TemplateDoc): WebTemplate => ({
  id,
  name: d.name,
  service: d.service,
  description: d.description ?? "",
  mode: d.mode,
  url: d.url ?? null,
  device: d.device ?? "desktop",
  photos: d.photos ?? [],
  published: d.published ?? false,
  order: d.order ?? 0,
  updatedAt: d.updatedAt?.toDate().toISOString() ?? null,
});

export async function listWebTemplates(opts: { publicOnly?: boolean } = {}): Promise<WebTemplate[]> {
  const snap = await col().get();
  return snap.docs
    .map((d) => toTemplate(d.id, d.data() as TemplateDoc))
    .filter((t) => !opts.publicOnly || t.published)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

async function getWebTemplate(id: string): Promise<WebTemplate | null> {
  const snap = await col().doc(id).get();
  return snap.exists ? toTemplate(snap.id, snap.data() as TemplateDoc) : null;
}

export async function createWebTemplate(id: string, input: WebTemplateInput): Promise<WebTemplate> {
  try {
    await col().doc(id).create({ ...input, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  } catch (err) {
    if ((err as { code?: unknown }).code === 6) throw new ApiError(409, "TEMPLATE_EXISTS", "A template with this id already exists.");
    throw err;
  }
  revalidateLanding();
  return (await getWebTemplate(id))!;
}

export async function updateWebTemplate(id: string, patch: Partial<WebTemplateInput>): Promise<WebTemplate> {
  const before = await getWebTemplate(id);
  if (!before) throw new ApiError(404, "TEMPLATE_NOT_FOUND", "Template not found.");
  const after = { ...before, ...patch };
  if (after.mode === "link" ? !after.url : after.photos.length === 0) {
    throw new ApiError(400, "VALIDATION_FAILED", "A live link needs a URL; a photo template needs at least one photo.");
  }
  await col().doc(id).update({ ...patch, updatedAt: FieldValue.serverTimestamp() });

  // foto yang dibuang tidak dipakai lagi
  if (patch.photos) {
    const keep = new Set(patch.photos.map((p) => p.url));
    await deleteBlobs(galleryFiles(before.photos.filter((p) => !keep.has(p.url))));
  }
  revalidateLanding();
  return (await getWebTemplate(id))!;
}

export async function deleteWebTemplate(id: string) {
  const t = await getWebTemplate(id);
  if (!t) throw new ApiError(404, "TEMPLATE_NOT_FOUND", "Template not found.");
  await col().doc(id).delete();
  await deleteBlobs(galleryFiles(t.photos));
  revalidateLanding();
}

/** Untuk landing (render server): Firestore bermasalah → tanpa template, jangan crash */
export async function loadLandingTemplates(): Promise<WebTemplate[]> {
  try {
    return await listWebTemplates({ publicOnly: true });
  } catch (err) {
    console.warn("[landing] web templates unavailable:", (err as Error).message);
    return [];
  }
}
