// Orchestrates a board: search -> curate -> embed -> render -> save. Pure of CLI concerns so it is testable.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { searchImages, type ProviderName, type SearchAllOptions } from "../sources/index.ts";
import type { Orientation } from "../sources/types.ts";
import type { Fetcher } from "../lib/http.ts";
import { curate, type Dropped, type Found } from "./curate.ts";
import { embedTiles, pingUnsplash } from "./embed.ts";
import { renderBoard } from "./render.ts";
import { tileId, type BoardSpec, type Tile } from "./types.ts";

export type MakeOptions = {
  slug: string;
  title: string;
  theme: string;
  queries: string[];
  audience: "family" | "public";
  avoid: string[];
  exclude: ReadonlySet<string>;
  project?: string;
  target?: number;
  perQuery?: number;
  orientation?: Orientation;
  providers?: ProviderName[];
  embed?: boolean;
  outRoot?: string;
  /** Test seams. */
  searchFetcher?: Fetcher;
  imageFetcher?: Fetcher;
  searchSources?: SearchAllOptions["sources"];
  now?: Date;
};

export type MakeResult = {
  spec: BoardSpec;
  htmlPath: string;
  specPath: string;
  dropped: Dropped[];
  searchErrors: { provider: string; message: string }[];
  embedFailures: { id: string; error: string }[];
  unsplashPinged: number;
  bytes: number;
};

export const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;

export function boardDir(outRoot: string, slug: string) {
  return join(outRoot, slug);
}

export function saveBoard(spec: BoardSpec, outRoot: string): { htmlPath: string; specPath: string; bytes: number } {
  const dir = boardDir(outRoot, spec.slug);
  mkdirSync(dir, { recursive: true });
  const html = renderBoard(spec);
  const htmlPath = join(dir, "board.html");
  const specPath = join(dir, "board.json");
  writeFileSync(htmlPath, html);
  // The spec keeps tile metadata and notes but not the image bytes (they are re-fetched on rebuild).
  const lean = { ...spec, tiles: spec.tiles.map(({ dataUri: _d, ...t }) => t) };
  writeFileSync(specPath, JSON.stringify(lean, null, 2) + "\n");
  return { htmlPath, specPath, bytes: Buffer.byteLength(html) };
}

export function loadSpec(path: string): BoardSpec {
  if (!existsSync(path)) throw new Error(`No board spec at ${path}`);
  const spec = JSON.parse(readFileSync(path, "utf8")) as BoardSpec;
  if (!spec.slug || !Array.isArray(spec.tiles)) throw new Error(`${path} is not a board spec`);
  return spec;
}

export async function makeBoard(o: MakeOptions): Promise<MakeResult> {
  if (!SLUG.test(o.slug)) throw new Error(`slug "${o.slug}" must be lowercase letters, digits and dashes`);
  const queries = o.queries.map((q) => q.trim()).filter(Boolean);
  if (queries.length < 2) throw new Error("Give at least 2 distinct queries so the board has variety");
  const outRoot = o.outRoot ?? "deliverables/boards";

  const searchErrors: MakeResult["searchErrors"] = [];
  const found: Found[] = [];
  for (const q of queries) {
    const r = await searchImages(q, { count: o.perQuery ?? 20, orientation: o.orientation, providers: o.providers, fetcher: o.searchFetcher, sources: o.searchSources });
    for (const e of r.errors) if (!searchErrors.some((x) => x.provider === e.provider && x.message === e.message)) searchErrors.push(e);
    found.push(...r.candidates.map((c) => ({ ...c, query: q })));
  }
  if (found.length === 0) {
    throw new Error(`No images found. ${searchErrors.length ? `Provider errors: ${searchErrors.map((e) => `${e.provider}: ${e.message}`).join("; ")}. Run npm run doctor.` : "Try different queries."}`);
  }

  const { kept, dropped } = curate(found, { audience: o.audience, avoid: o.avoid, exclude: o.exclude, target: o.target });
  const tiles: Tile[] = kept.map(({ query, ...candidate }) => ({
    id: tileId(candidate), candidate, query, note: "",
  }));

  let embedFailures: MakeResult["embedFailures"] = [];
  if (o.embed !== false) {
    embedFailures = (await embedTiles(tiles, { fetcher: o.imageFetcher })).failed;
    // A tile that cannot be embedded would rot, so it does not ship.
    const bad = new Set(embedFailures.map((f) => f.id));
    for (let i = tiles.length - 1; i >= 0; i--) if (bad.has(tiles[i]!.id)) tiles.splice(i, 1);
  }
  if (tiles.length === 0) throw new Error(`Every image failed to download (${embedFailures[0]?.error ?? "unknown"}). Check network access for the image hosts with npm run doctor.`);

  const spec: BoardSpec = {
    slug: o.slug, title: o.title, theme: o.theme, project: o.project, audience: o.audience, avoid: o.avoid,
    createdAt: (o.now ?? new Date()).toISOString(), tiles,
  };
  const saved = saveBoard(spec, outRoot);
  const unsplashPinged = o.embed === false ? 0 : await pingUnsplash(tiles, process.env.UNSPLASH_ACCESS_KEY, o.imageFetcher);
  return { spec, ...saved, dropped, searchErrors, embedFailures, unsplashPinged, bytes: saved.bytes };
}

/** Re-render an edited spec, re-embedding any tile that has no bytes yet. */
export async function rebuildBoard(specPath: string, outRoot: string, opts: { imageFetcher?: Fetcher; embed?: boolean } = {}) {
  const spec = loadSpec(specPath);
  let failures: { id: string; error: string }[] = [];
  if (opts.embed !== false) {
    failures = (await embedTiles(spec.tiles, { fetcher: opts.imageFetcher })).failed;
    const bad = new Set(failures.map((f) => f.id));
    spec.tiles = spec.tiles.filter((t) => !bad.has(t.id));
  }
  return { spec, failures, ...saveBoard(spec, outRoot) };
}
