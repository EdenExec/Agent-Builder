// Stamp out a recruiter's desk. Writes files only; never publishes, shares, sends or touches a live system.
// npm run recruiter-desk -- new <slug> --name "Kyle Cockell" --start 2026-11-02 [--office Boise] [--track accelerated|standard|established] [--hub-name Kyle] [--out projects/recruiter-desk/desks] [--force]
// npm run recruiter-desk -- new --all [--roster projects/recruiter-desk/roster.json]     stamp every roster entry that has no desk yet
// npm run recruiter-desk -- sync <slug> --jobs hub-jobs.json [--now ISO]                  filter a Hub `jobs` export down to this recruiter's JOs and write outbox/batch-1.json
// npm run recruiter-desk -- check [<slug>]                                                 privacy scan of the template and each stamped desk (exit 1 on a hit)
// npm run recruiter-desk -- list                                                           the desks stamped so far
// Per desk, under <out>/<slug>/: desk.json (config), desk.html (the page), seed.json (ArtifactData batch), setup.md (Dean's checklist rows).
// Radar publishes desk.html as a private artifact and pushes seed.json and outbox/batch-1.json with ArtifactData; both are gated steps.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildConfig, checklistRows, jobWrites, jobsForRecruiter, readConfigFrom, renderDesk, scanForbidden, seedWrites, type DeskConfig, type HubJob, type Track,
} from "../core/recruiter-desk.ts";

const ROOT = "projects/recruiter-desk";
const TEMPLATE = join(ROOT, "draft", "recruiter-desk.html");
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = new Map<string, string>();
const pos: string[] = [];
for (let i = 1; i < argv.length; i++) {
  const a = argv[i]!;
  if (a.startsWith("--")) {
    const n = argv[i + 1];
    if (n === undefined || n.startsWith("--")) flags.set(a.slice(2), "true");
    else { flags.set(a.slice(2), n); i++; }
  } else pos.push(a);
}
const out = flags.get("out") ?? join(ROOT, "desks");
const nowIso = () => flags.get("now") ?? new Date().toISOString();

function stamp(input: { slug: string; name: string; start: string; office?: string; track?: Track; hubName?: string }) {
  const dir = join(out, input.slug);
  if (existsSync(join(dir, "desk.json")) && !flags.has("force")) throw new Error(`${dir} already has a desk. Use --force to restamp it (the config is rebuilt; nothing published is touched).`);
  const cfg = buildConfig({ ...input, today: nowIso().slice(0, 10) });
  const html = renderDesk(readFileSync(TEMPLATE, "utf8"), cfg);
  const hits = scanForbidden(html);
  if (hits.length) throw new Error(`Template failed the privacy scan: ${[...new Set(hits)].join(", ")}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "desk.json"), JSON.stringify(cfg, null, 2) + "\n");
  writeFileSync(join(dir, "desk.html"), html);
  writeFileSync(join(dir, "seed.json"), JSON.stringify({ writes: seedWrites(cfg, nowIso()) }, null, 2) + "\n");
  const rows = checklistRows(cfg);
  writeFileSync(join(dir, "setup.md"), [`# ${cfg.name}: desk setup (stamped ${cfg.stampedOn}, template ${cfg.template})`, "", "| # | Step | Who | Kind |", "|---|---|---|---|", ...rows.map((r, n) => `| ${n + 1} | ${r.step} | ${r.who} | ${r.kind} |`), ""].join("\n"));
  console.log(`Stamped ${cfg.name} (${cfg.track}, start ${cfg.startDate}) -> ${dir}/\n  desk.html   the page; Radar publishes it as a private artifact (a gated step)\n  seed.json   ArtifactData batch: profile and training\n  setup.md    the checklist rows for Dean\nNothing was published, shared or sent.`);
}

try {
  if (cmd === "new") {
    if (flags.has("all")) {
      const rosterFile = flags.get("roster") ?? join(ROOT, "roster.json");
      const roster = JSON.parse(readFileSync(rosterFile, "utf8")) as { slug: string; name: string; start: string; office?: string; track?: Track; hubName?: string }[];
      let made = 0;
      for (const r of roster) {
        if (existsSync(join(out, r.slug, "desk.json")) && !flags.has("force")) { console.log(`Skipped ${r.slug}: already stamped.`); continue; }
        stamp(r); made++;
      }
      console.log(`${made} desk(s) stamped from ${rosterFile}.`);
    } else {
      const slug = pos[0];
      if (!slug || !flags.get("name") || !flags.get("start")) throw new Error('Usage: recruiter-desk new <slug> --name "First Last" --start YYYY-MM-DD [--office Boise] [--track accelerated] [--hub-name Kyle]');
      stamp({ slug, name: flags.get("name")!, start: flags.get("start")!, office: flags.get("office"), track: flags.get("track") as Track | undefined, hubName: flags.get("hub-name") });
    }
  } else if (cmd === "sync") {
    const slug = pos[0];
    if (!slug || !flags.has("jobs")) throw new Error("Usage: recruiter-desk sync <slug> --jobs hub-jobs.json   (a JSON array of Hub `jobs` documents, from ArtifactData)");
    const cfg = JSON.parse(readFileSync(join(out, slug, "desk.json"), "utf8")) as DeskConfig;
    const raw = JSON.parse(readFileSync(flags.get("jobs")!, "utf8")) as HubJob[] | Record<string, { data?: HubJob } & HubJob>;
    const hub: HubJob[] = Array.isArray(raw) ? raw : Object.entries(raw).map(([id, v]) => ({ id, ...((v as { data?: HubJob }).data ?? v) }));
    const jobs = jobsForRecruiter(hub, cfg.hubName);
    const writes = jobWrites(jobs, nowIso());
    const hits = scanForbidden(JSON.stringify(writes));
    if (hits.length) throw new Error(`Jobs for ${cfg.first} failed the privacy scan: ${[...new Set(hits)].join(", ")}. Nothing written.`);
    mkdirSync(join(out, slug, "outbox"), { recursive: true });
    writeFileSync(join(out, slug, "outbox", "batch-1.json"), JSON.stringify({ writes: writes.slice(0, 50) }, null, 2) + "\n");
    console.log(`${cfg.first}: ${jobs.length} of ${hub.length} Hub jobs are theirs -> ${join(out, slug, "outbox", "batch-1.json")}\nPush with one ArtifactData batch on ${cfg.first}'s desk. Jobs they are not on never enter this file.`);
  } else if (cmd === "check") {
    const targets: [string, string][] = [["template", TEMPLATE]];
    for (const d of existsSync(out) ? readdirSync(out) : []) if ((!pos[0] || pos[0] === d) && existsSync(join(out, d, "desk.html"))) targets.push([d, join(out, d, "desk.html")]);
    let bad = 0;
    for (const [label, file] of targets) {
      const html = readFileSync(file, "utf8");
      const hits = [...new Set(scanForbidden(html))];
      let note = "";
      if (label !== "template") { try { const c = readConfigFrom(html); note = ` (${c.name}, ${c.track}, start ${c.startDate})`; } catch { hits.push("config marker unreadable"); } }
      if (hits.length) bad++;
      console.log(`${hits.length ? "FAIL" : "ok  "} ${label}${note}${hits.length ? ": " + hits.join(", ") : ""}`);
    }
    if (bad) process.exitCode = 1;
  } else if (cmd === "list") {
    if (!existsSync(out)) console.log("No desks yet.");
    else for (const d of readdirSync(out)) {
      const f = join(out, d, "desk.json"); if (!existsSync(f)) continue;
      const c = JSON.parse(readFileSync(f, "utf8")) as DeskConfig;
      console.log(`${c.slug.padEnd(10)} ${c.name.padEnd(20)} ${c.track.padEnd(12)} start ${c.startDate}  ${c.office}`);
    }
  } else {
    console.log("Usage: recruiter-desk new <slug> | new --all | sync <slug> --jobs file | check [slug] | list");
  }
} catch (e) {
  console.error(`Error: ${(e as Error).message}`);
  process.exitCode = 1;
}
