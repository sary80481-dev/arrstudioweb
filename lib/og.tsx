import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/site-url";

/* ============================================================
   Gambar preview link (Open Graph) — muncul di bawah link saat
   dibagikan ke WhatsApp, Discord, Telegram, X, Facebook, dst.
   Kiri: judul. Kanan: logo sebagai pusat, terhubung ke tiga lini
   ArrStudio — Roblox, Web, Mobile.
   ============================================================ */

export const OG_SIZE = { width: 1200, height: 630 };

// aset tidak bergantung pada request → dibaca sekali di module scope.
// og-logo.png = logo 360px (logo.png asli 934 KB memperlambat render)
const logoSrc = readFile(join(process.cwd(), "assets/og-logo.png"), "base64")
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
const BG = "#07070a";

/* ─── geometri konstelasi (koordinat kanvas 1200×630) ─── */
const HUB = { x: 905, y: 330, r: 100 };
const NODE_R = 62;
const NODES = [
  { key: "roblox", label: "ROBLOX", x: 905, y: 84 },
  { key: "web", label: "WEB", x: 695, y: 500 },
  { key: "mobile", label: "MOBILE", x: 1115, y: 500 },
] as const;

/** Titik di tengah celah antara tepi cincin pusat dan tepi simpul (bukan di tengah garis) */
function gapMidpoint(n: { x: number; y: number }) {
  const dx = n.x - HUB.x;
  const dy = n.y - HUB.y;
  const len = Math.hypot(dx, dy);
  const t = (HUB.r + (len - HUB.r - NODE_R) / 2) / len;
  return { x: HUB.x + dx * t, y: HUB.y + dy * t };
}

/** Ikon garis sederhana, digambar sendiri supaya selaras (bukan logo pihak ketiga) */
function NodeIcon({ kind }: { kind: (typeof NODES)[number]["key"] }) {
  const common = { fill: "none", stroke: GOLD, strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    // Satori tidak mengenal React Fragment di dalam <svg> → pakai <g>
    <svg width="40" height="40" viewBox="0 0 48 48">
      {kind === "roblox" && (
        <g>
          <rect x="11" y="11" width="26" height="26" transform="rotate(15 24 24)" {...common} />
          <rect x="21" y="21" width="6" height="6" transform="rotate(15 24 24)" fill={GOLD} />
        </g>
      )}
      {kind === "web" && (
        <g>
          <rect x="6" y="10" width="36" height="28" rx="3" {...common} />
          <line x1="6" y1="18" x2="42" y2="18" {...common} />
          <circle cx="11" cy="14" r="1.2" fill={GOLD} />
          <circle cx="15.5" cy="14" r="1.2" fill={GOLD} />
        </g>
      )}
      {kind === "mobile" && (
        <g>
          <rect x="14" y="5" width="20" height="38" rx="4" {...common} />
          <line x1="21" y1="37" x2="27" y2="37" {...common} />
        </g>
      )}
    </svg>
  );
}

export async function renderOgImage({ titleA, titleB }: { titleA: string; titleB: string }) {
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
          position: "relative",
          background: BG,
          fontFamily: fonts.length ? "Barlow" : "sans-serif",
          color: FG,
        }}
      >
        {/* cahaya hangat tipis di belakang konstelasi */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: `radial-gradient(circle at ${HUB.x}px ${HUB.y}px, rgba(226,184,87,0.13), transparent 360px)`,
          }}
        />

        {/* ─── GARIS PENGHUBUNG ─── */}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* segitiga antar lini — sangat tipis */}
          <polygon
            points={NODES.map((n) => `${n.x},${n.y}`).join(" ")}
            fill="none"
            stroke={GOLD}
            strokeOpacity="0.16"
            strokeWidth="1.5"
          />
          {/* pusat → tiap lini */}
          {/* stroke solid, bukan gradien: gradien bbox pada garis vertikal (lebar 0) tidak digambar */}
          {NODES.map((n) => (
            <line key={n.key} x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} stroke={GOLD} strokeOpacity="0.6" strokeWidth="1.6" />
          ))}
          {/* titik "aliran" di tengah tiap garis */}
          {NODES.map((n) => {
            const p = gapMidpoint(n);
            return <circle key={`d-${n.key}`} cx={p.x} cy={p.y} r="4" fill={GOLD} />;
          })}
          {/* cincin pusat */}
          <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill={BG} stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.5" />
          <circle cx={HUB.x} cy={HUB.y} r={HUB.r + 12} fill="none" stroke={GOLD} strokeOpacity="0.14" strokeWidth="1" />
        </svg>

        {/* logo di pusat */}
        {logo && (
          <img
            src={logo}
            width={164}
            height={164}
            alt=""
            style={{ position: "absolute", left: HUB.x - 82, top: HUB.y - 88 }}
          />
        )}

        {/* tiga lini */}
        {NODES.map((n) => (
          <div
            key={n.key}
            style={{
              position: "absolute",
              left: n.x - NODE_R,
              top: n.y - NODE_R,
              width: NODE_R * 2,
              height: NODE_R * 2,
              borderRadius: 999,
              background: "#0e0d10",
              border: "1.5px solid rgba(226,184,87,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NodeIcon kind={n.key} />
            <div style={{ display: "flex", marginTop: 6, fontSize: 17, fontWeight: 600, letterSpacing: 4, color: FG }}>{n.label}</div>
          </div>
        ))}

        {/* ─── TEKS ─── */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 0,
            width: 540,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 22, fontWeight: 600, letterSpacing: 7, color: GOLD }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 5, color: FG, marginRight: 22 }}>
              ARR<span style={{ color: GOLD }}>STUDIO</span>
            </div>
            <div style={{ display: "flex", width: 1.5, height: 26, background: "rgba(226,184,87,0.5)", marginRight: 22 }} />
            ROBLOX · WEB · MOBILE
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 34,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 0.96,
              textTransform: "uppercase",
            }}
          >
            <span>{titleA}</span>
            <span style={{ color: GOLD }}>{titleB}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 40, fontSize: 24, fontWeight: 600, letterSpacing: 3, color: MUTED }}>
            <div style={{ display: "flex", width: 36, height: 2, background: GOLD, marginRight: 14 }} />
            {domain}
          </div>
        </div>
      </div>
    ),
    // fonts: [] akan menimpa font bawaan dan membuat render gagal — kirim hanya bila ada
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) }
  );
}
