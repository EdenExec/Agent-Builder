// Eden Office status feed. Builds the documents the Office artifact reads from repo state, ready for one ArtifactData batch.
// npm run office -- sync --dry                       print the JSON (nothing is written anywhere)
// npm run office -- sync [--out .office-outbox]      write batch-<n>.json files (each {"writes":[...]}, at most 50) for Radar to push
//   optional inputs Radar gathers in a connector session, each a JSON file:
//   --ledger rows.json     [{id,item,owner,lane,due,status,url}]   from the saved view "Radar · All open"
//   --inbox replies.json   [{agent?,title,from?,why?,rank?,kind?,raisedAt,url?,draft?,preview?}]  replies Kev owes, ranked by Jenny (preview = her draft reply)
//   --calls missed.json    [{who,company?,at,returned?}]           ranked missed calls (no phone numbers)
//   --runs runs.json       [{routine,agent?,lastRunAt?,ok,note?}]  last result of each routine
//   --tickets tickets.json [{id,agent,status,pickedAt?,priority?}] ArtifactData query of the tickets collection
//   --seen seen.json       {"open-hub":"2026-10-21T..."}            the seen collection, id -> at
//   --activity act.json    {"hub":"2026-10-20T..."}                 last time Radar saw each tool used
//   --existing ex.json     {"agents/radar":{"version":3,"data":{...}}}  ArtifactData list results, so writes carry if_version and resolved alerts are deleted
//   --now ISO              pretend it is this time (tests)
// Reads only. Never talks to Crelate, Notion, Gmail or the artifact.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { parse } from "yaml";
import { list as listQc } from "../core/qc.ts";
import { list as listGates } from "../core/numbers-gate.ts";
import { buildFeed, chunk, planWrites, type AgentLite, type NowFile, type RoutineLite, type SyncInput, type Tool } from "../core/office.ts";

const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = new Map<string, string>();
for (let i = 1; i < argv.length; i++) {
  const a = argv[i]!;
  if (a.startsWith("--")) {
    const n = argv[i + 1];
    if (n === undefined || n.startsWith("--")) flags.set(a.slice(2), "true");
    else { flags.set(a.slice(2), n); i++; }
  }
}
const json = <T>(flag: string): T | undefined => (flags.has(flag) ? (JSON.parse(readFileSync(flags.get(flag)!, "utf8")) as T) : undefined);

function loadAgents(): { agents: AgentLite[]; routines: RoutineLite[]; nowFiles: Record<string, NowFile>; heard: Record<string, string> } {
  const agents: AgentLite[] = [], routines: RoutineLite[] = [], nowFiles: Record<string, NowFile> = {}, heard: Record<string, string> = {};
  for (const id of readdirSync("employees").sort()) {
    const dir = join("employees", id);
    if (id.startsWith("_") || !existsSync(join(dir, "agent.yaml"))) continue;
    const spec = parse(readFileSync(join(dir, "agent.yaml"), "utf8")) as { id: string; name: string; title?: string };
    agents.push({ id: spec.id, name: spec.name, title: spec.title });
    if (existsSync(join(dir, "routines.yaml"))) {
      const f = parse(readFileSync(join(dir, "routines.yaml"), "utf8")) as { routines?: { id: string; name: string; trigger_id: string | null; cron?: string }[] };
      for (const r of f.routines ?? []) routines.push({ id: r.id, name: r.name, agent: spec.id, trigger_id: r.trigger_id ?? null, cron: r.cron });
    }
    const nf = join(dir, "memory", "live", "now.json");
    if (existsSync(nf)) { try { nowFiles[spec.id] = JSON.parse(readFileSync(nf, "utf8")) as NowFile; } catch { /* a broken now.json counts as no status */ } }
    if (!flags.has("no-git")) {
      try {
        const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", dir], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        if (iso) heard[spec.id] = new Date(iso).toISOString();
      } catch { /* not a git checkout: no heartbeat from git */ }
    }
  }
  return { agents, routines, nowFiles, heard };
}

try {
  if (cmd !== "sync") throw new Error("Usage: office sync [--dry] [--out dir] [--ledger f] [--inbox f] [--calls f] [--runs f] [--tickets f] [--seen f] [--activity f] [--existing f] [--now ISO]");
  const { agents, routines, nowFiles, heard } = loadAgents();
  const input: SyncInput = {
    now: flags.has("now") ? new Date(flags.get("now")!) : new Date(),
    agents, routines, nowFiles, heard,
    qc: listQc("qc"), gates: listGates("gates"),
    ledger: json("ledger"), inbox: json("inbox"), calls: json("calls"), runs: json("runs"), tickets: json("tickets"),
  };
  const toolsFile = "projects/virtual-office/tools.json";
  const tools = existsSync(toolsFile) ? (JSON.parse(readFileSync(toolsFile, "utf8")) as Tool[]) : [];
  const feed = buildFeed(input, tools, json("seen") ?? {}, json("activity") ?? {});
  const ops = planWrites(feed.docs, json("existing") ?? {});
  const batches = chunk(ops, 50);
  if (flags.has("dry")) {
    console.log(JSON.stringify({ syncedAt: input.now.toISOString(), skipped: feed.skipped, docs: feed.docs, writes: ops.length, batches: batches.length }, null, 2));
  } else {
    const out = flags.get("out") ?? ".office-outbox";
    mkdirSync(out, { recursive: true });
    batches.forEach((b, i) => writeFileSync(join(out, `batch-${i + 1}.json`), JSON.stringify({ writes: b }, null, 2) + "\n"));
    console.log(`${ops.length} write(s) in ${batches.length} batch file(s) in ${out}/. Push each with ArtifactData action "batch" (url from projects/virtual-office/artifact.json once published).`);
    if (feed.skipped.length) console.log(`Not included this run: ${feed.skipped.join("; ")}`);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
