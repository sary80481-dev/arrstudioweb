"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Images, Pause, Play } from "lucide-react";
import type { KitPhoto } from "@/lib/kits";

/* ============================================================
   Slideshow sinematik dari foto kit: gerak kamera pelan (zoom / pan bergantian),
   transisi silang, vignette, bilah progres ala "stories". Tanpa video — hanya WebP kecil
   yang dimuat satu per satu (yang tampil + satu berikutnya), jadi ringan untuk pengunjung
   dan tidak perlu render ulang di perangkat admin.
   Mode "hover": bergerak saat kursor di atasnya (di HP: saat terlihat) — seperti pemutar video kartu.
   Mode "view": bergerak selama terlihat di layar.
   ============================================================ */

const SLIDE_MS = 5200;
const FADE_MS = 1200;

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Slide({ photo, index, playing, title }: { photo: KitPhoto; index: number; playing: boolean; title: string }) {
  return (
    <div className="absolute inset-0 animate-[slide-fade_1.2s_ease_both] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- WebP kecil dari Blob; dioptimasi saat upload */}
      <img
        src={photo.url}
        alt={index === 0 ? title : ""}
        width={photo.width}
        height={photo.height}
        decoding="async"
        draggable={false}
        className="h-full w-full select-none object-cover will-change-transform [filter:contrast(1.05)_saturate(1.08)]"
        style={{
          animation: `kb-${index % 4} ${SLIDE_MS + FADE_MS}ms linear both`,
          animationPlayState: playing ? "running" : "paused",
        }}
      />
    </div>
  );
}

export function KitSlideshow({
  photos,
  title,
  mode = "view",
  controls = true,
  className = "",
  children,
}: {
  photos: KitPhoto[];
  title: string;
  mode?: "hover" | "view";
  controls?: boolean;
  className?: string;
  /** overlay (mis. tombol pembuka dialog) */
  children?: ReactNode;
}) {
  const n = photos.length;
  const boxRef = useRef<HTMLDivElement>(null);
  const fadeTimer = useRef<number | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [canHover, setCanHover] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // dibaca setelah mount (hindari mismatch hidrasi)
    const t = window.setTimeout(() => {
      setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
      setReduced(reducedMotion());
    }, 0);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: mode === "hover" ? 0.6 : 0.35 });
    io.observe(box);
    return () => io.disconnect();
  }, [mode]);

  const playing = !reduced && !paused && n > 1 && tabVisible && (mode === "hover" && canHover ? hovering : inView);

  const go = useCallback(
    (to: number) => {
      setPrev(index);
      setIndex(((to % n) + n) % n);
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setPrev(null), FADE_MS + 100);
    },
    [index, n]
  );

  // slide berikutnya setelah SLIDE_MS selama sedang bermain
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => go(index + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, go]);

  // muat foto berikutnya lebih dulu — transisi tak pernah menunggu jaringan
  useEffect(() => {
    if (!playing || n < 2) return;
    const im = new Image();
    im.src = photos[(index + 1) % n].url;
  }, [playing, index, n, photos]);

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  if (n === 0) return null;
  const visibleSlides = prev !== null && prev !== index ? [prev, index] : [index];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
    else if (e.key === " " && controls) setPaused((p) => !p);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={boxRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={title}
      tabIndex={controls ? 0 : -1}
      onKeyDown={controls ? onKey : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
      className={`group/show relative isolate overflow-hidden bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
    >
      {visibleSlides.map((i) => (
        <Slide key={i} photo={photos[i]} index={i} playing={playing} title={title} />
      ))}

      {/* vignette sinematik */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgb(0_0_0/0.45)_100%)]" />
      {children}

      {n > 1 && (
        <>
          {/* bilah progres */}
          <div aria-hidden className="pointer-events-none absolute inset-x-3 bottom-2.5 z-[6] flex gap-[3px]">
            {photos.map((_, i) => (
              <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                <span
                  key={i === index ? `on-${index}` : `off-${i}`}
                  className="block h-full origin-left rounded-full bg-white/90"
                  style={
                    i < index
                      ? { transform: "scaleX(1)" }
                      : i === index
                        ? { animation: `slide-progress ${SLIDE_MS}ms linear both`, animationPlayState: playing ? "running" : "paused" }
                        : { transform: "scaleX(0)" }
                  }
                />
              </span>
            ))}
          </div>

          {!controls && (
            <span className="pointer-events-none absolute right-2.5 top-2.5 z-[6] inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
              <Images size={11} /> {n}
            </span>
          )}

          {controls && (
            <div className="absolute inset-y-0 left-0 right-0 z-[5] flex items-center justify-between px-2 opacity-100 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/show:opacity-100 [@media(hover:hover)]:group-focus-within/show:opacity-100">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          {controls && !reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="absolute bottom-6 right-3 z-[6] flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          )}
        </>
      )}
    </div>
  );
}
