import type { NextConfig } from "next";

/**
 * CSP dipasang dua lapis:
 *  1. DIBERLAKUKAN: hanya direktif yang tidak mungkin merusak fitur (object, base, frame-ancestors).
 *  2. REPORT-ONLY: kebijakan penuh (Midtrans Snap, Firebase, Roblox, Discord, Vercel Blob). Pelanggarannya masuk
 *     log server lewat /api/csp-report. Setelah beberapa hari tanpa laporan palsu (uji checkout Midtrans, login Discord,
 *     upload video admin), pindahkan isinya ke header "Content-Security-Policy" untuk memberlakukannya.
 */
const BLOB = "https://*.public.blob.vercel-storage.com";
const enforcedCsp = "object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
const fullCsp = [
  "default-src 'self'",
  // Next menyisipkan skrip inline (tanpa nonce) → 'unsafe-inline'; snap.js Midtrans dimuat dari domainnya
  "script-src 'self' 'unsafe-inline' https://*.midtrans.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.rbxcdn.com https://cdn.discordapp.com ${BLOB} https://*.midtrans.com`,
  `media-src 'self' blob: ${BLOB}`,
  "font-src 'self' data:",
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.midtrans.com ${BLOB} https://vercel.com https://blob.vercel-storage.com`,
  "frame-src https://*.midtrans.com https://*.vercel.app https://*.up.railway.app",
  "worker-src 'self' blob:",
  "form-action 'self' https://*.midtrans.com",
  enforcedCsp,
  "report-uri /api/csp-report",
].join("; ");
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: fullCsp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF lebih kecil dari WebP; gambar kita statis, jadi cukup dioptimasi sekali per bulan
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
