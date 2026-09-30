import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { themeScript } from "@/components/theme/theme";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// satu keluarga huruf untuk judul & teks (Geist variable), mono hanya untuk label kecil & kode
const sans = Geist({ subsets: ["latin", "vietnamese"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  // URL absolut untuk og:image — preview link di WhatsApp/Discord butuh domain asli, bukan path relatif
  metadataBase: new URL(siteUrl()),
  title: "ArrStudio — Premium Roblox Kits",
  description:
    "ClubKit Pro and Summit Kit: licensed Roblox systems that plug straight into the DataStore, group ranks and gamepasses your place already uses.",
  // ikon kecil khusus — logo.png asli 934 KB terlalu berat untuk favicon
  icons: { icon: [{ url: "/icon-64.png", sizes: "64x64" }, { url: "/icon-192.png", sizes: "192x192" }], apple: "/icon-192.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      // matikan smooth scroll sementara saat navigasi (mis. ganti bahasa), supaya
      // scroll ke atas tidak terhenti di tengah dan halaman tampak "turun sendiri"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* set tema sebelum paint — cegah flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
