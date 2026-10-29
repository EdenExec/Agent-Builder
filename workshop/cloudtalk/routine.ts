// Q's scheduled bots, compiled like Radar's (workshop/core/radar.ts) so the prompt that runs at night is version-controlled.
//   npm run ct-routine -- compile      write employees/q/routines/<id>.md
//   npm run ct-routine -- deploy       print the trigger payload (Kev creates the trigger; agent-made triggers carry no connectors)
//   npm run ct-routine -- show <id>
import "../lib/env.ts";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { loadEmployee, type Employee } from "../core/employee.ts";
import { validateRoutines, deployPlan, type RoutineSpec, type RoutinesFile } from "../core/radar.ts";

export type QRoutineSpec = RoutineSpec & { connectors: string[] };
export type QRoutinesFile = Omit<RoutinesFile, "routines"> & { routines: QRoutineSpec[] };

const REPO = "https://github.com/EdenExec/Agent-Builder";
const Q_DIR = "employees/q";
const RADAR_DIR = "employees/radar";
/** What the connectors are called in a routine's trigger and what the nightly run cannot work without. */
const REQUIRED_CONNECTORS = ["gmail", "cloudtalk"];

export function loadQRoutines(dir = Q_DIR): QRoutinesFile {
  const path = join(dir, "routines.yaml");
  if (!existsSync(path)) throw new Error(`${path} not found`);
  const file = parse(readFileSync(path, "utf8")) as QRoutinesFile;
  const problems = validateQRoutines(file);
  if (problems.length) throw new Error(`${path}:\n  - ${problems.join("\n  - ")}`);
  return file;
}

export function validateQRoutines(file: any): string[] {
  const p = validateRoutines(file);
  for (const r of file?.routines ?? []) {
    for (const c of REQUIRED_CONNECTORS) if (!r?.connectors?.includes(c)) p.push(`${r?.id}: connector "${c}" must be listed (the run cannot work without it)`);
  }
  return p;
}

function section(title: string, body: string): string {
  return `\n\n==================== ${title} ====================\n\n${body.trim()}\n`;
}

export function compileQRoutine(q: Employee, radar: Employee, file: QRoutinesFile, r: QRoutineSpec): string {
  const find = (name: string) => {
    const s = q.skills.find((x) => x.name === name) ?? radar.skills.find((x) => x.name === name);
    if (!s) throw new Error(`${r.id}: skill "${name}" is in neither employees/q nor employees/radar`);
    return { ...s, owner: q.skills.includes(s) ? "q" : "radar" };
  };
  const skills = r.skills.map(find);
  const primary = skills.filter((s) => s.owner === "q").at(-1)!;
  const head = `You are Radar, Kev Williams' chief of staff, running a playbook written by Q (employee "q", back-of-house software engineer) in the Agent-Builder workshop. This is the routine "${r.name}" (id ${r.id}), firing on schedule "${r.cron}". Pacific time. Fresh session, no memory: research live and never fabricate.

CONNECTORS. This routine needs: ${r.connectors.join(", ")} (Kev's Gmail or Superhuman Mail, and CloudTalk), plus the CRELATE_API_KEY secret for read-only curl. If a required connector is missing, stop and say exactly which one in one line. Do not substitute another tool.

STEP 0, READ THE LIVE FILES. The authoritative version of everything below lives in the repository ${REPO} (branch ${file.branch}). Do this first:
1. If employees/q/ and employees/radar/ exist in the working directory, read ${skills.map((s) => `employees/${s.owner}/skills/${s.name}.md`).join(", ")} from there, plus employees/q/memory/live/. They override the embedded copies below.
2. Otherwise run: git clone --depth 1 --branch ${file.branch} ${REPO} /tmp/agent-builder, then read the same files from /tmp/agent-builder. The lead tool is run with: cd /tmp/agent-builder && npm ci && npm run leadplan -- <sheets> (Node 22.18 or newer).
3. If both fail, the embedded copies below are authoritative, and the lead tool cannot run: say so and stop.
THE SABBATH is Friday sunset to Saturday sunset. After step 0 run \`node workshop/office/sabbath.ts\` in the repo (exit 0 = inside it; no repo: judge Vancouver, WA sunset, Boise, ID from 6 Nov 2026). Inside it, stop with one line and load nothing: the Friday night run waits for Monday.

Then do exactly what the playbook "${primary.name}" says, honouring every standing rule. The default mode is DRY RUN: nothing is created in CloudTalk unless a QC item Kev approved covers it. Close with a short plain summary of what you did, what you created, and anything you could not do.`;
  let out = head;
  out += section("PERSONA (employees/radar/persona.md)", radar.persona);
  out += section("BRAND STANDARD (employees/_shared/eden-brand.md)", radar.brand.replace(/^# .*\n+/, ""));
  for (const s of skills) out += section(`PLAYBOOK: ${s.name} (employees/${s.owner}/skills/${s.name}.md)`, s.body);
  for (const name of r.seeds) {
    const s = q.seeds.find((x) => x.name === name);
    if (!s) throw new Error(`${r.id}: seed "${name}" is not in employees/q/memory/seed/`);
    out += section(`SEED MEMORY: ${name} (employees/q/memory/seed/${name}.md)`, readFileSync(s.path, "utf8"));
  }
  return out;
}

export function compileAllQ(): { file: QRoutinesFile; prompts: Record<string, string> } {
  const q = loadEmployee(Q_DIR);
  const radar = loadEmployee(RADAR_DIR);
  const file = loadQRoutines();
  const prompts: Record<string, string> = {};
  for (const r of file.routines) prompts[r.id] = compileQRoutine(q, radar, file, r);
  return { file, prompts };
}

if (process.argv[1]?.endsWith("routine.ts")) {
  const OUT = join(Q_DIR, "routines");
  const [cmd = "deploy", arg] = process.argv.slice(2);
  const { file, prompts } = compileAllQ();
  if (cmd === "compile") {
    mkdirSync(OUT, { recursive: true });
    for (const [id, text] of Object.entries(prompts)) {
      writeFileSync(join(OUT, `${id}.md`), text);
      console.log(`wrote ${join(OUT, `${id}.md`)} (${text.length} chars)`);
    }
  } else if (cmd === "deploy") {
    const plan = deployPlan(file, OUT, prompts).map((t, i) => ({ ...t, connectors_required: file.routines[i]!.connectors }));
    console.log(JSON.stringify(plan, null, 2));
  } else if (cmd === "show") {
    if (!arg || !prompts[arg]) { console.error(`routine "${arg}" not found; known: ${Object.keys(prompts).join(", ")}`); process.exit(1); }
    console.log(prompts[arg]);
  } else {
    console.error(`Unknown command "${cmd}". Use compile, deploy or show <id>.`);
    process.exit(1);
  }
}
