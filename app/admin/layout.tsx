import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { EMPTY_STATS } from "@/lib/kits";
import { DEFAULT_PRICING } from "@/lib/pricing";
import { getPublicStats, listKits } from "@/lib/server/kits";
import { getPricing } from "@/lib/server/settings";
import { isEnrolled, mfaPassed } from "@/lib/server/mfa";
import { currentUser, redirectToLogin } from "@/lib/server/session";
import AdminShell from "./_components/AdminShell";
import MfaGate from "./_components/MfaGate";

export const metadata: Metadata = { title: "Admin — ArrStudio" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) return redirectToLogin();
  if (user.role !== "admin") redirect("/dashboard");

  // 2FA: tanpa kode yang benar, tidak ada satu pun halaman admin (dan datanya) yang dirender
  if (!(await mfaPassed(user.uid))) return <MfaGate enrolled={await isEnrolled(user.uid)} email={user.email} />;

  // data awal untuk Redux; setelah itu AdminShell menyambung realtime
  const [kits, stats, pricing] = await Promise.all([
    listKits().catch(() => []),
    getPublicStats().catch(() => EMPTY_STATS),
    getPricing().catch(() => DEFAULT_PRICING),
  ]);

  return (
    <AdminShell email={user.email} kits={kits} stats={stats} pricing={pricing}>
      {children}
    </AdminShell>
  );
}
