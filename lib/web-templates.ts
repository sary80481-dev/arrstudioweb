import type { KitPhoto } from "./kits";

/* ============================================================
   Template web untuk jasa pembuatan web / app — diatur dari /admin/templates,
   tampil di section Services landing (dropdown per layanan).
   Disimpan di Firestore (koleksi `webTemplates`), dibaca server saja.
   ============================================================ */

/** Kategori layanan — urutan sama dengan dict.services.offers */
export const TEMPLATE_SERVICES = ["website", "webapp", "mobile"] as const;
export type TemplateService = (typeof TEMPLATE_SERVICES)[number];

export const TEMPLATE_SERVICE_LABEL: Record<TemplateService, string> = {
  website: "Website",
  webapp: "Web app & system",
  mobile: "Mobile app",
};

/** "link" = situs live dipreview di iframe · "photos" = hanya foto (slideshow) */
export const TEMPLATE_MODES = ["link", "photos"] as const;
export type TemplateMode = (typeof TEMPLATE_MODES)[number];

export const TEMPLATE_DEVICES = ["desktop", "phone"] as const;
export type TemplateDevice = (typeof TEMPLATE_DEVICES)[number];

/** Maksimum foto per template */
export const MAX_TEMPLATE_PHOTOS = 20;

export const TEMPLATE_ID_PATTERN = /^[a-z0-9]{8,40}$/;

export interface WebTemplate {
  id: string;
  name: string;
  service: TemplateService;
  description: string;
  mode: TemplateMode;
  /** wajib untuk mode "link" */
  url: string | null;
  /** bingkai preview: jendela browser atau ponsel */
  device: TemplateDevice;
  /** mode "photos": isi slideshow · mode "link": foto pertama jadi poster sebelum iframe dimuat */
  photos: KitPhoto[];
  published: boolean;
  order: number;
  updatedAt: string | null;
}

export type WebTemplateInput = Omit<WebTemplate, "id" | "updatedAt">;

/** id acak huruf kecil + angka — dibuat di browser agar foto bisa diupload sebelum template disimpan */
export const newTemplateId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(16).padStart(2, "0")).join("");
