import type { SectionProps } from "@/components/type/landing";
import { Container, Logo } from "./ui";

export default function Footer({ lang, t: { footer: t } }: SectionProps) {
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
        { label: "Discord", href: "#" },
        { label: "YouTube", href: "#" },
        { label: t.links.contact, href: "#" },
        { label: t.links.status, href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface/40">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo href={`/${lang}`} />
            <p className="mt-5 text-sm leading-relaxed text-muted">{t.tagline}</p>
            <form className="mt-7">
              <label htmlFor="newsletter-email" className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-fg">
                {t.newsletter}
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@studio.com"
                  className="h-11 min-w-0 flex-1 border border-line-strong bg-bg px-3 text-sm text-fg placeholder:text-dim focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  className="chamfer-sm h-11 bg-gold-grad px-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-on-gold transition hover:brightness-110"
                >
                  {t.join}
                </button>
              </div>
            </form>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-gold">{c.title}</h3>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-muted transition-colors hover:text-fg">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>{t.rights}</p>
          <ul className="flex gap-6">
            {Object.values(t.legal).map((l) => (
              <li key={l}><a href="#" className="transition-colors hover:text-fg">{l}</a></li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
