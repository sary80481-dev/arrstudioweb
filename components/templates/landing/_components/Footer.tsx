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
    <footer className="bg-surface-2">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo href={`/${lang}`} />
            <p className="mt-4 text-sm leading-relaxed text-muted">{t.tagline}</p>
            <form className="mt-8">
              <label htmlFor="newsletter-email" className="text-sm font-medium text-fg">
                {t.newsletter}
              </label>
              <div className="mt-3 flex gap-2 rounded-full bg-bg p-1 transition-shadow focus-within:shadow-[0_0_0_3px_var(--gold)]">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@studio.com"
                  className="h-9 min-w-0 flex-1 bg-transparent pl-3.5 text-sm text-fg placeholder:text-dim focus:outline-none"
                />
                <button type="submit" className={buttonClass("gold", "sm")}>
                  {t.join}
                </button>
              </div>
            </form>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="text-[13px] font-semibold text-fg">{c.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-[13px] text-muted transition-colors hover:text-fg hover:underline">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>{t.rights}</p>
          <ul className="flex gap-6">
            {Object.values(t.legal).map((l) => (
              <li key={l}><a href="#" className="transition-colors hover:text-fg">{l}</a></li>
            ))}
            <li><CookieSettingsLink lang={lang} /></li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
