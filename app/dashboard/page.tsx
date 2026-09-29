import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Container, Logo } from "@/components/templates/landing/_components/ui";
import { listLicensesForUser } from "@/lib/server/licenses";
import { currentUser, redirectToLogin } from "@/lib/server/session";
import StoreProvider from "@/lib/store/StoreProvider";
import { LiveLicenses, SignOutButton } from "./_components/DashboardClient";

export const metadata: Metadata = { title: "Dashboard — ArrStudio" };

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return redirectToLogin();

  const licenses = await listLicensesForUser(user.uid);

  return (
    <div className="min-h-svh">
      <header className="border-b border-line">
        <Container className="flex h-[72px] items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3 sm:gap-5">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-hover"
              >
                <ShieldCheck size={15} />
                Admin
              </Link>
            )}
            <ThemeToggle />
            <span className="hidden text-sm text-muted md:block">{user.email}</span>
            <SignOutButton />
          </div>
        </Container>
      </header>

      <Container className="py-12 md:py-16">
        <p className="flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          <span className="h-px w-8 bg-gold/60" />
          Dashboard
        </p>
        <h1 className="mt-4 break-words font-display text-5xl font-bold uppercase leading-none text-fg md:text-6xl">
          Hey, <span className="text-gold-metal">{user.displayName}</span>
        </h1>

        <StoreProvider preloaded={{ licenses: { items: licenses, error: null } }}>
          <LiveLicenses uid={user.uid} />
        </StoreProvider>
      </Container>
    </div>
  );
}
