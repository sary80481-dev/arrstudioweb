import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, hasLocale, matchLocale } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Sudah login → jangan tampilkan halaman masuk/daftar lagi.
  // (?expired=1 dikirim dashboard saat cookie ada tapi sudah tidak valid — cegah redirect loop)
  if (pathname === "/login" || pathname === "/register") {
    if (request.cookies.has("__session") && !searchParams.has("expired")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // "/" → "/<bahasa>" berdasarkan cookie pilihan user, lalu Accept-Language
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = saved && hasLocale(saved) ? saved : matchLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/login", "/register"],
};
