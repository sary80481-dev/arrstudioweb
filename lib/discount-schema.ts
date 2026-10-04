import { z } from "zod";
import { DISCOUNT_CODE_PATTERN } from "./discount";

export const DiscountSchema = z
  .object({
    code: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .pipe(z.string().regex(DISCOUNT_CODE_PATTERN, "Code must be 3–24 letters, digits, - or _")),
    type: z.enum(["percent", "fixed"]),
    value: z.number().int().min(1).max(100_000_000),
    appliesTo: z.enum(["all", "kit", "bundle"]).default("all"),
    active: z.boolean().default(true),
    maxUses: z.number().int().min(0).max(1_000_000).default(0),
    expiresAt: z.iso.datetime().nullable().default(null),
  })
  .refine((v) => v.type !== "percent" || v.value <= 100, { path: ["value"], message: "Percent must be 1–100" });

export const DiscountPatchSchema = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().min(0).max(1_000_000).optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
});
