import { listDiscounts } from "@/lib/server/discounts";
import DiscountsManager from "./DiscountsManager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const discounts = await listDiscounts().catch(() => null);
  return <DiscountsManager discounts={discounts} />;
}
