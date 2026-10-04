import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, db } from "@/lib/firebase/admin";
import {
  OAUTH_STATE_COOKIE, discordAvatarUrl, discordRedirectUri, exchangeDiscordCode, fetchDiscordUser, type DiscordUser,
} from "@/lib/server/discord";
import { createSessionForUid, setAuthHint } from "@/lib/server/session";
import { ensureUser } from "@/lib/server/users";

/**
 * Cari akun Firebase untuk user Discord ini:
 * 1. akun yang sudah pernah login dengan Discord ini,
 * 2. akun email/password dengan email Discord yang terverifikasi (digabung),
 * 3. kalau tidak ada, buat akun baru.
 */
async function resolveUid(u: DiscordUser): Promise<string> {
  const linked = await db().collection("users").where("discordId", "==", u.id).limit(1).get();
  if (!linked.empty) return linked.docs[0].id;

  const email = u.verified && u.email ? u.email : undefined;
  if (email) {
    const existing = await adminAuth().getUserByEmail(email).catch(() => null);
    if (existing) {
      // akun email/password yang belum terverifikasi bisa dibuat orang lain dengan email ini (pre-hijack):
      // email kini terbukti milik user Discord, jadi password lama dicabut sebelum akun digabung
      if (!existing.emailVerified) {
        await adminAuth().updateUser(existing.uid, { emailVerified: true, password: randomBytes(32).toString("hex") });
        await adminAuth().revokeRefreshTokens(existing.uid);
      }
      return existing.uid;
    }
  }

  const created = await adminAuth().createUser({
    uid: `discord_${u.id}`,
    email,
    emailVerified: !!email,
    displayName: u.global_name ?? u.username,
    photoURL: discordAvatarUrl(u) ?? undefined,
  });
  return created.uid;
}

/** GET /api/auth/discord/callback — Discord mengarahkan user kembali ke sini */
export async function GET(req: NextRequest) {
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, req.url));

  const store = await cookies();
  const saved = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth/discord" });

  const params = req.nextUrl.searchParams;
  if (params.get("error")) return fail("discord_cancelled");

  let expected: { state: string; next: string } | null = null;
  try {
    expected = saved ? JSON.parse(saved) : null;
  } catch {}
  const code = params.get("code");
  if (!code || !expected || params.get("state") !== expected.state) return fail("discord_state");

  try {
    const accessToken = await exchangeDiscordCode(code, discordRedirectUri(req.nextUrl.origin));
    const discordUser = await fetchDiscordUser(accessToken);
    const uid = await resolveUid(discordUser);

    await createSessionForUid(uid);
    const user = await ensureUser(uid, discordUser.verified ? discordUser.email ?? "" : "", discordUser.global_name ?? discordUser.username, {
      discordId: discordUser.id,
      discordUsername: discordUser.username,
      avatarUrl: discordAvatarUrl(discordUser),
    }, discordUser.verified);

    await setAuthHint(user);

    return NextResponse.redirect(new URL(expected.next, req.url));
  } catch (err) {
    console.error("[discord]", err);
    return fail("discord_failed");
  }
}
