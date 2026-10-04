// npm run board -- make --slug living-courtyard --title "Living and courtyard" --theme "Quiet timber living" \
//     --queries "timber living room warm|courtyard house idaho|oak ceiling beams" [--audience family|public] \
//     [--avoid "chrome,neon"] [--target 16] [--orientation landscape] [--providers openverse,pexels] [--project "Lakeside"] [--no-embed]
// npm run board -- build deliverables/boards/<slug>/board.json      (re-render after editing notes or removing tiles)
// npm run board -- feedback deliverables/boards/<slug>/board.json <feedback.json | ->   (record pins and rejections)
import "../lib/env.ts";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { makeBoard, rebuildBoard, loadSpec, SLUG } from "../boards/make.ts";
import { applyFeedback, loadExcluded, parseFeedback } from "../boards/feedback.ts";
import { loadEmployee } from "../core/employee.ts";
import type { ProviderName } from "../sources/index.ts";
import type { Orientation } from "../sources/types.ts";

const EMPLOYEE = "employees/housing-architect";
const OUT = "deliverables/boards";
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = new Map<string, string>();
const pos: string[] = [];
for (let i = 1; i < argv.length; i++) {
  const a = argv[i]!;
  if (a.startsWith("--")) {
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) flags.set(a.slice(2), "true");
    else { flags.set(a.slice(2), next); i++; }
  } else pos.push(a);
}
const kb = (n: number) => `${Math.round(n / 1024).toLocaleString("en-US")} KB`;

async function main() {
  if (cmd === "make") {
    const need = (k: string) => { const v = flags.get(k); if (!v || v === "true") throw new Error(`--${k} is required`); return v; };
    const slug = need("slug");
    if (!SLUG.test(slug)) throw new Error("--slug must be lowercase letters, digits and dashes");
    const audience = (flags.get("audience") ?? "family") as "family" | "public";
    if (audience !== "family" && audience !== "public") throw new Error("--audience must be family or public");
    loadEmployee(EMPLOYEE); // fail early if the employee is broken
    const exclude = loadExcluded(EMPLOYEE);
    const r = await makeBoard({
      slug, title: need("title"), theme: flags.get("theme") ?? need("title"),
      queries: need("queries").split("|"), audience,
      avoid: (flags.get("avoid") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      exclude, project: flags.get("project"),
      target: flags.has("target") ? Number(flags.get("target")) : undefined,
      orientation: flags.get("orientation") as Orientation | undefined,
      providers: flags.get("providers")?.split(",").map((s) => s.trim()) as ProviderName[] | undefined,
      embed: !flags.has("no-embed"), outRoot: OUT,
    });
    console.log(`Board: ${r.htmlPath} (${kb(r.bytes)}, ${r.spec.tiles.length} tiles)`);
    console.log(`Page:  ${r.pagePath}  (publish this with the Artifact tool, capabilities {"db":{}}, so feedback needs no copy-paste)`);
    console.log(`Spec:  ${r.specPath}  (edit the "note" on each tile, then: npm run board -- build ${r.specPath})`);
    console.log(`Excluded from memory: ${exclude.size} previously rejected image(s) skipped.`);
    const reasons = new Map<string, number>();
    for (const d of r.dropped) reasons.set(d.reason.replace(/\(.*\)/, "").trim(), (reasons.get(d.reason.replace(/\(.*\)/, "").trim()) ?? 0) + 1);
    if (reasons.size) console.log(`Dropped ${r.dropped.length}: ${[...reasons].map(([k, v]) => `${v} ${k}`).join(", ")}`);
    if (r.embedFailures.length) console.log(`Could not embed ${r.embedFailures.length} (removed): ${r.embedFailures.slice(0, 3).map((f) => `${f.id} ${f.error}`).join("; ")}`);
    for (const e of r.searchErrors) console.log(`! ${e.provider}: ${e.message}`);
    if (r.unsplashPinged) console.log(`Unsplash download pings sent: ${r.unsplashPinged}`);
    if (r.bytes > 12 * 1024 * 1024) console.log("! Board is over 12 MB. Lower --target or filter tiles before sharing.");
  } else if (cmd === "build") {
    const path = pos[0]; if (!path) throw new Error("Usage: board build <board.json>");
    const r = await rebuildBoard(path, dirname(dirname(path)), { embed: !flags.has("no-embed") });
    console.log(`Rebuilt ${r.htmlPath} (${kb(r.bytes)}, ${r.spec.tiles.length} tiles)`);
    for (const f of r.failures) console.log(`! removed ${f.id}: ${f.error}`);
  } else if (cmd === "feedback") {
    const [path, src] = pos; if (!path || !src) throw new Error("Usage: board feedback <board.json> <feedback.json | ->");
    const spec = loadSpec(path);
    const fb = parseFeedback(src === "-" ? readFileSync(0, "utf8") : readFileSync(src, "utf8"));
    const a = applyFeedback(EMPLOYEE, spec, fb);
    console.log(`Saved to memory: ${a.pinned} pinned, ${a.rejected} rejected${fb.comment ? ", 1 comment" : ""}.`);
    if (a.noReason) console.log(`${a.noReason} rejection(s) have no reason. Ask the client why; reasons are what teach taste.`);
    if (a.unknown.length) console.log(`Ignored unknown tile ids: ${a.unknown.join(", ")}`);
  } else {
    throw new Error("Usage: board make | build | feedback  (see the header of workshop/office/board.ts)");
  }
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1; });
