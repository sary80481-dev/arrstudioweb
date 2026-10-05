import { z } from "zod";
import { KitPhotoSchema } from "./kit-schema";
import {
  MAX_TEMPLATE_PHOTOS, TEMPLATE_DEVICES, TEMPLATE_ID_PATTERN, TEMPLATE_MODES, TEMPLATE_SERVICES,
} from "./web-templates";

const fields = {
  name: z.string().trim().min(2, "Name is too short").max(60),
  service: z.enum(TEMPLATE_SERVICES),
  description: z.string().trim().max(240),
  mode: z.enum(TEMPLATE_MODES),
  url: z.url({ protocol: /^https$/, message: "Use a full https:// link" }).max(300).nullable(),
  device: z.enum(TEMPLATE_DEVICES),
  photos: z.array(KitPhotoSchema).max(MAX_TEMPLATE_PHOTOS, `Up to ${MAX_TEMPLATE_PHOTOS} photos`),
  published: z.boolean(),
  order: z.number().int().min(0).max(999),
};

type Shape = { mode?: string; url?: string | null; photos?: unknown[] };
const complete = (v: Shape) => (v.mode === "link" ? !!v.url : (v.photos?.length ?? 0) > 0);
const completeIssue = { path: ["mode"], message: "A live link needs a URL; a photo template needs at least one photo" };

/** Validasi input template — dipakai di API admin dan di form admin (client) */
export const WebTemplateInputSchema = z
  .object({ id: z.string().regex(TEMPLATE_ID_PATTERN), ...fields })
  .refine(complete, completeIssue);

/** Patch dikirim utuh oleh form admin (tanpa id), jadi aturan mode tetap bisa dicek */
export const WebTemplatePatchSchema = z.object(fields).partial();
