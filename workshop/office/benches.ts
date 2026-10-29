// Reads the sources behind the Command Center benches (see projects/virtual-office/bench-sources.json) and builds their documents.
// The I/O half of workshop/core/benches.ts. Used by `npm run office -- sync` (so `npm run office-prep -- run` refreshes the benches
// every hour); also runnable alone to look at what would be written:
//   npm run benches -- [--jobs jobs.json] [--board board.json] [--ledger rows.json] [--now ISO] [--crelate-out meta-crelate.json]
//     prints the bench documents (and meta/crelate, the recruiter leaderboard's counts); --crelate-out also saves meta/crelate as a file for one ArtifactData set
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildBenches, type BenchInputs, type JobLite, type LeadSheet, type BoardLite } from "../core/benches.ts";
import type { LedgerRow } from "../core/office.ts";

export const PATHS = {
  leadIndex: "projects/leads/index.json",
  board: "projects/workforce/board/current.json",
  workforce: "projects/workforce",
  university: "projects/workforce/eden-university",
  schedule: "projects/eden-staffing/schedule.md",
};

/** When a file last changed in git (the data's age for a file source); falls back to the file's own mtime. */
export function fileAsOf(path: string, root = "."): string {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", path], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (iso) return new Date(iso).toISOString();
  } catch { /* not a git checkout */ }
  return statSync(join(root, path)).mtime.toISOString();
}
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;

export type LoadOpts = {
  now: Date; root?: string;
  jobsFile?: string; jobsReadAt?: Date;
  boardFile?: string;          // a fresh read-only Crelate pull; absent = the Round Table board file in the repo
  ledgerFile?: string;
};

/** ArtifactData rows come either flat or as {doc_id, data}; accept both. */
const flat = <T>(rows: unknown[]): T[] => rows.map((r) => { const x = r as { doc_id?: string; id?: string; data?: object }; return (x && typeof x.data === "object" && x.data ? { id: x.doc_id ?? x.id, ...x.data } : r) as T; });

export function loadBenchInputs(o: LoadOpts): BenchInputs {
  const root = o.root ?? ".", at = (p: string) => join(root, p);
  const inputs: BenchInputs = { now: o.now };

  if (o.jobsFile) {
    inputs.jobs = flat<JobLite>(readJson<unknown[]>(o.jobsFile));
    inputs.jobsReadAt = o.jobsReadAt ?? new Date(statSync(o.jobsFile).mtime);
  }
  if (existsSync(at(PATHS.leadIndex))) inputs.leadSheets = (readJson<{ sheets?: LeadSheet[] }>(at(PATHS.leadIndex)).sheets) ?? [];

  const boardPath = o.boardFile ?? at(PATHS.board);
  if (existsSync(boardPath)) { inputs.board = readJson<BoardLite>(boardPath); inputs.boardLive = !!o.boardFile; }

  // New-hire 30-day plans: pre-start plans and anything under new-hires/.
  const wf = at(PATHS.workforce);
  if (existsSync(wf)) {
    const plans = readdirSync(wf).filter((n) => /prestart.*\.md$/i.test(n)).map((n) => join(PATHS.workforce, n));
    const nh = join(wf, "new-hires");
    if (existsSync(nh)) plans.push(...readdirSync(nh).filter((n) => /\.md$/i.test(n)).map((n) => join(PATHS.workforce, "new-hires", n)));
    // A count of plan files is as current as the folder: its newest commit, not the age of any one stable plan.
    inputs.planFiles = { count: plans.length, asOf: fileAsOf(PATHS.workforce, root) };
  }
  if (existsSync(at(PATHS.university))) {
    inputs.universityFiles = readdirSync(at(PATHS.university)).map((name) => ({ name, asOf: fileAsOf(join(PATHS.university, name), root) }));
  }
  if (existsSync(at(PATHS.schedule))) inputs.schedule = { md: readFileSync(at(PATHS.schedule), "utf8"), asOf: fileAsOf(PATHS.schedule, root) };

  if (o.ledgerFile) {
    inputs.ledger = flat<LedgerRow>(readJson<unknown[]>(o.ledgerFile));
    inputs.ledgerAsOf = new Date(statSync(o.ledgerFile).mtime);
  }
  return inputs;
}

// ---- stand-alone: print what would be written ----
if (process.argv[1]?.endsWith("benches.ts")) {
  const flags = new Map<string, string>();
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) if (a[i]?.startsWith("--")) flags.set(a[i]!.slice(2), a[i + 1] ?? "");
  const now = flags.has("now") ? new Date(flags.get("now")!) : new Date();
  const { docs, skipped, crelate } = buildBenches(loadBenchInputs({ now, jobsFile: flags.get("jobs"), boardFile: flags.get("board"), ledgerFile: flags.get("ledger") }));
  if (flags.has("crelate-out")) {
    if (!crelate) { console.error("No board, so no meta/crelate to save."); process.exit(1); }
    writeFileSync(flags.get("crelate-out")!, JSON.stringify(crelate) + "\n");
  }
  console.log(JSON.stringify({ docs, skipped, "meta/crelate": crelate }, null, 2));
}
