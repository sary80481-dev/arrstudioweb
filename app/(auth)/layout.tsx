import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Logo, LogoImage } from "@/components/templates/landing/_components/ui";

const perks = [
  "License keys for ClubKit Pro & Summit Kit",
  "Move a license to a new place from your dashboard",
  "Every 1.x update, delivered on server start",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      {/* ═══ FORM ═══ */}
      <div className="relative flex min-w-0 flex-col px-5 py-6 sm:px-12 lg:px-16">
        <header className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-gold"
            >
              <ArrowLeft size={15} />
              Home
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center py-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>

        <p className="text-xs text-dim">© 2026 ArrStudio. Not affiliated with Roblox Corporation.</p>
      </div>

      {/* ═══ VISUAL ═══ */}
      <aside className="relative isolate hidden overflow-hidden border-l border-line bg-surface lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-16">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{ background: "radial-gradient(50% 45% at 50% 38%, var(--glow), transparent 70%)" }} />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "linear-gradient(to top, black, transparent)",
              WebkitMaskImage: "linear-gradient(to top, black, transparent)",
            }}
          />
          <div className="absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
        </div>

        <div className="animate-[float_7s_ease-in-out_infinite]">
          <LogoImage size={280} eager className="h-auto w-56 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] xl:w-64" />
        </div>

        <h2 className="mt-10 text-center font-display text-6xl font-bold uppercase leading-[0.9] text-fg xl:text-7xl">
          Your kits.
          <br />
          <span className="text-gold-metal">Your keys.</span>
        </h2>

        <ul className="mt-10 space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-3 text-muted">
              <span className="chamfer-sm flex h-6 w-6 shrink-0 items-center justify-center bg-gold-grad text-on-gold">
                <Check size={13} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
