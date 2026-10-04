import type { NextRequest } from "next/server";
import { isLocked } from "@/lib/installment";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { ApiError, handle } from "@/lib/server/http";
import { getKit } from "@/lib/server/kits";
import { listLicensesForUser } from "@/lib/server/licenses";
import { getPackage } from "@/lib/server/packages";
import { requireUser } from "@/lib/server/session";

/**
 * GET /api/kits/:id/download — unduh file .rbxm kit.
 * Hanya untuk pemilik lisensi aktif kit ini (atau admin). File dialirkan lewat
 * server, jadi URL penyimpanannya tidak pernah sampai ke browser.
 */
export const GET = handle(async (req: NextRequest, ctx: RouteContext<"/api/kits/[id]/download">) => {
  const user = await requireUser(req);
  const { id } = await ctx.params;
  if (!KIT_ID_PATTERN.test(id)) throw new ApiError(404, "KIT_NOT_FOUND", "Kit not found.");

  if (user.role !== "admin") {
    const mine = (await listLicensesForUser(user.uid)).filter((l) => l.kit === id && l.status === "active");
    if (mine.length > 0 && mine.every(isLocked)) {
      throw new ApiError(403, "INSTALLMENT_UNPAID", "The file unlocks once your installments are fully paid.");
    }
    if (mine.length === 0) throw new ApiError(403, "NO_LICENSE", "You need an active license for this kit to download it.");
  }

  const [kit, pkg] = await Promise.all([getKit(id), getPackage(id)]);
  if (!kit || !pkg) throw new ApiError(404, "FILE_NOT_AVAILABLE", "The kit file isn't available yet. Check back soon.");

  const { get } = await import("@vercel/blob");
  const blob = await get(pkg.url, { access: "public" });
  if (!blob || blob.statusCode !== 200) throw new ApiError(404, "FILE_NOT_AVAILABLE", "The kit file isn't available yet.");

  const ext = pkg.fileName.toLowerCase().endsWith(".rbxmx") ? "rbxmx" : "rbxm";
  const name = `${kit.name.replace(/[^\w-]+/g, "")}-v${kit.version}.${ext}`;
  return new Response(blob.stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
      ...(blob.blob.size ? { "Content-Length": String(blob.blob.size) } : {}),
      "Cache-Control": "private, no-store",
    },
  });
});
