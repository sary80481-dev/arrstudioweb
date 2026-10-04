"use client";

import { useRef, useState, type DragEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { MAX_GALLERY, type KitPhoto } from "@/lib/kits";
import { PhotoError, compressPhoto } from "@/lib/image/compress";
import { formatBytes } from "@/lib/video/compress";
import { Btn } from "../_components/fields";
import { ensureBlobReady, uniqueName, uploadToBlob } from "./blob-check";

/** Berapa foto diproses bersamaan: cukup banyak untuk jenuhkan koneksi, cukup sedikit untuk tak membekukan tab */
const CONCURRENCY = 5;

interface Pending {
  id: string;
  name: string;
  phase: "compress" | "upload" | "error";
  progress: number;
  preview?: string;
  error?: string;
}

/**
 * Galeri foto showcase (maks 30). Tiap foto dikompres di browser (WebP ≤ 1920 px) lalu diupload
 * langsung ke Blob, 5 sekaligus. Urutan foto = urutan slideshow sinematik; foto pertama jadi sampul.
 * `onChange` menerima fungsi pembaruan karena upload selesai tidak berurutan.
 */
export function GalleryField({
  kitId,
  value,
  onChange,
  onUploaded,
  disabledHint,
}: {
  kitId: string;
  value: KitPhoto[];
  onChange: (update: (prev: KitPhoto[]) => KitPhoto[]) => void;
  onUploaded: (p: KitPhoto) => void;
  /** mis. "Remove the video to show photos" */
  disabledHint?: string;
}) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(new AbortController());

  const active = pending.filter((p) => p.phase !== "error").length;
  const room = MAX_GALLERY - value.length - active;
  const totalSize = value.reduce((n, p) => n + p.size, 0);

  const patch = (id: string, change: Partial<Pending>) => setPending((all) => all.map((p) => (p.id === id ? { ...p, ...change } : p)));

  const processOne = async (file: File, id: string): Promise<KitPhoto> => {
    const c = await compressPhoto(file);
    patch(id, { phase: "upload", progress: 0, preview: URL.createObjectURL(c.blob) });
    const url = await uploadToBlob(`kits/${kitId}/gallery/${uniqueName(`photo.${c.ext}`)}`, c.blob, c.contentType, abortRef.current.signal, (p) =>
      patch(id, { progress: p })
    );
    const photo: KitPhoto = { url, width: c.width, height: c.height, size: c.blob.size };
    onUploaded(photo);
    return photo;
  };

  const addFiles = async (list: File[]) => {
    const images = list.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return setNotice("Choose image files (JPG, PNG or WebP).");
    const files = images.slice(0, Math.max(0, room));
    setNotice(
      files.length < images.length
        ? `Only ${Math.max(0, room)} more photo${room === 1 ? "" : "s"} fit (max ${MAX_GALLERY}) — the rest were skipped.`
        : ""
    );
    if (files.length === 0) return;

    try {
      // store bermasalah → ketahuan sekarang, bukan setelah semua foto dikompres
      await ensureBlobReady();
    } catch (e) {
      return setNotice((e as Error).message);
    }

    const items: Pending[] = files.map((f) => ({ id: uniqueName("p"), name: f.name, phase: "compress", progress: 0 }));
    setPending((all) => [...all, ...items]);

    // kolam pekerja: tiap pekerja mengambil foto berikutnya begitu selesai
    const results: (KitPhoto | null)[] = files.map(() => null);
    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const i = next++;
        try {
          results[i] = await processOne(files[i], items[i].id);
        } catch (err) {
          patch(items[i].id, { phase: "error", error: err instanceof PhotoError ? err.message : `“${files[i].name}” failed to upload.` });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));

    // masuk ke galeri sesuai urutan pilihan, bukan urutan selesai
    const done = results.filter((r): r is KitPhoto => r !== null);
    if (done.length) onChange((prev) => [...prev, ...done].slice(0, MAX_GALLERY));
    setPending((all) => {
      for (const p of all) if (p.phase !== "error" && items.some((it) => it.id === p.id) && p.preview) URL.revokeObjectURL(p.preview);
      return all.filter((p) => p.phase === "error" || !items.some((it) => it.id === p.id));
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (i: number, dir: -1 | 1) =>
    onChange((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles([...e.dataTransfer.files]);
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      onChange={(e) => e.target.files && addFiles([...e.target.files])}
    />
  );

  const empty = value.length === 0 && pending.length === 0;

  return (
    <div>
      {empty ? (
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
            {dragging ? <UploadCloud size={18} className="text-gold" /> : <ImagePlus size={18} />}
          </span>
          <span className="mt-3 text-[13px] font-medium text-fg">Drop photos or click to choose</span>
          <span className="mt-1 text-xs text-dim">Up to {MAX_GALLERY} photos · compressed to WebP in your browser · played as a cinematic slideshow</span>
          {picker}
        </label>
      ) : (
        <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="rounded-lg border border-line bg-surface p-3">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="mr-auto text-xs text-muted">
              <span className="tabular-nums text-fg">{value.length}</span> / {MAX_GALLERY} photos
              {value.length > 0 && <> · {formatBytes(totalSize)}</>}
              {active > 0 && <span className="text-gold"> · adding {active}…</span>}
            </p>
            {room > 0 && (
              <Btn size="sm" onClick={() => inputRef.current?.click()}>
                <ImagePlus size={13} /> Add photos
              </Btn>
            )}
            {value.length > 0 && (
              <Btn size="sm" variant="danger" onClick={() => confirm(`Remove all ${value.length} photos?`) && onChange(() => [])}>
                Clear
              </Btn>
            )}
          </div>

          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((p, i) => (
              <li key={p.url} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatur dari Blob, sudah WebP */}
                <img src={p.url} alt={`Photo ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">Cover</span>}
                <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 text-[10px] tabular-nums text-white">{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-0.5 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} className="rounded bg-black/60 p-1 text-white disabled:opacity-30">
                    <ArrowLeft size={12} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move photo ${i + 1} later`} className="rounded bg-black/60 p-1 text-white disabled:opacity-30">
                    <ArrowRight size={12} />
                  </button>
                  <button type="button" onClick={() => onChange((prev) => prev.filter((x) => x.url !== p.url))} aria-label={`Remove photo ${i + 1}`} className="rounded bg-red-500/90 p-1 text-white">
                    <X size={12} />
                  </button>
                </div>
              </li>
            ))}

            {pending.map((p) => (
              <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-2" title={p.name}>
                {p.preview && (
                  // eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal (blob:)
                  <img src={p.preview} alt="" className="h-full w-full object-cover opacity-50" />
                )}
                {p.phase === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-500/10 p-2 text-center">
                    <AlertCircle size={16} className="text-red-500" />
                    <p className="line-clamp-3 text-[10px] leading-tight text-red-500">{p.error}</p>
                    <button type="button" onClick={() => setPending((all) => all.filter((x) => x.id !== p.id))} className="text-[10px] text-muted underline">Dismiss</button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <Loader2 size={16} className="animate-spin text-gold" />
                    <span className="text-[10px] tabular-nums text-fg">{p.phase === "compress" ? "Compressing" : `${Math.round(p.progress * 100)}%`}</span>
                    {p.phase === "upload" && (
                      <span className="absolute inset-x-0 bottom-0 h-1 bg-surface-2">
                        <span className="block h-full bg-gold transition-[width] duration-200" style={{ width: `${p.progress * 100}%` }} />
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {picker}
        </div>
      )}

      {notice && <p role="alert" className="mt-2 text-xs text-red-500">{notice}</p>}
      {disabledHint && value.length > 0 && <p className="mt-2 text-xs text-gold">{disabledHint}</p>}
    </div>
  );
}
