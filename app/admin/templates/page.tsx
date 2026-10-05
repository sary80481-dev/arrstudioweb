import { adminPageGuard } from "@/lib/server/session";
import { listWebTemplates } from "@/lib/server/web-templates";
import TemplatesManager from "./TemplatesManager";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  await adminPageGuard();
  const templates = await listWebTemplates().catch(() => null);
  return <TemplatesManager templates={templates} />;
}
