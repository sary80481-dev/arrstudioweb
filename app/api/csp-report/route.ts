import { clientIp, rateLimit } from "@/lib/server/http";

/**
 * POST /api/csp-report — laporan pelanggaran CSP (mode Report-Only, lihat next.config.ts).
 * Hanya dicatat ke log server untuk menyusun kebijakan yang aman diberlakukan; tidak menyimpan apa pun.
 */
export async function POST(req: Request) {
  try {
    rateLimit(`csp:${clientIp(req)}`, 30, 60_000);
    const text = (await req.text()).slice(0, 2000);
    console.warn("[csp-report]", text.replace(/[\r\n]+/g, " "));
  } catch {
    // laporan tidak penting — jangan pernah melempar error
  }
  return new Response(null, { status: 204 });
}
