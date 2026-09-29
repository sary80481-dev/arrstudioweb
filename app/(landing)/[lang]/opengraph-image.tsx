import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "ArrStudio — Premium Roblox kits";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Preview link per bahasa — judul hero ikut bahasa link yang dibagikan */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  // Barlow tidak punya glyph Thai → preview Thai memakai teks Inggris daripada kotak kosong
  const t = await getDictionary(hasLocale(lang) && lang !== "th" ? lang : "en");
  return renderOgImage({ titleA: t.hero.titleA, titleB: t.hero.titleB });
}
