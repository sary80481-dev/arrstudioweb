"use client";

import { useRef, useState, type DragEvent } from "react";
import { Film, Loader2, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { KitVideoPlayer } from "@/components/video/KitVideoPlayer";
import type { KitVideo } from "@/lib/kits";
import { MAX_DURATION_S, VideoError, compressVideo, formatBytes, formatDuration } from "@/lib/video/compress";
import { Btn } from "../_components/fields";
import { ensureBlobReady } from "./blob-check";

type Phase =
  | { step: "idle" }
  | { step: "compress"; progress: number; name: string }
  | { step: "upload"; progress: number; name: string }
  | { step: "error"; message: string };

const MULTIPART_FROM = 25 * 1024 * 1024;

async function uploadToBlob(path: string, body: Blob, contentType: string, signal: AbortSignal, onProgress?: (p: number) => void) {
  const { upload } = await import("@vercel/blob/client");
  const res = await upload(path, body, {
    access: "public",
    handleUploadUrl: "/api/admin/uploads",
    contentType,
    multipart: body.size > MULTIPART_FROM,
    abortSignal: signal,
    onUploadProgress: ({ percentage }) => onProgress?.(percentage / 100),
  });
  return res.url;
}

/** File di Blob yang diupload tapi tidak jadi dipakai */
export function discardVideos(videos: KitVideo[]) {
  const urls = videos.flatMap((v) => [v.url, v.poster]).filter((u): u is string => !!u);
  if (urls.length === 0) return;
  fetch("/api/admin/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Upload video showcase: kompres di browser (≤1080p H.264) → upload langsung ke Blob.
 * `onUploaded` dipanggil untuk tiap file baru agar sheet bisa membersihkannya bila batal disimpan.
 */
export function VideoField({
  kitId,
  kitName,
  value,
  onChange,
  onUploaded,
}: {
  kitId: string;
  kitName: string;
  value: KitVideo | null;
  onChange: (v: KitVideo | null) => void;
  onUploaded: (v: KitVideo) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ step: "idle" });
  const [savings, setSavings] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busy = phase.step === "compress" || phase.step === "upload";

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setPhase({ step: "error", message: "Choose a video file (MP4, MOV, WebM)." });
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSavings(null);
    setPhase({ step: "compress", progress: 0, name: file.name });

    try {
      // store bermasalah → ketahuan sekarang, bukan setelah menunggu kompresi
      await ensureBlobReady();
      const r = await compressVideo(file, {
        signal: ctrl.signal,
        onProgress: (progress) => setPhase({ step: "compress", progress, name: file.name }),
      });

      setPhase({ step: "upload", progress: 0, name: file.name });
      const base = `kits/${kitId}/${Date.now()}`;
      const posterShare = r.poster ? 0.05 : 0;
      const url = await uploadToBlob(`${base}.mp4`, r.video, "video/mp4", ctrl.signal, (p) =>
        setPhase({ step: "upload", progress: p * (1 - posterShare), name: file.name })
      );
      const poster = r.poster ? await uploadToBlob(`${base}.webp`, r.poster, "image/webp", ctrl.signal) : null;

      const video: KitVideo = {
        url,
        poster,
        width: r.width,
        height: r.height,
        duration: Math.round(r.duration * 10) / 10,
        size: r.video.size,
      };
      onUploaded(video);
      onChange(video);
      setSavings(
        r.compressed
          ? `${formatBytes(r.originalSize)} → ${formatBytes(r.video.size)} (−${Math.max(0, Math.round((1 - r.video.size / r.originalSize) * 100))}%)`
          : "Already efficient — uploaded without re-encoding"
      );
      setPhase({ step: "idle" });
    } catch (err) {
      if (ctrl.signal.aborted) return setPhase({ step: "idle" });
      const message = err instanceof VideoError ? err.message : (err as Error).message || "Upload failed.";
      setPhase({ step: "error", message });
    } finally {
      abortRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && !busy) handleFile(file);
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept="video/mp4,video/quicktime,video/webm,video/*"
      className="sr-only"
      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
    />
  );

  /* ─── sedang diproses ─── */
  if (busy) {
    const pct = Math.round(phase.progress * 100);
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="shrink-0 animate-spin text-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-fg">
              {phase.step === "compress" ? "Compressing to HD (1080p, H.264)…" : "Uploading…"}
            </p>
            <p className="truncate text-xs text-dim">{phase.name}</p>
          </div>
          <span className="text-xs tabular-nums text-muted">{pct}%</span>
          <Btn size="sm" variant="ghost" onClick={() => abortRef.current?.abort()} aria-label="Cancel upload">
            <X size={14} />
          </Btn>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-dim">
          {phase.step === "compress" ? "Step 1 of 2 · runs on this device, keep this tab open" : "Step 2 of 2"}
        </p>
      </div>
    );
  }

  /* ─── sudah ada video ─── */
  if (value) {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <KitVideoPlayer
          key={value.url}
          video={value}
          title={kitName || "Kit video"}
          mode="hover"
          className="aspect-video"
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
          <p className="mr-auto text-xs text-muted">
            <span className="tabular-nums text-fg">{value.width}×{value.height}</span>
            {" · "}
            {formatDuration(value.duration)}
            {" · "}
            {formatBytes(value.size)}
            {savings && <span className="block text-green">{savings}</span>}
            {phase.step === "error" && <span role="alert" className="block text-red-500">{phase.message}</span>}
          </p>
          <Btn size="sm" onClick={() => inputRef.current?.click()}>
            <RefreshCw size={13} /> Replace
          </Btn>
          <Btn size="sm" variant="danger" onClick={() => onChange(null)}>
            <Trash2 size={13} /> Remove
          </Btn>
        </div>
        {picker}
      </div>
    );
  }

  /* ─── kosong ─── */
  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-4 py-7 text-center transition-colors ${
          dragging ? "border-gold bg-gold-soft" : "border-line-strong hover:border-gold/60 hover:bg-surface-2"
        }`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
          {dragging ? <UploadCloud size={18} className="text-gold" /> : <Film size={18} />}
        </span>
        <span className="mt-3 text-[13px] font-medium text-fg">Drop a video or click to choose</span>
        <span className="mt-1 text-xs text-dim">
          MP4, MOV or WebM · up to {MAX_DURATION_S / 60} min · compressed to 1080p before upload
        </span>
        {picker}
      </label>
      {phase.step === "error" && <p role="alert" className="mt-2 text-xs text-red-500">{phase.message}</p>}
    </div>
  );
}
