"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Blok kode dengan tombol salin — tanpa library syntax highlight (ringan) */
export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-[11px] text-dim">{label ?? ""}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          }}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-dim transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {done ? <Check size={12} className="text-green" /> : <Copy size={12} />}
          {done ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[12.5px] leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
