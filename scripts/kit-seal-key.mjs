#!/usr/bin/env node
/**
 * Kunci ArrSeal untuk menyegel modul kit di Roblox Studio.
 *
 *   node scripts/kit-seal-key.mjs --init     # buat KIT_SEAL_SECRET di .env (sekali saja)
 *   node scripts/kit-seal-key.mjs clubkit    # cetak kunci pembuka kit "clubkit" (hex)
 *
 * Kunci yang dicetak sama dengan yang dikirim /api/licenses/verify (lib/server/kit-seal.ts),
 * jadi KIT_SEAL_SECRET di Vercel harus sama persis dengan yang di .env.
 */
import { createHmac, randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
const secret = env.match(/^KIT_SEAL_SECRET=(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, "");

if (process.argv.includes("--init")) {
  if (secret) {
    console.log("KIT_SEAL_SECRET sudah ada di .env — tidak diubah.");
  } else {
    appendFileSync(".env", `\n# rahasia ArrSeal — jangan diganti setelah kit disegel\nKIT_SEAL_SECRET=${randomBytes(32).toString("hex")}\n`);
    console.log("KIT_SEAL_SECRET dibuat di .env. Salin juga ke Vercel → Settings → Environment Variables.");
  }
  process.exit(0);
}

const kit = process.argv[2];
if (!kit) {
  console.error("Pakai: node scripts/kit-seal-key.mjs <kitId>   atau   --init");
  process.exit(1);
}
if (!secret) {
  console.error("KIT_SEAL_SECRET belum ada. Jalankan dulu: node scripts/kit-seal-key.mjs --init");
  process.exit(1);
}
console.log(createHmac("sha256", secret).update(`arr-seal:v1:${kit}`).digest("hex"));
