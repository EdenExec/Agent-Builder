// Curation: turn many search results into a varied, licensable, on-brief set.
import type { ImageCandidate } from "../sources/types.ts";
import { tileId } from "./types.ts";

export type Found = ImageCandidate & { query: string };
export type CurateOptions = {
  audience: "family" | "public";
  /** Words that disqualify a candidate when they appear in its title. */
  avoid: string[];
  /** Tile ids the client has rejected before ("provider:id"). */
  exclude: ReadonlySet<string>;
  target?: number;
  maxPerCreator?: number;
  minWidth?: number;
};
export type Dropped = { id: string; title: string; reason: string };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function curate(found: Found[], opts: CurateOptions): { kept: Found[]; dropped: Dropped[] } {
  const target = opts.target ?? 16;
  const maxPerCreator = opts.maxPerCreator ?? 3;
  const minWidth = opts.minWidth ?? 800;
  const dropped: Dropped[] = [];
  const drop = (c: Found, reason: string) => dropped.push({ id: tileId(c), title: c.title, reason });
  const avoid = opts.avoid.map((w) => w.trim()).filter(Boolean).map((w) => new RegExp(`\\b${escapeRe(w)}`, "i"));

  // 1. Hard filters.
  const seen = new Set<string>();
  const series = new Set<string>();
  const eligible: Found[] = [];
  for (const c of found) {
    const id = tileId(c);
    if (seen.has(id)) { drop(c, "duplicate"); continue; }
    seen.add(id);
    if (opts.exclude.has(id)) { drop(c, "previously rejected"); continue; }
    if (opts.audience === "public" && !c.commercialOk) { drop(c, "licence not cleared for public use"); continue; }
    const hit = avoid.find((re) => re.test(c.title));
    if (hit) { drop(c, `title matches avoid list (${hit.source.replace(/^\\b/, "")})`); continue; }
    if (c.width !== undefined && c.width < minWidth) { drop(c, `too small (${c.width}px wide)`); continue; }
    // Same creator, same opening words in the title: almost always a series of one subject.
    const who0 = c.creator?.trim().toLowerCase();
    const stem = c.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
    if (who0 && stem.length >= 12) {
      const key = `${who0}|${stem}`;
      if (series.has(key)) { drop(c, "near-duplicate of the same series"); continue; }
      series.add(key);
    }
    eligible.push(c);
  }

  // 2. Round-robin across queries so one query cannot dominate, capping per creator.
  const byQuery = new Map<string, Found[]>();
  for (const c of eligible) (byQuery.get(c.query) ?? byQuery.set(c.query, []).get(c.query)!).push(c);
  const queues = [...byQuery.values()];
  const perCreator = new Map<string, number>();
  const kept: Found[] = [];
  let progressed = true;
  while (kept.length < target && progressed) {
    progressed = false;
    for (const q of queues) {
      while (q.length && kept.length < target) {
        const c = q.shift()!;
        const who = c.creator?.trim().toLowerCase();
        if (who && (perCreator.get(who) ?? 0) >= maxPerCreator) { drop(c, `creator cap (${maxPerCreator})`); continue; }
        if (who) perCreator.set(who, (perCreator.get(who) ?? 0) + 1);
        kept.push(c);
        progressed = true;
        break;
      }
    }
  }
  for (const q of queues) for (const c of q) drop(c, "over target size");
  return { kept, dropped };
}
