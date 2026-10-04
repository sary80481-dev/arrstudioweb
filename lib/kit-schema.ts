import { z } from "zod";
import { INTEGRATIONS, KIT_ICON_KEYS, KIT_ID_PATTERN, KIT_STATUSES, MAX_GALLERY, VIDEO_HOST_PATTERN, type KitIconKey } from "./kits";

const score = z.number().int().min(0).max(100);

// hanya URL Vercel Blob — cegah video/gambar dari host lain ikut tampil di landing
export const blobUrl = z.url({ protocol: /^https$/, hostname: VIDEO_HOST_PATTERN });

export const KitVideoSchema = z.object({
  url: blobUrl,
  poster: blobUrl.nullable(),
  width: z.number().int().min(16).max(4096),
  height: z.number().int().min(16).max(4096),
  duration: z.number().min(0).max(600),
  size: z.number().int().min(1),
});

export const KitPhotoSchema = z.object({
  url: blobUrl,
  width: z.number().int().min(16).max(4096),
  height: z.number().int().min(16).max(4096),
  size: z.number().int().min(1),
});

/** Validasi input kit — dipakai di API admin dan di form admin (client) */
export const KitInputSchema = z.object({
  id: z.string().regex(KIT_ID_PATTERN, "Lowercase letters, numbers and dashes only").optional(),
  name: z.string().trim().min(2, "Name is too short").max(40),
  tag: z.string().trim().min(2, "Category is too short").max(40),
  tagline: z.string().trim().max(80),
  description: z.string().trim().min(10, "Description is too short").max(400),
  version: z.string().trim().regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/, "Use semantic versioning, e.g. 1.2.0"),
  price: z.number().int().min(0).max(100_000_000),
  status: z.enum(KIT_STATUSES),
  icon: z.enum(KIT_ICON_KEYS as [KitIconKey, ...KitIconKey[]]),
  features: z.array(z.string().trim().min(1).max(60)).min(1, "Add at least one feature").max(12),
  integrations: z.array(z.enum(INTEGRATIONS)).max(INTEGRATIONS.length),
  attributes: z.object({ systems: score, integration: score, setup: score }),
  configPath: z.string().trim().regex(/^[A-Za-z0-9_/]{3,60}$/, "Letters, numbers, _ and / only"),
  rating: z.number().min(0).max(5).nullable(),
  order: z.number().int().min(0).max(999),
  placesPerLicense: z.number().int().min(1, "At least 1 place").max(100),
  video: KitVideoSchema.nullable(),
  gallery: z.array(KitPhotoSchema).max(MAX_GALLERY, `Up to ${MAX_GALLERY} photos`),
});

export const KitPatchSchema = KitInputSchema.omit({ id: true }).partial();
