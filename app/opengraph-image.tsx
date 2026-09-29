import { getDictionary } from "@/lib/i18n/dictionaries";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "ArrStudio — Premium Roblox kits";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Preview link default (login, docs, dll.) — bahasa Inggris */
export default async function Image() {
  const t = await getDictionary("en");
  return renderOgImage({ titleA: t.hero.titleA, titleB: t.hero.titleB, tagline: t.hero.eyebrow });
}
