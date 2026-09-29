import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { ApiError } from "./http";
import { getUser, type UserDto } from "./users";

export const SESSION_COOKIE = "__session";
/** Firebase membatasi session cookie maksimal 14 hari */
const SESSION_MS = 5 * 24 * 60 * 60 * 1000;
/** ID token harus dari login yang baru (mencegah token lama dipakai membuat sesi) */
const MAX_AUTH_AGE_S = 5 * 60;

/** Tukar ID token Firebase (dari client) menjadi session cookie httpOnly */
export async function createSession(idToken: string) {
  const decoded = await adminAuth()
    .verifyIdToken(idToken)
    .catch(() => {
      throw new ApiError(401, "INVALID_TOKEN", "Sign-in token is invalid or expired.");
    });

  if (Date.now() / 1000 - decoded.auth_time > MAX_AUTH_AGE_S) {
    throw new ApiError(401, "STALE_LOGIN", "Please sign in again.");
  }

  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MS });
  (await cookies()).set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });

  return decoded;
}

/**
 * Buat sesi untuk uid tertentu tanpa lewat browser (dipakai login Discord):
 * custom token → ID token (Identity Toolkit REST) → session cookie.
 */
export async function createSessionForUid(uid: string) {
  const customToken = await adminAuth().createCustomToken(uid);
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  if (!res.ok) throw new ApiError(500, "SESSION_FAILED", "Could not start your session.");
  const { idToken } = (await res.json()) as { idToken: string };
  return createSession(idToken);
}

/**
 * Cookie "petunjuk" yang bisa dibaca JavaScript (bukan httpOnly) — hanya nama & role,
 * tanpa rahasia. Dipakai halaman statis (landing) untuk menampilkan menu akun di navbar
 * tanpa request tambahan. Otorisasi tetap selalu dicek dari __session di server.
 */
export const AUTH_HINT_COOKIE = "arr_user";

export async function setAuthHint(user: Pick<UserDto, "displayName" | "role">) {
  // Next sudah meng-encode nilai cookie — jangan encodeURIComponent lagi (jadi dobel)
  (await cookies()).set(AUTH_HINT_COOKIE, JSON.stringify({ n: user.displayName, r: user.role }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

/** Ke halaman login; `?expired=1` bila cookie sesi ada tapi sudah tidak valid (cegah loop di proxy) */
export async function redirectToLogin(): Promise<never> {
  const hadSession = (await cookies()).has(SESSION_COOKIE);
  redirect(hadSession ? "/login?expired=1" : "/login");
}

export async function destroySession() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  store.delete(SESSION_COOKIE);
  store.delete(AUTH_HINT_COOKIE);
  if (cookie) {
    // cabut semua refresh token → logout juga di perangkat lain yang memakai sesi ini
    const decoded = await adminAuth().verifySessionCookie(cookie).catch(() => null);
    if (decoded) await adminAuth().revokeRefreshTokens(decoded.sub);
  }
}

/**
 * User yang sedang login — dari session cookie, atau header
 * `Authorization: Bearer <idToken>` (untuk klien non-browser).
 */
export async function currentUser(req?: Request): Promise<UserDto | null> {
  const bearer = req?.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];

  let uid: string | null = null;
  if (bearer) {
    uid = (await adminAuth().verifyIdToken(bearer, true).catch(() => null))?.uid ?? null;
  } else {
    const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
    if (cookie) uid = (await adminAuth().verifySessionCookie(cookie, true).catch(() => null))?.uid ?? null;
  }

  return uid ? getUser(uid) : null;
}

export async function requireUser(req?: Request): Promise<UserDto> {
  const user = await currentUser(req);
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  return user;
}

export async function requireAdmin(req?: Request): Promise<UserDto> {
  const user = await requireUser(req);
  if (user.role !== "admin") throw new ApiError(403, "FORBIDDEN", "Admin access required.");
  return user;
}
