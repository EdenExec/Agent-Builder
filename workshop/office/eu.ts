// Eden University loader. Reads projects/eden-university/<track-id>/track.json (Dean's files) and builds the database writes for `tracks/{id}`.
// It writes local files only. Radar applies the batch with ArtifactData once Kev has published the page; that write is a gated step.
//   npm run eu -- check [--from projects/eden-university]     validate every track.json, print errors and warnings (exit 1 on an error)
//   npm run eu -- list  [--from ...]                          one line per track: id, title, modules, minutes
//   npm run eu -- load  [--from ...] [--out DIR] [--dry]      validate, then write DIR/tracks/<id>.json and DIR/tracks-batch.json
// Default out: projects/eden-university/site/load (not committed). Re-loading a track that already exists in the database needs its
// current `version` as if_version on that write: read tracks/<id> first, then add "if_version" to the batch entry.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { batchFor, checkTrack, trackDoc, type Track } from "../core/eden-university.ts";

const argv = process.argv.slice(2);
const cmd = argv[0] ?? "help";
const flags = new Map<string, string>();
for (let i = 1; i < argv.length; i++) {
  const a = argv[i]!;
  if (!a.startsWith("--")) continue;
  const n = argv[i + 1];
  if (n === undefined || n.startsWith("--")) flags.set(a.slice(2), "true");
  else { flags.set(a.slice(2), n); i++; }
}
const from = resolve(flags.get("from") ?? "projects/eden-university");
const out = resolve(flags.get("out") ?? "projects/eden-university/site/load");

interface Found { dir: string; file: string; track?: Track; errors: string[]; warnings: string[] }
function scan(): Found[] {
  if (!existsSync(from)) throw new Error(`${from} does not exist`);
  const found: Found[] = [];
  for (const d of readdirSync(from, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    const file = join(from, d, "track.json");
    if (!existsSync(file)) continue; // folders like stand-up-your-desk and site hold no track
    let raw: unknown;
    try { raw = JSON.parse(readFileSync(file, "utf8")); } catch (e) { found.push({ dir: d, file, errors: [`not valid JSON: ${(e as Error).message}`], warnings: [] }); continue; }
    const c = checkTrack(raw, d);
    found.push({ dir: d, file, track: c.errors.length ? undefined : (raw as Track), ...c });
  }
  return found;
}

function report(found: Found[]): number {
  let bad = 0;
  for (const f of found) {
    const tag = f.errors.length ? "ERROR" : f.warnings.length ? "warn " : "ok   ";
    console.log(`${tag} ${f.dir}${f.track ? `  (${f.track.modules.length} modules)` : ""}`);
    f.errors.forEach((e) => console.log(`        error: ${e}`));
    f.warnings.forEach((w) => console.log(`        warning: ${w}`));
    if (f.errors.length) bad++;
  }
  if (!found.length) console.log(`No track.json found under ${from}. Nothing to load yet.`);
  return bad;
}

if (cmd === "check") {
  process.exit(report(scan()) ? 1 : 0);
} else if (cmd === "list") {
  for (const f of scan()) if (f.track) console.log(`${f.track.id}\t${f.track.title}\t${f.track.modules.length} modules\t${f.track.modules.reduce((a, m) => a + m.minutes, 0)} min`);
} else if (cmd === "load") {
  const found = scan();
  const bad = report(found);
  const good = found.filter((f) => f.track);
  if (!good.length) { console.log("Nothing valid to write."); process.exit(bad ? 1 : 0); }
  const loadedAt = new Date().toISOString();
  const entries: { id: string; file: string }[] = [];
  if (!flags.has("dry")) mkdirSync(join(out, "tracks"), { recursive: true });
  for (const f of good) {
    const doc = trackDoc(f.track!, `projects/eden-university/${f.dir}/track.json`, loadedAt);
    const file = join(out, "tracks", `${f.track!.id}.json`);
    entries.push({ id: f.track!.id, file });
    if (!flags.has("dry")) writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
  }
  const batch = batchFor(entries);
  if (!flags.has("dry")) writeFileSync(join(out, "tracks-batch.json"), JSON.stringify(batch, null, 2) + "\n");
  console.log(`\n${flags.has("dry") ? "Dry run: would write" : "Wrote"} ${entries.length} track document(s) for tracks/{id}${flags.has("dry") ? "" : ` and ${join(out, "tracks-batch.json")}`}.`);
  console.log("Next (gated): publish the page, then Radar applies the batch with ArtifactData action=batch, writes = the file's `writes`.");
  process.exit(bad ? 1 : 0);
} else {
  console.log("npm run eu -- check|list|load [--from DIR] [--out DIR] [--dry]");
}
