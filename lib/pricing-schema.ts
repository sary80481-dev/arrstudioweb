import { z } from "zod";

/** Validasi pengaturan harga — dipisah dari lib/pricing.ts agar zod tidak ikut ke bundle landing */
export const PricingSchema = z.object({
  bundleEnabled: z.boolean(),
  bundlePrice: z.number().int().min(0).max(100_000_000),
  bundlePlaces: z.number().int().min(1).max(50),
});
