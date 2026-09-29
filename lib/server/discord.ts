import "server-only";
import { ApiError } from "./http";

const API = "https://discord.com/api/v10";

/** Cookie berisi state OAuth (anti-CSRF) + tujuan redirect setelah login */
export const OAUTH_STATE_COOKIE = "discord_oauth_state";

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  email?: string | null;
  verified?: boolean;
}

function config() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ApiError(500, "DISCORD_NOT_CONFIGURED", "Discord login is not configured.");
  }
  return { clientId, clientSecret };
}

/** Redirect URI harus sama persis dengan yang didaftarkan di Discord Developer Portal */
export const discordRedirectUri = (origin: string) =>
  `${process.env.APP_URL ?? origin}/api/auth/discord/callback`;

export function discordAuthorizeUrl(state: string, redirectUri: string) {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.search = new URLSearchParams({
    client_id: config().clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify email",
    state,
    prompt: "none",
  }).toString();
  return url.toString();
}

export async function exchangeDiscordCode(code: string, redirectUri: string): Promise<string> {
  const { clientId, clientSecret } = config();
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new ApiError(401, "DISCORD_EXCHANGE_FAILED", "Discord sign-in failed.");
  const body = (await res.json()) as { access_token: string };
  return body.access_token;
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${API}/users/@me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new ApiError(401, "DISCORD_PROFILE_FAILED", "Could not read your Discord profile.");
  return res.json();
}

export const discordAvatarUrl = (u: DiscordUser) =>
  u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128` : null;
