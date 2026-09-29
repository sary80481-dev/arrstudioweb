"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Lock, Play, RotateCw } from "lucide-react";

/** Viewport virtual — situs dirender di ukuran aslinya lalu diperkecil */
const DEVICES = {
  desktop: { w: 1280, ratio: 10 / 16, sizes: "(min-width: 1024px) 720px, 100vw" },
  phone: { w: 390, ratio: 844 / 390, sizes: "300px" },
} as const;

/**
 * Jendela browser / ponsel berisi situs lain.
 * Yang tampil awalnya hanya poster (gambar statis) — iframe situs aslinya baru
 * dimuat saat pengunjung mengetuk "coba live". Tanpa ini setiap kunjungan ikut
 * memuat 3 situs eksternal utuh dan terus memakan CPU selama terlihat.
 */
export function SitePreview({
  url,
  title,
  poster,
  device = "desktop",
  hint,
  className = "",
}: {
  url: string;
  title: string;
  /** screenshot di /public, mis. "/previews/arrr-studio.png" */
  poster: string;
  device?: keyof typeof DEVICES;
  hint?: string;
  className?: string;
}) {
  const { w: VIRTUAL_W, ratio, sizes } = DEVICES[device];
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // skala iframe hanya perlu diukur setelah iframe benar-benar dipasang
  useEffect(() => {
    const el = boxRef.current;
    if (!live || !el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / VIRTUAL_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, [live, VIRTUAL_W]);

  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const frame = (
    <div ref={boxRef} className="relative w-full overflow-hidden bg-surface-2" style={{ aspectRatio: `${1 / ratio}` }}>
      {/* poster tetap ada di bawah iframe → tidak ada layar kosong saat iframe memuat */}
      <Image src={poster} alt={title} fill sizes={sizes} className="object-cover object-top" />

      {live ? (
        <>
          {!loaded && (
            <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-gold" />
          )}
          <iframe
            key={reloadKey}
            src={url}
            title={title}
            onLoad={() => setLoaded(true)}
            className={`absolute left-0 top-0 origin-top-left border-0 bg-surface-2 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ width: VIRTUAL_W, height: VIRTUAL_W * ratio, transform: `scale(${scale})` }}
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() => setLive(true)}
          className="group/ov absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 via-transparent to-transparent pb-5"
        >
          <span className="inline-flex items-center gap-2 bg-bg/95 px-4 py-2 text-sm font-medium text-fg shadow-card transition-transform group-hover/ov:-translate-y-0.5">
            <Play size={14} className="fill-gold text-gold" /> {hint ?? "Try it live"}
          </span>
        </button>
      )}
    </div>
  );

  if (device === "phone") {
    // bingkai ponsel: bezel gelap + notch, tanpa address bar
    return (
      <div className={`rounded-[2.4rem] bg-[#15120c] p-2.5 shadow-card ring-1 ring-line-strong ${className}`}>
        <div className="relative overflow-hidden rounded-[1.9rem]">
          <span aria-hidden className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#15120c]" />
          {frame}
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-card ${className}`}>
      {/* chrome browser */}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted">
          <Lock size={10} className="shrink-0 text-dim" />
          <span className="truncate">{host}</span>
        </span>
        {live && (
          <button
            type="button"
            onClick={() => {
              setLoaded(false);
              setReloadKey((k) => k + 1);
            }}
            aria-label="Reload preview"
            className="rounded p-1 text-dim transition-colors hover:text-fg"
          >
            <RotateCw size={13} />
          </button>
        )}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${host} in a new tab`}
          className="rounded p-1 text-dim transition-colors hover:text-gold"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {frame}
    </div>
  );
}
