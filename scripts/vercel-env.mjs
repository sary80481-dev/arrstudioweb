#!/usr/bin/env node
/**
 * Salin semua variabel dari .env ke project Vercel (production + preview).
 *
 *   pnpm dlx vercel link            # sekali, hubungkan folder ini ke project Vercel
 *   node scripts/vercel-env.mjs     # upload env
 *   node scripts/vercel-env.mjs --dry-run
 *
 * APP_URL tidak disalin dari .env (isinya localhost) — set manual ke domain produksi.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");
const SKIP = new Set(["APP_URL"]);
const TARGETS = ["production", "preview"];

const vars = readFileSync(".env", "utf8")
  .split(/\r?\n/)
  .filter((l) => /^[A-Z0-9_]+=/.test(l))
  .map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
  })
  .filter(([k, v]) => v !== "" && !SKIP.has(k));

const mask = (v) => (v.length <= 8 ? "••••" : `${v.slice(0, 4)}…${v.slice(-2)}`);

for (const [key, value] of vars) {
  if (DRY) {
    for (const target of TARGETS) console.log(`[dry-run] ${key}=${mask(value)} → ${target}`);
    continue;
  }

  // Hapus dari SEMUA environment sekaligus. `env rm KEY production` gagal bila variabel dibuat
  // di dashboard untuk beberapa environment dalam satu entri → lalu `add` bentrok "already exists".
  const rm = spawnSync("vercel", ["env", "rm", key, "--yes"], { encoding: "utf8", shell: true });
  const rmOut = `${rm.stdout}${rm.stderr}`;
  if (rm.status !== 0 && !/not found|doesn.t exist|does not exist/i.test(rmOut)) {
    console.log(`✗ ${key}  gagal menghapus nilai lama: ${rmOut.trim()}`);
    continue;
  }

  // tambah ulang per target (nilai dikirim lewat stdin, tidak muncul di log)
  for (const target of TARGETS) {
    const r = spawnSync("vercel", ["env", "add", key, target], { input: value, encoding: "utf8", shell: true });
    console.log(`${r.status === 0 ? "✓" : "✗"} ${key} → ${target}${r.status === 0 ? "" : `  ${r.stderr.trim()}`}`);
  }
}

if (!DRY) console.log("\nSelesai. Jangan lupa set APP_URL ke domain produksi di Vercel → Settings → Environment Variables.");
