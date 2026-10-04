import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check, KeyRound, MapPin } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Logo, Sparkle } from "@/components/templates/landing/_components/ui";

/** Ilustrasi UI: kartu lisensi + daftar place — gambaran isi dashboard setelah masuk */
function LicenseIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* kartu belakang (miring) */}
      <div aria-hidden className="pop absolute inset-x-6 -top-5 h-full rotate-[-5deg] rounded-[26px] bg-surface/70" />

      {/* kartu lisensi */}
      <div className="pop-lg relative rounded-[26px] bg-surface p-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="pop-sm flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
              <KeyRound size={18} strokeWidth={2.25} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">ClubKit Pro</span>
              <span className="block text-xs font-bold text-dim">License key</span>
            </span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-brand px-2.5 py-0.5 text-xs font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" /> Active
          </span>
        </div>

        <p className="mt-5 rounded-2xl border-2 border-dashed border-ink/40 bg-bg px-4 py-3 text-center font-mono text-[15px] font-semibold tracking-wider">
          ARR-7F2K-••••-Q9RD
        </p>

        <div className="mt-5 flex items-center justify-between text-xs font-bold text-dim">
          <span>Places</span>
          <span>2 / 3</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-bg">
          <div className="h-full w-2/3 rounded-full bg-brand" />
        </div>

        <ul className="mt-4 space-y-2">
          {["Neon Club Hangout", "Summit Festival"].map((p) => (
            <li key={p} className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold">
              <MapPin size={15} strokeWidth={2.25} className="shrink-0" />
              <span className="flex-1 truncate">{p}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-brand">
                <Check size={11} strokeWidth={3.5} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* stiker melayang */}
      <span className="pop absolute -right-4 -top-9 rotate-6 animate-[bob_5s_ease-in-out_infinite] rounded-2xl bg-surface px-3.5 py-2 font-display text-sm font-semibold">
        Ready in 0.84s
      </span>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-dots grid min-h-svh bg-bg lg:grid-cols-[1fr_1fr]">
      {/* ═══ PANEL KUNING — ilustrasi statis, selalu token terang ═══ */}
      <div className="hidden p-5 lg:sticky lg:top-0 lg:block lg:h-svh">
        <aside
          data-theme="light"
          className="pop-lg bg-dots relative isolate flex h-full flex-col overflow-hidden rounded-[36px] bg-brand p-10 text-fg xl:p-12"
        >
          <span aria-hidden className="absolute -bottom-24 -right-24 -z-10 h-80 w-80 rounded-full border-2 border-dashed border-ink/30" />
          <Sparkle size={28} className="absolute right-12 top-12 animate-[twinkle_3s_ease-in-out_infinite]" />
          <Sparkle size={18} className="absolute bottom-[30%] left-10 animate-[twinkle_2.4s_ease-in-out_0.6s_infinite]" />

          <p className="text-hero max-w-md text-5xl xl:text-[3.4rem]">
            Your kits. <span className="text-fg/55">Your keys.</span>
          </p>
          <p className="mt-4 max-w-sm text-base font-semibold text-fg/75">
            Manage every license and the places it&apos;s bound to — from one dashboard.
          </p>

          <div className="flex flex-1 items-center py-10">
            <LicenseIllustration />
          </div>

          <p className="text-sm font-semibold text-fg/70">© {new Date().getFullYear()} ArrStudio · Not affiliated with Roblox Corporation.</p>
        </aside>
      </div>

      {/* ═══ FORM ═══ */}
      <div className="flex min-w-0 flex-col px-4 py-5 sm:px-10">
        <header className="flex h-12 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/"
              className="btn-pop flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 font-display text-sm font-semibold text-fg"
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              Back to site
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center py-8">
          <div className="pop-lg mx-auto w-full max-w-[480px] animate-[rise-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)] rounded-[30px] bg-surface p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
