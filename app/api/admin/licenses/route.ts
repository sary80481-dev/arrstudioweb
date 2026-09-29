import type { NextRequest } from "next/server";
import { z } from "zod";
import { KIT_ID_PATTERN } from "@/lib/kits";
import { ApiError, handle, json, parseBody } from "@/lib/server/http";
import { issueLicenses, listAllLicenses } from "@/lib/server/licenses";
import { requireAdmin } from "@/lib/server/session";
import { findUserByEmail, getUser } from "@/lib/server/users";

/** GET /api/admin/licenses?ownerUid=&kit= — daftar lisensi (admin) */
export const GET = handle(async (req: NextRequest) => {
  await requireAdmin(req);
  const params = req.nextUrl.searchParams;
  const kit = params.get("kit");
  if (kit && !KIT_ID_PATTERN.test(kit)) throw new ApiError(400, "INVALID_KIT", "Unknown kit.");
  const licenses = await listAllLicenses({ ownerUid: params.get("ownerUid") ?? undefined, kit: kit ?? undefined });
  return json({ licenses });
});

const Issue = z
  .object({
    kit: z.string().regex(KIT_ID_PATTERN),
    ownerUid: z.string().min(1).optional(),
    ownerEmail: z.email().optional(),
    count: z.number().int().min(1).max(50).default(1),
    note: z.string().max(200).optional(),
  })
  .refine((v) => v.ownerUid || v.ownerEmail, "ownerUid or ownerEmail is required");

/** POST /api/admin/licenses — terbitkan lisensi untuk user (setelah pembayaran diterima) */
export const POST = handle(async (req: NextRequest) => {
  await requireAdmin(req);
  const body = await parseBody(req, Issue);

  const owner = body.ownerUid ? await getUser(body.ownerUid) : await findUserByEmail(body.ownerEmail!);
  if (!owner) throw new ApiError(404, "USER_NOT_FOUND", "No account with that uid / email. The user must register first.");

  const keys = await issueLicenses({
    kit: body.kit,
    ownerUid: owner.uid,
    ownerEmail: owner.email || body.ownerEmail || null,
    count: body.count,
    note: body.note,
  });
  return json({ keys }, { status: 201 });
});
