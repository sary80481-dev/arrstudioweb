import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/site-url";

/* ============================================================
   Gambar preview link (Open Graph) — muncul di bawah link saat
   dibagikan ke WhatsApp, Discord, Telegram, X, Facebook, dst.
   Komposisinya sama dengan hero: teks kiri, logo merek kanan.
   ============================================================ */

export const OG_SIZE = { width: 1200, height: 630 };

// aset tidak bergantung pada request → dibaca sekali di module scope
const logoSrc = readFile(join(process.cwd(), "public/logo.png"), "base64")
  .then((b64) => `data:image/png;base64,${b64}`)
  .catch(() => null);

/** Barlow Condensed TTF lengkap (latin + vietnam) di repo — Satori tidak membaca woff2, dan tanpa fetch saat runtime */
const loadFont = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts", file))
    .then((b) => Uint8Array.from(b).buffer)
    .catch(() => null);

const GOLD = "#e2b857";
const FG = "#f4f1ea";
const MUTED = "#a8a39a";

export async function renderOgImage({ titleA, titleB, tagline }: { titleA: string; titleB: string; tagline: string }) {
  const [logo, bold, semi] = await Promise.all([
    logoSrc,
    loadFont("BarlowCondensed-Bold.ttf"),
    loadFont("BarlowCondensed-SemiBold.ttf"),
  ]);
  const fonts = [
    bold && { name: "Barlow", data: bold, weight: 700 as const, style: "normal" as const },
    semi && { name: "Barlow", data: semi, weight: 600 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => !!f);

  const domain = siteUrl().replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#07070a",
          fontFamily: fonts.length ? "Barlow" : "sans-serif",
          color: FG,
        }}
      >
        {/* satu sumber cahaya hangat di belakang logo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: "radial-gradient(circle at 78% 50%, rgba(226,184,87,0.18), transparent 45%)",
          }}
        />

        {/* ─── TEKS ─── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700, padding: "0 0 0 80px" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>
            {tagline}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 22,
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            <span>{titleA}</span>
            <span style={{ color: GOLD }}>{titleB}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 44, fontSize: 26, fontWeight: 600, letterSpacing: 3, color: MUTED }}>
            <div style={{ display: "flex", width: 40, height: 3, background: GOLD, marginRight: 16 }} />
            {domain}
          </div>
        </div>

        {/* ─── LOGO ─── */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 40 }}>
          {logo && <img src={logo} width={400} height={400} alt="" />}
        </div>
      </div>
    ),
    // fonts: [] akan menimpa font bawaan dan membuat render gagal — kirim hanya bila ada
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) }
  );
}
