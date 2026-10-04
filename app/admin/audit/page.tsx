import { listAudit } from "@/lib/server/audit";
import { adminPageGuard } from "@/lib/server/session";
import { Card, PageHeader } from "../_components/fields";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  "installment.payment": "Recorded installment payment",
  "installment.undo": "Undid last installment payment",
  "discount.create": "Created discount code",
  "discount.update": "Updated discount code",
  "discount.delete": "Deleted discount code",
  "license.issue": "Issued license",
  "license.update": "Updated license",
  "license.delete": "Deleted license",
  "pricing.update": "Changed bundle pricing",
  "user.role": "Changed user role",
};

export default async function AdminAuditPage() {
  await adminPageGuard();
  const entries = await listAudit().catch(() => null);
  return (
    <>
      <PageHeader title="Audit log" desc="Who did what — payments, licenses, discounts, pricing and roles. Latest 200 actions." />
      <Card>
        {entries === null ? (
          <p className="px-4 py-12 text-center text-sm text-muted">Couldn&apos;t load the log. Refresh to try again.</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {entries.map((e) => (
              <li key={e.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-medium text-fg">{LABEL[e.action] ?? e.action}</p>
                  <time className="text-xs text-dim" dateTime={e.at ?? undefined}>
                    {e.at ? new Date(e.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </time>
                </div>
                <p className="mt-0.5 break-all text-xs text-muted">
                  <span className="text-fg">{e.adminEmail || "admin"}</span> · <span className="font-mono">{e.target}</span>
                </p>
                {e.data && Object.keys(e.data).length > 0 && (
                  <p className="mt-1 break-all font-mono text-[11px] text-dim">{JSON.stringify(e.data)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
