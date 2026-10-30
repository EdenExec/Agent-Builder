// npm run lookahead-mirror -- <dir> [--today YYYY-MM-DD] [--out file]
//   <dir> holds ArtifactData list dumps of the Look Ahead page (out_dir): <dir>/items/*.json and <dir>/weeks/*.json.
//   Writes the `meta/lookahead` document for the Command Center (default <dir>/meta-lookahead.json); push it with one ArtifactData set.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildMirror, type LaItem, type LaWeek } from "../core/lookahead-mirror.ts";

const URL = "https://claude.ai/artifact/W6m2KGscEaeG7i2Q2w3CHU";
const args = process.argv.slice(2), dir = args.find((a) => !a.startsWith("--"));
const flag = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
if (!dir) { console.error("usage: npm run lookahead-mirror -- <dir> [--today YYYY-MM-DD] [--out file]"); process.exit(1); }
const load = <T>(sub: string): Record<string, T> => {
  const d = join(dir!, sub); if (!existsSync(d)) return {};
  return Object.fromEntries(readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => { const x = JSON.parse(readFileSync(join(d, f), "utf8")); return [f.slice(0, -5), (x.data ?? x) as T]; }));
};
const today = flag("today") ?? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
const m = buildMirror(load<LaItem>("items"), load<LaWeek>("weeks"), today, { url: URL });
const out = flag("out") ?? join(dir, "meta-lookahead.json");
writeFileSync(out, JSON.stringify(m, null, 1) + "\n");
console.log(`meta/lookahead for week of ${m.week.start}: ${m.next.length} upcoming, ${m.decisions.length} open decisions (${m.counts.items} items). Push ${out} with ArtifactData set (collection meta, doc lookahead).`);
