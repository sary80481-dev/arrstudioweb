import "server-only";
import type { z } from "zod";

/** Error yang aman dikirim ke client: status HTTP + kode yang stabil untuk dicek oleh UI / kit Roblox */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public extra?: Record<string, unknown>
  ) {
    super(message);
  }
}

export const json = (data: unknown, init?: ResponseInit) => Response.json(data, init);

/** Bungkus handler: ApiError → JSON rapi, error lain → 500 tanpa bocor detail */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return json({ error: { code: err.code, message: err.message, ...err.extra } }, { status: err.status });
      }
      console.error("[api]", err);
      // Firestore belum dibuat → gRPC NOT_FOUND (kode 5) tanpa pesan
      const code = (err as { code?: unknown })?.code;
      const hint = code === 5 ? "Firestore database not found — create it in the Firebase console." : (err as Error)?.message;
      return json(
        {
          error: {
            code: "INTERNAL",
            message: "Something went wrong.",
            // detail hanya saat development, jangan bocor di produksi
            ...(process.env.NODE_ENV !== "production" && { detail: hint }),
          },
        },
        { status: 500 }
      );
    }
  };
}

/** Baca & validasi body JSON */
export async function parseBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(400, "VALIDATION_FAILED", "Request body is invalid.", {
      issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  return result.data;
}

/* ─── RATE LIMIT ───
   Sliding window di memori per instance. Cukup untuk menahan spam dari satu server,
   bukan pengganti rate limit terdistribusi (mis. di CDN / Redis) di produksi besar. */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
    throw new ApiError(429, "RATE_LIMITED", "Too many requests.", { retryAfter });
  }
  recent.push(now);
  hits.set(key, recent);
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}
