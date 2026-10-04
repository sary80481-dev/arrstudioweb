import type { Metadata } from "next";
import { listKits } from "@/lib/server/kits";
import { listLicensesForUser } from "@/lib/server/licenses";
import { packageAvailability } from "@/lib/server/packages";
import { getPlaces } from "@/lib/server/roblox";
import { currentUser, redirectToLogin } from "@/lib/server/session";
import StoreProvider from "@/lib/store/StoreProvider";
import { Dashboard, type KitMeta } from "./_components/DashboardClient";

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

  return (
    <StoreProvider preloaded={{ licenses: { items: licenses, error: null } }}>
      <Dashboard
        uid={user.uid}
        name={user.displayName}
        email={user.email}
        isAdmin={user.role === "admin"}
        downloads={downloads}
        kits={kitMeta}
        places={places}
      />
    </StoreProvider>
  );
}
