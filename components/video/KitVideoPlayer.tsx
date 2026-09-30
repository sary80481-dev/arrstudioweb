"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Pause, Play, X } from "lucide-react";
import type { KitVideo } from "@/lib/kits";

/* ============================================================
   Video showcase kit.
   - "view"  : muted loop, diputar hanya saat terlihat (hero, CTA, auth)
   - "hover" : diputar saat kursor di atas kartu; di layar sentuh = "view"
   Sumber video baru dipasang saat pertama kali perlu diputar, jadi
   halaman awal hanya memuat poster (webp kecil).
   Ganti video di tempat yang sama → beri `key={video.url}` dari induk.
   ============================================================ */

type Mode = "view" | "hover";

/** Hemat data / kurangi gerak → jangan autoplay, cukup poster + tombol putar */
function autoplayAllowed() {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return !reduce && !saveData;
}

export function KitVideoPlayer({
  video,
  title,
  mode = "view",
  className = "",
  expandable = true,
  controls = true,
  children,
}: {
  video: KitVideo;
  title: string;
  mode?: Mode;
  className?: string;
  /** tombol "tonton dengan suara" → lightbox */
  expandable?: boolean;
  /** tombol play/pause kecil (wajib ada untuk konten bergerak > 5 detik, WCAG 2.2.2) */
  controls?: boolean;
  /** lapisan di atas video (badge, judul) */
  children?: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  // dijeda manual oleh pengunjung → observer / hover tidak boleh memutar lagi
  const pausedByUser = useRef(false);

  const play = () => {
    const el = videoRef.current;
    if (!el || pausedByUser.current) return;
    // src dipasang langsung (bukan lewat state) agar play() di bawah sudah punya sumber
    if (!el.getAttribute("src")) el.src = video.url;
    // play() ditolak bila tab di background / autoplay diblokir — cukup abaikan
    el.play().catch(() => {});
  };
  const pause = () => videoRef.current?.pause();

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !autoplayAllowed()) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (mode === "hover" && canHover) return; // ditangani onPointerEnter/Leave

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()), {
      threshold: mode === "hover" ? 0.6 : 0.35,
    });
    io.observe(box);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, video.url]);

  const hoverProps =
    mode === "hover"
      ? {
          onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && autoplayAllowed() && play(),
          onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && pause(),
        }
      : {};

  const toggle = () => {
    pausedByUser.current = playing;
    if (playing) pause();
    else play();
  };

  return (
    <div ref={boxRef} className={`group/video relative isolate overflow-hidden bg-surface-2 ${className}`} {...hoverProps}>
      <video
        ref={videoRef}
        poster={video.poster ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}

      {(controls || expandable) && (
        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5 opacity-100 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/video:opacity-100 [@media(hover:hover)]:group-focus-within/video:opacity-100">
          {controls && (
            <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className={overlayBtn}>
              {playing ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
            </button>
          )}
          {expandable && (
            <button type="button" onClick={() => setOpen(true)} aria-label={`Watch ${title} with sound`} className={overlayBtn}>
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      )}

      {open && <VideoLightbox video={video} title={title} onClose={() => setOpen(false)} />}
    </div>
  );
}

const overlayBtn =
  "flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-black/75";

/** Pemutar penuh dengan suara & kontrol bawaan browser */
export function VideoLightbox({ video, title, onClose }: { video: KitVideo; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose]);

  const portrait = video.height > video.width;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-[pagein_0.25s_ease-out] sm:p-8"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${portrait ? "max-w-sm" : "max-w-6xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <p className="truncate text-sm font-medium">{title}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
        <video
          src={video.url}
          poster={video.poster ?? undefined}
          controls
          autoPlay
          playsInline
          className="max-h-[80svh] w-full rounded-2xl bg-black shadow-2xl"
          style={{ aspectRatio: `${video.width} / ${video.height}` }}
        />
      </div>
    </div>,
    document.body
  );
}
