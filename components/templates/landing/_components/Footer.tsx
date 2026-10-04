import type { SectionProps } from "@/components/type/landing";
import { DISCORD_INVITE } from "@/lib/links";
import CookieSettingsLink from "@/components/common/CookieSettingsLink";
import { STUDIO_URL } from "../_data/landing";
import { Container, Logo, buttonClass } from "./ui";

export default function Footer({ lang, t: { footer: t, nav } }: SectionProps) {
  const cols = [
    {
      title: t.cols.kits,
      links: [
        { label: "ClubKit Pro", href: "#kit-clubkit" },
        { label: "Summit Kit", href: "#kit-summitkit" },
        { label: t.links.pricing, href: "#pricing" },
      ],
    },
    {
      title: t.cols.licensing,
      links: [
        { label: t.links.howItWorks, href: "#license" },
        { label: t.links.setupGuide, href: "/docs" },
        { label: t.links.faq, href: "#faq" },
        { label: t.links.dashboard, href: "/login" },
      ],
    },
    {
      title: t.cols.studio,
      links: [
        { label: "ARRR Studio", href: STUDIO_URL },
        { label: nav.services, href: "#services" },
        { label: "Discord", href: DISCORD_INVITE },
        { label: "YouTube", href: "#" },
        { label: t.links.contact, href: "#" },
        { label: t.links.status, href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-dots border-t-2 border-ink bg-surface-2">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo href={`/${lang}`} />
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{t.tagline}</p>
            <form className="mt-8">
              <label htmlFor="newsletter-email" className="font-display text-base font-semibold text-fg">
                {t.newsletter}
              </label>
              <div className="pop-sm mt-3 flex gap-2 rounded-full bg-surface p-1 transition-shadow focus-within:shadow-[3px_3px_0_0_var(--brand)]">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@studio.com"
                  className="h-9 min-w-0 flex-1 bg-transparent pl-3.5 text-sm font-semibold text-fg placeholder:font-medium placeholder:text-dim focus:outline-none"
                />
                <button type="submit" className={buttonClass("gold", "sm", "shadow-none! hover:shadow-none!")}>
                  {t.join}
                </button>
              </div>
            </form>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="font-display text-base font-semibold text-fg">{c.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm font-semibold text-muted transition-colors hover:text-fg hover:underline hover:decoration-brand hover:decoration-2 hover:underline-offset-4">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t-2 border-line pt-6 text-xs font-semibold text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>{t.rights}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {Object.entries(t.legal).map(([key, l]) => (
              <li key={key}>
                <a href={key === "privacy" ? `/privacy?lang=${lang}` : "#"} className="transition-colors hover:text-fg">{l}</a>
              </li>
            ))}
            <li><CookieSettingsLink lang={lang} /></li>
          </ul>
        </div>
      </Container>

      {/* wordmark raksasa — terpotong di bawah, timbul saat di-hover */}
      <div aria-hidden className="group overflow-hidden">
        <p className="text-hero translate-y-[18%] select-none text-center text-[22vw] leading-none text-transparent transition-[color,transform] duration-500 [-webkit-text-stroke:2px_var(--ink)] group-hover:translate-y-[8%] group-hover:text-brand lg:text-[17rem]">
          ArrStudio
        </p>
      </div>
    </footer>
  );
}
