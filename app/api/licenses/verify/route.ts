import { z } from "zod";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { ApiError, clientIp, handle, json, parseBody, rateLimit } from "@/lib/server/http";
import { maskKey, normalizeKey, verifyLicense } from "@/lib/server/licenses";
import { assertNotBlocked, recordFailure } from "@/lib/server/ratelimit";

const Body = z.object({
  key: z.string().min(1).max(32),
  kit: z.string().regex(KIT_ID_PATTERN, "Unknown kit id"),
  /** fallback bila header Roblox-Id tidak ada (mis. saat testing dengan curl) */
  placeId: z.union([z.string(), z.number()]).transform(String).optional(),
  jobId: z.string().max(64).optional(),
  /** versi kit yang terpasang, mis. "1.2.0" */
  version: z.string().max(32).optional(),
});

/**
 * POST /api/licenses/verify — dipanggil oleh kit dari server Roblox (HttpService).
 * Server game Roblox otomatis mengirim header `Roblox-Id: <placeId>`.
 */
export const POST = handle(async (req: Request) => {
  const body = await parseBody(req, Body);
  const key = normalizeKey(body.key);

  // batasi per key dan per IP agar key tidak bisa ditebak dengan brute-force
  rateLimit(`verify:ip:${clientIp(req)}`, 120, 60_000);
  rateLimit(`verify:key:${key}`, 30, 60_000);

  const headerPlaceId = req.headers.get("roblox-id");
  const placeId =
  headerPlaceId ?? (process.env.NODE_ENV !== "production" ? body.placeId : null);
  if (!placeId || !/^\d{1,20}$/.test(placeId)) {
    throw new ApiError(400, "MISSING_PLACE_ID", "Place ID is missing. Call this endpoint from a Roblox game server.");
  }

  // tebakan key: hanya percobaan GAGAL yang dihitung (bersama lintas instance) — IP server Roblox dipakai banyak pembeli,
  // jadi lalu lintas normal tidak boleh ikut terhitung
  const ip = clientIp(req);
  await assertNotBlocked(`verify-fail:${ip}`, 30, 10 * 60_000);
  const result = await verifyLicense({ key, kit: body.kit, placeId, jobId: body.jobId, version: body.version }).catch(async (err) => {
    if (err instanceof ApiError && (err.code === "INVALID_KEY" || err.code === "INVALID_KEY_FORMAT")) {
      await recordFailure(`verify-fail:${ip}`, 10 * 60_000);
    }
    throw err;
  });
  if (result.newlyBound) console.info(`[license] ${maskKey(key)} bound to place ${placeId}`);

  return json(result);
});
