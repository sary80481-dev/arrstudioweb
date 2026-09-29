import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Logo, LogoImage } from "@/components/templates/landing/_components/ui";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh bg-bg lg:grid-cols-2">
      {/* ═══ PANEL MEREK — selalu gelap, sama seperti hero landing ═══ */}
      <aside
        data-theme="dark"
        className="relative hidden flex-col border-r border-line bg-surface p-10 text-fg lg:sticky lg:top-0 lg:flex lg:h-svh xl:p-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 40% at 50% 48%, rgb(226 184 87 / 0.14), transparent 70%)" }}
        />
        <Link href="/" aria-label="ArrStudio home" className="relative w-fit">
          <span className="font-display text-lg font-bold uppercase tracking-[0.18em]">
            Arr<span className="text-gold">Studio</span>
          </span>
        </Link>

        <div className="relative flex flex-1 items-center justify-center py-10">
          <LogoImage size={420} eager className="h-auto w-full max-w-[340px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] xl:max-w-[400px]" />
        </div>

        <p className="relative font-display text-3xl font-bold uppercase leading-tight xl:text-4xl">
          Your kits. <span className="text-gold">Your keys.</span>
        </p>
        <p className="relative mt-2 text-sm text-muted">© {new Date().getFullYear()} ArrStudio · Not affiliated with Roblox Corporation.</p>
      </aside>

      {/* ═══ FORM ═══ */}
      <div className="flex min-w-0 flex-col px-5 py-5 sm:px-10">
        <header className="flex h-11 items-center justify-between">
          <span className="lg:invisible">
            <Logo />
          </span>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <ArrowLeft size={15} />
              Back to site
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[380px] animate-[pagein_0.4s_ease-out]">{children}</div>
        </div>
      </div>
    </main>
  );
}
