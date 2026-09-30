import "server-only";

/* ============================================================
   Info place Roblox dari API publik (tanpa login): nama game, pembuat,
   ikon, pemain aktif. Dipakai dashboard supaya pembeli melihat
   "KIT ARR REVIEW", bukan hanya 137119588172614 — dan untuk memastikan
   Place ID yang diketik benar-benar ada sebelum disimpan.
   ============================================================ */

export interface PlaceInfo {
  placeId: string;
  name: string;
  creator: string | null;
  iconUrl: string | null;
  playing: number;
  visits: number;
}

const TIMEOUT_MS = 4000;
// cache sederhana per instance — nama & ikon game jarang berubah
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; info: PlaceInfo | null }>();

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: "application/json" }, cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** place → universe; null = place tidak ada, undefined = Roblox tidak bisa dihubungi */
async function universeOf(placeId: string): Promise<number | null | undefined> {
  const r = await getJson<{ universeId: number | null }>(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  return r ? r.universeId : undefined;
}

/**
 * Info banyak place sekaligus. Place yang tidak ada → null.
 * Roblox tidak bisa dihubungi → place itu tidak ada di hasil (UI menampilkan ID saja).
 */
export async function getPlaces(placeIds: string[]): Promise<Record<string, PlaceInfo | null>> {
  const out: Record<string, PlaceInfo | null> = {};
  const todo: string[] = [];
  for (const id of new Set(placeIds)) {
    const hit = cache.get(id);
    if (hit && Date.now() - hit.at < CACHE_MS) out[id] = hit.info;
    else todo.push(id);
  }
  if (todo.length === 0) return out;

  const universes = await Promise.all(todo.map(async (id) => [id, await universeOf(id)] as const));
  const known = universes.filter((u): u is readonly [string, number] => typeof u[1] === "number");
  for (const [id, u] of universes) if (u === null) cache.set(id, { at: Date.now(), info: (out[id] = null) });
  if (known.length === 0) return out;

  const [games, icons] = await Promise.all([
    getJson<{ data: { id: number; name: string; creator?: { name: string }; playing?: number; visits?: number }[] }>(
      `https://games.roblox.com/v1/games?universeIds=${known.map(([, u]) => u).join(",")}`
    ),
    getJson<{ data: { targetId: number; imageUrl: string | null }[] }>(
      `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${known.map(([id]) => id).join(",")}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`
    ),
  ]);
  if (!games) return out;

  for (const [id, universe] of known) {
    const g = games.data.find((x) => x.id === universe);
    if (!g) continue;
    const info: PlaceInfo = {
      placeId: id,
      name: g.name,
      creator: g.creator?.name ?? null,
      iconUrl: icons?.data.find((x) => String(x.targetId) === id)?.imageUrl ?? null,
      playing: g.playing ?? 0,
      visits: g.visits ?? 0,
    };
    cache.set(id, { at: Date.now(), info });
    out[id] = info;
  }
  return out;
}

/** true = ada, false = pasti tidak ada, null = Roblox tidak bisa dihubungi (jangan blokir pengguna) */
export async function placeExists(placeId: string): Promise<boolean | null> {
  const u = await universeOf(placeId);
  return u === undefined ? null : u !== null;
}
