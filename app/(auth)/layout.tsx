import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Logo, LogoImage } from "@/components/templates/landing/_components/ui";
import { KitSlideshow } from "@/components/video/KitSlideshow";
import { KitVideoPlayer } from "@/components/video/KitVideoPlayer";
import { listKits } from "@/lib/server/kits";

/** Panel kiri ikut kit terbaru tanpa membuat halaman login dinamis per request */
export const revalidate = 300;

/** Kit dengan video untuk panel kiri — Firestore belum siap pun halaman tetap tampil */
async function featuredKit() {
  try {
    return (await listKits({ publicOnly: true })).find((k) => k.video || k.gallery.length > 0) ?? null;
  } catch {
    return null;
  }
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const kit = await featuredKit();

  return (
    <main className="grid min-h-svh bg-bg lg:grid-cols-[1.1fr_1fr]">
      {/* ═══ PANEL SINEMATIK — selalu gelap ═══ */}
      <aside
        data-theme="dark"
        className="relative isolate hidden overflow-hidden bg-black text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-end"
      >
        {kit?.video ? (
          <KitVideoPlayer
            video={kit.video}
            title={kit.name}
            mode="view"
            expandable={false}
            className="absolute! inset-0 -z-20 animate-[kenburns_2.4s_ease-out_both] bg-black"
          />
        ) : kit && kit.gallery.length > 0 ? (
          <KitSlideshow photos={kit.gallery} title={kit.name} mode="view" controls={false} className="absolute! inset-0 -z-20 bg-black" />
        ) : (
          <div aria-hidden className="absolute inset-0 -z-20 flex items-start justify-center">
            <div className="absolute inset-0" style={{ background: "radial-gradient(45% 50% at 50% 0%, rgb(255 236 190 / 0.2), transparent 70%)" }} />
            <LogoImage size={380} eager className="relative mt-[16svh] h-auto w-[min(26vw,360px)] drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]" />
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="p-12 xl:p-16">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-gold">{kit ? kit.tag : "ArrStudio"}</p>
          <p className="text-hero mt-4 text-6xl xl:text-7xl">
            {kit ? kit.name : "Your kits."} <span className="text-white/45">{kit ? kit.tagline : "Your keys."}</span>
          </p>
          <p className="mt-6 text-sm text-white/45">© {new Date().getFullYear()} ArrStudio · Not affiliated with Roblox Corporation.</p>
        </div>
      </aside>

      {/* ═══ FORM ═══ */}
      <div className="flex min-w-0 flex-col px-5 py-5 sm:px-10">
        <header className="flex h-11 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <ArrowLeft size={15} />
              Back to site
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center py-12">
          <div className="mx-auto w-full max-w-[400px] animate-[pagein_0.5s_ease-out]">{children}</div>
        </div>
      </div>
    </main>
  );
}
