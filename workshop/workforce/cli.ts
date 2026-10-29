// node workshop/workforce/cli.ts [--out projects/workforce/board/current.json] [--rev-csv rev-report.csv]
//        [--now 2026-10-16T18:59:00Z]   (pretend it is then; for checking against an earlier pull)
//        [--hub-billings 1069928 --hub-pct 45.53 --hub-to-goal 1280072 --hub-as-of 2026-10-16]
//
// Read-only. Pulls this week (Sunday to now, Pacific) and last week from Crelate and writes the Round Table board
// document. Prints counts only: never a candidate name, a phone number or the API key.
import "../lib/env.ts";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { makeClient, runBoard, type HubFigures } from "./recruiting-board.ts";

const flag: Record<string, string> = {};
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const a = args[i]!;
  if (!a.startsWith("--")) { console.error(`unexpected argument ${a}`); process.exit(1); }
  const v = args[i + 1];
  if (v === undefined || v.startsWith("--")) { console.error(`${a} needs a value`); process.exit(1); }
  flag[a.slice(2)] = v; i++;
}
const key = process.env.CRELATE_API_KEY;
if (!key) { console.error("CRELATE_API_KEY is not set in this environment."); process.exit(1); }

let hub: HubFigures | undefined;
if (flag["hub-billings"] !== undefined) {
  hub = {
    billings_ytd: Number(flag["hub-billings"]),
    pct_to_goal: flag["hub-pct"] !== undefined ? Number(flag["hub-pct"]) : undefined,
    to_goal: flag["hub-to-goal"] !== undefined ? Number(flag["hub-to-goal"]) : undefined,
    as_of: flag["hub-as-of"] ?? "unknown",
    source: "Hub sheet, The Hub tab, Annual Billings",
  };
  if (!Number.isFinite(hub.billings_ytd)) { console.error("--hub-billings must be a number"); process.exit(1); }
}
const revCsv = flag["rev-csv"] ? readFileSync(flag["rev-csv"], "utf8") : undefined;
const nowMs = flag.now ? Date.parse(flag.now) : undefined;
if (flag.now && !Number.isFinite(nowMs)) { console.error("--now must be an ISO time"); process.exit(1); }
const out = flag.out ?? "projects/workforce/board/current.json";

try {
  const board = await runBoard({ client: makeClient(key), hub, revCsv, nowMs });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(board, null, 2) + "\n");
  const t = board.team.this;
  console.log(`Board written to ${out}`);
  console.log(`As of ${board.as_of} · ${board.week.label} · ${board.goals.recruiters_counted} recruiters counted, ${board.goals.recruiters_in_goal} in the goal`);
  console.log(`Team this week: RPs ${t.rps} (goal ${board.goals.rps_team_week}), MPs ${t.mps}, resumes ${t.resumes}, PTCs ${t.ptcs}, submittals ${t.subs}, FTIs ${t.ftis}, offers ${t.offers}`);
  console.log(`Active JOs with activity: ${board.jos.length} of ${board.jos_meta.active_total}`);
  console.log(`Revenue: hub ${board.revenue.hub.status}; per recruiter ${board.revenue.recruiters.status}`);
  for (const n of board.notes) console.log(`Note: ${n}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : "board run failed");
  process.exit(1);
}
