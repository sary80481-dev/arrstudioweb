import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_STATE_COOKIE, discordAuthorizeUrl, discordRedirectUri } from "@/lib/server/discord";

/** GET /api/auth/discord?next=/dashboard — mulai login dengan Discord */
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next");
  // hanya izinkan redirect internal, cegah open redirect
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const state = randomBytes(16).toString("hex");
  (await cookies()).set(OAUTH_STATE_COOKIE, JSON.stringify({ state, next: safeNext }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/discord",
    maxAge: 600,
  });

  try {
    return NextResponse.redirect(discordAuthorizeUrl(state, discordRedirectUri(req.nextUrl.origin)));
  } catch {
    return NextResponse.redirect(new URL("/login?error=discord_config", req.url));
  }
}
