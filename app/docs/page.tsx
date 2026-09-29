import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { LogoImage } from "@/components/templates/landing/_components/ui";
import CodeBlock from "./CodeBlock";
import { ACCESS_LABEL, errorCodes, groups, luaConfig, luaQuickstart, luaResults, type Access, type Endpoint } from "./content";

export const metadata: Metadata = {
  title: "API docs — ArrStudio",
  description: "Connect ArrStudio kits in Roblox to the license API: verify flow, Lua module, endpoints and error codes.",
};

const BASE = process.env.APP_URL ?? "https://arrstudioweb.vercel.app";

const methodClass: Record<Endpoint["method"], string> = {
  GET: "bg-green/10 text-green",
  POST: "bg-gold-soft text-gold",
  PATCH: "bg-sky-500/10 text-sky-500",
  DELETE: "bg-red-500/10 text-red-500",
};
const accessClass: Record<Access, string> = {
  public: "text-muted",
  roblox: "text-gold",
  session: "text-sky-500",
  admin: "text-red-500",
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "roblox", label: "Connect from Roblox" },
  { id: "flow", label: "Verify flow" },
  { id: "results", label: "Handling results" },
  { id: "security", label: "Security" },
  ...groups.map((g) => ({ id: g.id, label: g.title })),
  { id: "errors", label: "Error codes" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 border-b border-line pb-2 text-xl font-semibold tracking-tight text-fg">
      <a href={`#${id}`} className="hover:text-gold">{children}</a>
    </h2>
  );
}

function EndpointCard({ e }: { e: Endpoint }) {
  return (
    <article id={e.id} className="scroll-mt-20 rounded-lg border border-line bg-surface">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line px-4 py-3">
        <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${methodClass[e.method]}`}>{e.method}</span>
        <code className="min-w-0 break-all font-mono text-[13px] text-fg">{e.path}</code>
        <span className={`ml-auto text-xs ${accessClass[e.access]}`}>{ACCESS_LABEL[e.access]}</span>
      </header>
      <div className="space-y-4 p-4">
        <p className="text-sm font-medium text-fg">{e.summary}</p>
        {e.description && <p className="-mt-2 text-sm leading-relaxed text-muted">{e.description}</p>}

        {e.params && (
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full text-[13px]">
              <thead className="bg-surface-2/50 text-left text-xs text-dim">
                <tr>
                  <th className="px-3 py-2 font-normal">Field</th>
                  <th className="px-3 py-2 font-normal">Type</th>
                  <th className="px-3 py-2 font-normal">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {e.params.map((p) => (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-fg">
                      {p.name}
                      {p.required && <span className="ml-1 text-red-500">*</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted">{p.type}</td>
                    <td className="px-3 py-2 text-muted">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(e.request || e.response) && (
          <div className="grid gap-3 xl:grid-cols-2">
            {e.request && <CodeBlock code={e.request} label="Request body" />}
            {e.response && <CodeBlock code={e.response} label="200 Response" />}
          </div>
        )}

        {e.errors && (
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-dim">
            Errors:
            {e.errors.map((c) => (
              <a key={c} href="#errors" className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-muted hover:text-fg">{c}</a>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}

export default function DocsPage() {
  const curl = `curl -X POST ${BASE}/api/licenses/verify \\
  -H "Content-Type: application/json" \\
  -d '{"key":"ARR-7F2K-M4QX-Q9RD","kit":"clubkit","placeId":"0"}'`;

  return (
    <div className="min-h-svh">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoImage size={28} className="h-7 w-7 object-contain" />
            <span className="text-sm font-semibold text-fg">ArrStudio</span>
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">API docs</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-1 text-sm text-muted hover:text-fg sm:flex">
              <ArrowLeft size={14} /> Back to site
            </Link>
            <ThemeToggle className="h-8 w-8" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:py-12">
        {/* sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100svh-6rem)] lg:overflow-y-auto">
          <nav aria-label="On this page">
            <p className="mb-2 text-xs font-medium text-dim">On this page</p>
            <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
              {toc.map((t) => (
                <li key={t.id} className="shrink-0">
                  <a href={`#${t.id}`} className="block rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 max-w-3xl space-y-14">
          {/* ─── OVERVIEW ─── */}
          <section className="space-y-4">
            <h1 id="overview" className="scroll-mt-20 text-3xl font-semibold tracking-tight text-fg">ArrStudio API</h1>
            <p className="leading-relaxed text-muted">
              How ArrStudio kits running in a Roblox place talk to this website. A kit reads its license key from its
              own <code className="rounded bg-surface-2 px-1 font-mono text-[13px] text-fg">Config</code> module and calls one
              endpoint on server start. Everything else — accounts, licenses, kits — is managed on the website.
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              {[
                ["Base URL", BASE],
                ["Format", "JSON over HTTPS"],
                ["Auth (kits)", "License key in body"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-surface px-3 py-2.5">
                  <dt className="text-xs text-dim">{k}</dt>
                  <dd className="mt-0.5 break-all font-mono text-[13px] text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ─── ROBLOX ─── */}
          <section className="space-y-5">
            <H2 id="roblox">Connect from Roblox</H2>
            <ol className="space-y-6">
              <li className="space-y-2">
                <p className="text-sm font-medium text-fg">1. Enable HTTP requests</p>
                <p className="text-sm text-muted">In Roblox Studio: Game Settings → Security → <b className="text-fg">Allow HTTP Requests</b>. The kit can&apos;t reach the API without it.</p>
              </li>
              <li className="space-y-2">
                <p className="text-sm font-medium text-fg">2. Add the license module to the kit</p>
                <p className="text-sm text-muted">
                  Copy <code className="font-mono text-[13px] text-fg">roblox/ArrLicense.lua</code> from this repository into the kit as a
                  ModuleScript (e.g. <code className="font-mono text-[13px] text-fg">ClubKit/Core/ArrLicense</code>) and set its URL:
                </p>
                <CodeBlock code={`ArrLicense.API_URL = "${BASE}"`} label="ArrLicense.lua" />
              </li>
              <li className="space-y-2">
                <p className="text-sm font-medium text-fg">3. The buyer pastes their key into Config</p>
                <CodeBlock code={luaConfig} label="ClubKit/Config" />
              </li>
              <li className="space-y-2">
                <p className="text-sm font-medium text-fg">4. Verify before starting the kit</p>
                <p className="text-sm text-muted">Run this from a server Script. Never require the module from a LocalScript — the key must not reach clients.</p>
                <CodeBlock code={luaQuickstart} label="ClubKit/Bootstrap (server)" />
              </li>
              <li className="space-y-2">
                <p className="text-sm font-medium text-fg">5. Test without Roblox</p>
                <p className="text-sm text-muted">
                  <code className="font-mono text-[13px] text-fg">placeId: &quot;0&quot;</code> behaves like Studio: it validates the key but never binds it.
                </p>
                <CodeBlock code={curl} label="Terminal" />
              </li>
            </ol>
          </section>

          {/* ─── FLOW ─── */}
          <section className="space-y-4">
            <H2 id="flow">Verify flow</H2>
            <ol className="relative space-y-4 border-l border-line pl-5 text-sm">
              {[
                ["Server starts", "Bootstrap calls ArrLicense.verify with Config.LicenseKey, the kit id and version."],
                ["POST /api/licenses/verify", "The API checks the key format and rate limits (30/min per key, 120/min per IP)."],
                ["Transaction in Firestore", "Key exists? Active? Right kit? If the key has no place yet, it binds to this place."],
                ["Response", "valid: true + latestVersion. The module warns in the output if a newer version is available."],
                ["Every 30 minutes", "The module re-checks in the background and calls onRevoked only when the key is explicitly rejected."],
              ].map(([t, d], i) => (
                <li key={t}>
                  <span className="absolute -left-[9px] mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-line-strong bg-bg text-[10px] text-muted">{i + 1}</span>
                  <p className="font-medium text-fg">{t}</p>
                  <p className="text-muted">{d}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ─── RESULTS ─── */}
          <section className="space-y-4">
            <H2 id="results">Handling results in Lua</H2>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-[13px]">
                <thead className="bg-surface-2/50 text-left text-xs text-dim">
                  <tr>
                    <th className="px-3 py-2 font-normal">result.code</th>
                    <th className="px-3 py-2 font-normal">What the kit should do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {luaResults.map((r) => (
                    <tr key={r.code}>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-fg">{r.code}</td>
                      <td className="px-3 py-2 text-muted">{r.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── SECURITY ─── */}
          <section className="space-y-3">
            <H2 id="security">Security</H2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-dim">
              <li>Call the API only from the server. Keep the key out of ReplicatedStorage and LocalScripts.</li>
              <li>A key binds to one place, so a leaked key doesn&apos;t work in someone else&apos;s game.</li>
              <li>Binding runs in a Firestore transaction — two servers starting at once can&apos;t bind one key to two places.</li>
              <li>The browser only reads data allowed by firestore.rules; all writes go through this API.</li>
            </ul>
          </section>

          {/* ─── ENDPOINTS ─── */}
          {groups.map((g) => (
            <section key={g.id} className="space-y-4">
              <H2 id={g.id}>{g.title}</H2>
              {g.intro && <p className="text-sm text-muted">{g.intro}</p>}
              <div className="space-y-4">
                {g.endpoints.map((e) => (
                  <EndpointCard key={e.id} e={e} />
                ))}
              </div>
            </section>
          ))}

          {/* ─── ERRORS ─── */}
          <section className="space-y-4">
            <H2 id="errors">Error codes</H2>
            <p className="text-sm text-muted">Every error has the same shape. Match on <code className="font-mono text-[13px] text-fg">code</code>; show <code className="font-mono text-[13px] text-fg">message</code> to people.</p>
            <CodeBlock
              label="Error response"
              code={`{
  "error": {
    "code": "PLACE_MISMATCH",
    "message": "This license is bound to a different place.",
    "boundPlaceId": "13284790215"
  }
}`}
            />
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-[13px]">
                <thead className="bg-surface-2/50 text-left text-xs text-dim">
                  <tr>
                    <th className="px-3 py-2 font-normal">HTTP</th>
                    <th className="px-3 py-2 font-normal">code</th>
                    <th className="px-3 py-2 font-normal">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {errorCodes.map((e) => (
                    <tr key={e.code}>
                      <td className="px-3 py-2 tabular-nums text-muted">{e.status}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-fg">{e.code}</td>
                      <td className="px-3 py-2 text-muted">{e.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
