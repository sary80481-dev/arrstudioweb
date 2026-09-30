import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Container, Logo } from "@/components/templates/landing/_components/ui";
import { listKits } from "@/lib/server/kits";
import { listLicensesForUser } from "@/lib/server/licenses";
import { packageAvailability } from "@/lib/server/packages";
import { getPlaces } from "@/lib/server/roblox";
import { currentUser, redirectToLogin } from "@/lib/server/session";
import StoreProvider from "@/lib/store/StoreProvider";
import { LiveLicenses, SignOutButton, type KitMeta } from "./_components/DashboardClient";

export const metadata: Metadata = { title: "Dashboard — ArrStudio" };

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return redirectToLogin();

  const [licenses, kits] = await Promise.all([listLicensesForUser(user.uid), listKits().catch(() => [])]);
  // kit mana yang sudah punya file .rbxm — URL-nya sendiri tetap di server
  const [downloads, places] = await Promise.all([
    packageAvailability(licenses.map((l) => l.kit)).catch(() => ({})),
    // nama & ikon game dari Roblox; lambat → jangan tahan halaman, client melengkapi sendiri
    Promise.race([
      getPlaces(licenses.flatMap((l) => l.places)),
      new Promise<Record<string, never>>((r) => setTimeout(() => r({}), 1500)),
    ]).catch(() => ({})),
  ]);
  // cukup yang dibutuhkan kartu: ikon, versi terbaru, poster video
  const kitMeta: Record<string, KitMeta> = Object.fromEntries(
    kits.map((k) => [k.id, { icon: k.icon, version: k.version, poster: k.video?.poster ?? null, tagline: k.tagline }])
  );
  const initial = (user.displayName || user.email || "?").trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-svh bg-bg">
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-1.5">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-gold transition-colors hover:bg-gold-soft"
              >
                <ShieldCheck size={14} /> Admin
              </Link>
            )}
            <ThemeToggle />
            <span className="ml-1 hidden items-center gap-2.5 rounded-full bg-surface-2 py-1 pl-1 pr-3.5 md:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-on-brand">{initial}</span>
              <span className="max-w-[200px] truncate text-[13px] text-muted">{user.email}</span>
            </span>
            <SignOutButton />
          </div>
        </Container>
      </header>

      <Container className="pb-24 pt-10 md:pt-16">
        <StoreProvider preloaded={{ licenses: { items: licenses, error: null } }}>
          <LiveLicenses uid={user.uid} name={user.displayName} downloads={downloads} kits={kitMeta} places={places} />
        </StoreProvider>
      </Container>
    </div>
  );
}
