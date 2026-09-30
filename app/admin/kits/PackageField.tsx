"use client";

import { useEffect, useRef, useState } from "react";
import { FileBox, Loader2, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { formatBytes } from "@/lib/video/compress";
import { Btn, api } from "../_components/fields";
import { ensureBlobReady } from "./blob-check";

interface KitPackage {
  fileName: string;
  size: number;
  uploadedAt: string | null;
}

/**
 * File kit (.rbxm/.rbxmx) yang diunduh pembeli. Langsung terpasang setelah
 * upload (tidak menunggu "Save") — filenya bukan bagian dari dokumen kit publik.
 */
export function PackageField({ kitId }: { kitId: string }) {
  const [pkg, setPkg] = useState<KitPackage | null | undefined>(undefined);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    api<{ package: KitPackage | null }>("GET", `/api/admin/kits/${kitId}/package`)
      .then((r) => setPkg(r.package))
      .catch((e) => {
        setPkg(null);
        setError((e as Error).message);
      });
  }, [kitId]);

  const upload = async (file: File) => {
    if (!/\.rbxmx?$/i.test(file.name)) return setError("Choose a .rbxm or .rbxmx file exported from Roblox Studio.");
    setError("");
    setProgress(0);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await ensureBlobReady();
      const { upload: put } = await import("@vercel/blob/client");
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const xml = /\.rbxmx$/i.test(file.name);
      const res = await put(`kits/${kitId}/packages/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/uploads",
        contentType: xml ? "application/xml" : "application/octet-stream",
        multipart: file.size > 25 * 1024 * 1024,
        abortSignal: ctrl.signal,
        onUploadProgress: ({ percentage }) => setProgress(percentage / 100),
      });
      const r = await api<{ package: KitPackage }>("PUT", `/api/admin/kits/${kitId}/package`, {
        url: res.url,
        fileName: file.name.slice(0, 80),
        size: file.size,
      });
      setPkg(r.package);
    } catch (e) {
      if (!ctrl.signal.aborted) setError((e as Error).message || "Upload failed.");
    } finally {
      setProgress(null);
      abortRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    if (!confirm("Remove the kit file? Buyers won't be able to download it until you upload a new one.")) return;
    try {
      await api("DELETE", `/api/admin/kits/${kitId}/package`);
      setPkg(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept=".rbxm,.rbxmx"
      className="sr-only"
      onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
    />
  );

  if (pkg === undefined) {
    return <div className="h-[74px] animate-pulse rounded-lg bg-surface-2" />;
  }

  if (progress !== null) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="animate-spin text-gold" />
          <p className="flex-1 text-[13px] font-medium text-fg">Uploading kit file…</p>
          <span className="text-xs tabular-nums text-muted">{Math.round(progress * 100)}%</span>
          <Btn size="sm" variant="ghost" onClick={() => abortRef.current?.abort()} aria-label="Cancel upload">
            <X size={14} />
          </Btn>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {pkg ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-soft text-gold">
            <FileBox size={17} />
          </span>
          <div className="mr-auto min-w-0">
            <p className="truncate text-[13px] font-medium text-fg">{pkg.fileName}</p>
            <p className="text-xs text-dim">
              {formatBytes(pkg.size)}
              {pkg.uploadedAt && ` · uploaded ${new Date(pkg.uploadedAt).toLocaleDateString()}`}
            </p>
          </div>
          <Btn size="sm" onClick={() => inputRef.current?.click()}>
            <RefreshCw size={13} /> Replace
          </Btn>
          <Btn size="sm" variant="danger" onClick={remove}>
            <Trash2 size={13} /> Remove
          </Btn>
          {picker}
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line-strong px-4 py-4 transition-colors hover:border-gold/60 hover:bg-surface-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted">
            <UploadCloud size={17} />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-fg">Upload the kit model</span>
            <span className="block text-xs text-dim">.rbxm or .rbxmx · buyers download it with their license</span>
          </span>
          {picker}
        </label>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
