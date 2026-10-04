import { listDiscounts } from "@/lib/server/discounts";
import { adminPageGuard } from "@/lib/server/session";
import DiscountsManager from "./DiscountsManager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  await adminPageGuard();
  const discounts = await listDiscounts().catch(() => null);
  return <DiscountsManager discounts={discounts} />;
}
