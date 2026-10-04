import { z } from "zod";
import { checkDiscountForIssue } from "@/lib/server/discounts";
import { handle, json, parseBody } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/session";

const Body = z.object({
  code: z.string().trim().min(1).max(24),
  total: z.number().int().min(1000).max(100_000_000),
  count: z.number().int().min(1).max(50).default(1),
});

/** POST /api/admin/discounts/check — pratinjau potongan kode untuk penerbitan lisensi (tanpa mengubah apa pun) */
export const POST = handle(async (req: Request) => {
  await requireAdmin(req);
  const { code, total, count } = await parseBody(req, Body);
  const r = await checkDiscountForIssue(code, total, count);
  return json({ code: r.code, discount: r.amount, total: total - r.amount });
});
