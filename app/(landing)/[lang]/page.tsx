import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/components/templates/landing/LandingPage";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { loadLandingData } from "@/lib/server/kits";
import { loadLandingTemplates } from "@/lib/server/web-templates";
import HtmlLang from "@/components/common/HtmlLang";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

/** HTML di-generate ulang tiap 60 detik; setelah load, browser lanjut realtime lewat onSnapshot */
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, data, templates] = await Promise.all([getDictionary(lang), loadLandingData(), loadLandingTemplates()]);

  return (
    <>
      <HtmlLang lang={lang} />
      <LandingPage lang={lang} t={t} kits={data.kits} stats={data.stats} pricing={data.pricing} templates={templates} />
    </>
  );
}
