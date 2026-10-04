// Download image bytes into data: URIs so boards never rot and work offline.
import { defaultFetcher, type Fetcher } from "../lib/http.ts";
import type { Tile } from "./types.ts";

export type EmbedOptions = { fetcher?: Fetcher; maxBytes?: number; timeoutMs?: number; concurrency?: number };

async function download(url: string, f: Fetcher, maxBytes: number, timeoutMs: number): Promise<string> {
  if (!/^https:\/\//i.test(url)) throw new Error("only https image URLs are embedded");
  const res = await f(url, { headers: { accept: "image/*" }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
  if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(type)) throw new Error(`not an image (${type || "no content-type"})`);
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new Error(`too large (${declared} bytes)`);
  if (!res.arrayBuffer) throw new Error("fetcher cannot return bytes");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("empty body");
  if (buf.length > maxBytes) throw new Error(`too large (${buf.length} bytes)`);
  return `data:${type};base64,${buf.toString("base64")}`;
}

/** Embed each tile: try the full image, fall back to the thumbnail. Returns tiles that could not be embedded at all. */
export async function embedTiles(tiles: Tile[], opts: EmbedOptions = {}): Promise<{ failed: { id: string; error: string }[] }> {
  const f = opts.fetcher ?? defaultFetcher;
  const maxBytes = opts.maxBytes ?? 900_000;
  const timeoutMs = opts.timeoutMs ?? 25_000;
  const failed: { id: string; error: string }[] = [];
  let next = 0;
  const worker = async () => {
    while (next < tiles.length) {
      const t = tiles[next++]!;
      if (t.dataUri) continue;
      const errors: string[] = [];
      for (const url of [t.candidate.imageUrl, t.candidate.thumbUrl]) {
        if (!url) continue;
        try { t.dataUri = await download(url, f, maxBytes, timeoutMs); break; }
        catch (e) { errors.push(e instanceof Error ? e.message : String(e)); }
      }
      if (!t.dataUri) failed.push({ id: t.id, error: errors.join("; ") || "no image URL" });
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, opts.concurrency ?? 4) }, worker));
  return { failed };
}

/** Unsplash asks for a ping when a photo is actually used. Best effort, never fatal. */
export async function pingUnsplash(tiles: Tile[], key: string | undefined, fetcher: Fetcher = defaultFetcher): Promise<number> {
  if (!key) return 0;
  let n = 0;
  for (const t of tiles) {
    const url = t.candidate.downloadTrigger;
    if (t.candidate.provider !== "unsplash" || !url || !t.dataUri) continue;
    try {
      const r = await fetcher(url, { headers: { authorization: `Client-ID ${key}`, "accept-version": "v1" }, signal: AbortSignal.timeout(10_000) });
      if (r.ok) n++;
    } catch { /* best effort */ }
  }
  return n;
}
