"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface MinifyStats {
  originalSize: number;
  minifiedSize: number;
  saved: number;
  ratio: string;
}

/* ═══════════════════════════════════════════════════
   MINIFIER
   ═══════════════════════════════════════════════════ */

/* Hapus komentar -- line dan --[[ block ]] */
const stripComments = (s: string): string => {
  // block comment dulu
  s = s.replace(/--\[\[[\s\S]*?\]\]/g, "");
  // line comment (hati-hati string)
  s = s.replace(/--[^\n]*/g, "");
  return s;
};

/* Normalize whitespace tapi jaga string & identifier */
const normalizeWhitespace = (s: string): string => {
  const out: string[] = [];
  let i = 0;
  let inString: string | null = null;

  while (i < s.length) {
    const c = s[i];

    // handle string literal
    if (inString) {
      out.push(c);
      if (c === "\\") {
        out.push(s[i + 1] ?? "");
        i += 2;
        continue;
      }
      if (c === inString) inString = null;
      i++;
      continue;
    }

    // enter string
    if (c === '"' || c === "'") {
      inString = c;
      out.push(c);
      i++;
      continue;
    }

    // whitespace normal
    if (/\s/.test(c)) {
      // cek apakah perlu spasi (biar gak nyatu identifier)
      const prev = out[out.length - 1] ?? "";
      const next = s[i + 1] ?? "";
      if (/[a-zA-Z0-9_]/.test(prev) && /[a-zA-Z0-9_]/.test(next)) {
        out.push(" ");
      }
      i++;
      continue;
    }

    out.push(c);
    i++;
  }

  return out.join("");
};

/* Hapus spasi di sekitar operator */
const compactOperators = (s: string): string => {
  return s
    .replace(/\s*([=+\-*/%<>~^#&|,;()\[\]{}])\s*/g, "$1")
    .trim();
};

const minify = (input: string): string => {
  let s = input;
  s = stripComments(s);
  s = normalizeWhitespace(s);
  s = compactOperators(s);
  // hapus newline (udah gak ada)
  s = s.replace(/\n+/g, "");
  return s;
};

const SAMPLE = `-- Ini script contoh
-- dengan komentar

local function greet(name)
  -- sapa user
  print("Hello, " .. name .. "!")
end

local players = {"Alice", "Bob", "Charlie"}
for i, name in ipairs(players) do
  greet(name)
end

return true`;

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */
export default function LuaMinifierPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [stats, setStats] = useState<MinifyStats | null>(null);
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(() => input.split("\n").length, [input]);

  const run = () => {
    if (!input.trim()) {
      setResult(null);
      setStats(null);
      return;
    }
    const out = minify(input);
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([out]).size;
    const saved = originalSize - minifiedSize;
    const ratio =
      originalSize > 0
        ? `${Math.round((saved / originalSize) * 100)}%`
        : "0%";
    setResult(out);
    setStats({ originalSize, minifiedSize, saved, ratio });
    setCopied(false);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-5 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#DC0000]" />
              <span className="text-[10px] tracking-[0.42em] text-white/60 font-semibold uppercase">
                Tools / Lua Minifier
              </span>
            </div>
            <h1
              className="font-black uppercase leading-[0.95] tracking-[-0.02em] text-white"
              style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Strip
              <br />
              <span className="text-[#DC0000]">The Fat.</span>
            </h1>
            <p className="mt-4 text-[11px] tracking-[0.24em] text-white/45 uppercase font-medium max-w-xl">
              Hapus komentar & whitespace — bukan obfuscator, cuma kompres ukuran
            </p>
          </div>
          <Link
            href="/"
            className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/50 hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* WARNING */}
        <div className="mb-6 border border-[#D4AF37]/40 bg-[#D4AF37]/5 px-5 py-4 flex items-start gap-3">
          <span className="w-1 h-1 bg-[#D4AF37] mt-1.5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#D4AF37] mb-1">
              Bukan Obfuscator
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Minifier hanya hapus komentar & whitespace. Untuk protection serius, pakai obfuscator VM.
            </p>
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-white/10 bg-white/[0.01] p-4">
              <div className="text-[9px] font-bold tracking-[0.28em] text-white/40 uppercase mb-1.5">
                Original
              </div>
              <div
                className="text-xl font-black text-white tabular-nums"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {stats.originalSize}{" "}
                <span className="text-[10px] font-mono text-white/40">B</span>
              </div>
            </div>
            <div className="border border-white/10 bg-white/[0.01] p-4">
              <div className="text-[9px] font-bold tracking-[0.28em] text-white/40 uppercase mb-1.5">
                Minified
              </div>
              <div
                className="text-xl font-black text-[#22C55E] tabular-nums"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {stats.minifiedSize}{" "}
                <span className="text-[10px] font-mono text-white/40">B</span>
              </div>
            </div>
            <div className="border border-white/10 bg-white/[0.01] p-4">
              <div className="text-[9px] font-bold tracking-[0.28em] text-white/40 uppercase mb-1.5">
                Saved
              </div>
              <div
                className="text-xl font-black text-[#DC0000] tabular-nums"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {stats.saved}{" "}
                <span className="text-[10px] font-mono text-white/40">B</span>
              </div>
            </div>
            <div className="border border-white/10 bg-white/[0.01] p-4">
              <div className="text-[9px] font-bold tracking-[0.28em] text-white/40 uppercase mb-1.5">
                Ratio
              </div>
              <div
                className="text-xl font-black text-white tabular-nums"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {stats.ratio}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-5">
          {/* INPUT */}
          <div className="relative border border-white/12 bg-white/[0.01] flex flex-col">
            <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-t border-l border-white/30 z-10" />
            <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-t border-r border-white/30 z-10" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-[9px] font-bold tracking-[0.32em] text-white/55 uppercase">
                Input · Source
              </span>
              <div className="flex items-center gap-3 text-[9px] font-mono tracking-[0.22em] text-white/35 uppercase tabular-nums">
                <span>{lineCount} lines</span>
                <span className="hidden md:inline">{input.length} ch</span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste script Lua...\n\nContoh:\n${SAMPLE}`}
              spellCheck={false}
              className="flex-1 min-h-[420px] p-4 bg-black text-white/85 text-[12px] font-mono placeholder:text-white/20 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/10 flex-wrap">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInput(SAMPLE)}
                  className="px-3 py-2 text-[10px] font-bold tracking-[0.22em] uppercase text-white/50 hover:text-white border border-white/15 hover:border-white/40 transition-colors"
                >
                  Load Sample
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("");
                    setResult(null);
                    setStats(null);
                  }}
                  className="px-3 py-2 text-[10px] font-bold tracking-[0.22em] uppercase text-white/50 hover:text-white border border-white/15 hover:border-white/40 transition-colors"
                >
                  Clear
                </button>
              </div>
              <button
                type="button"
                onClick={run}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold tracking-[0.24em] uppercase text-white bg-[#DC0000] hover:bg-[#F00000] transition-colors"
              >
                Minify
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* OUTPUT */}
          <div className="relative border border-white/12 bg-white/[0.01] flex flex-col">
            <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-t border-l border-white/30 z-10" />
            <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-t border-r border-white/30 z-10" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-[9px] font-bold tracking-[0.32em] text-[#22C55E] uppercase">
                Output · Minified
              </span>
              {result && (
                <button
                  onClick={copy}
                  className="text-[9px] font-mono tracking-[0.22em] uppercase text-[#DC0000] hover:text-white transition-colors font-bold"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-[420px] p-4 bg-black overflow-auto">
              {result ? (
                <pre className="text-[12px] font-mono text-white/85 leading-relaxed whitespace-pre-wrap break-all">
                  {result}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="text-white/15 text-3xl mb-3">{"[]"}</div>
                    <div className="text-[10px] tracking-[0.28em] uppercase text-white/35 font-bold">
                      Minified output appears here
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-8 grid md:grid-cols-3 gap-3">
          {[
            { t: "Comment Strip", d: "Hapus komentar -- line dan --[[ block ]]." },
            { t: "Whitespace Trim", d: "Kompres spasi, tab, newline tanpa rusak string." },
            { t: "Operator Compact", d: "Hapus spasi di sekitar operator & simbol." },
          ].map((c) => (
            <div key={c.t} className="border border-white/10 bg-white/[0.01] p-5">
              <div
                className="font-black text-[11px] uppercase tracking-[0.22em] text-white mb-2"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {c.t}
              </div>
              <div className="text-[11px] text-white/50 leading-relaxed">{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}