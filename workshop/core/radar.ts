// Radar's routines are compiled from the employee folder, so the prompts that run on a schedule are version-controlled.
// A routine fires in a fresh session: the prompt tells it to read the live repo files when present, clone them if it
// can, and fall back to the embedded copy. Everything a run needs is therefore in the prompt itself.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { loadEmployee, type Employee } from "./employee.ts";

export type RoutineSpec = {
  id: string;
  name: string;
  trigger_id: string | null;
  cron: string;
  model: string;
  skills: string[];
  seeds: string[];
  notify: "push" | "none";
};
export type RoutinesFile = { branch: string; routines: RoutineSpec[] };

const REPO = "https://github.com/EdenExec/Agent-Builder";
const SABBATH_IDS = new Set(["brief", "sweep", "check-out", "stand-up", "week-review"]);

export function loadRoutines(employeeDir: string): RoutinesFile {
  const path = join(employeeDir, "routines.yaml");
  if (!existsSync(path)) throw new Error(`${path} not found`);
  const file = parse(readFileSync(path, "utf8")) as RoutinesFile;
  const problems = validateRoutines(file);
  if (problems.length) throw new Error(`routines.yaml:\n  - ${problems.join("\n  - ")}`);
  return file;
}

export function validateRoutines(file: any): string[] {
  const p: string[] = [];
  if (typeof file?.branch !== "string" || !file.branch) p.push("branch is required");
  if (!Array.isArray(file?.routines) || file.routines.length === 0) p.push("routines must be a non-empty list");
  const ids = new Set<string>();
  for (const r of file?.routines ?? []) {
    if (!/^[a-z][a-z0-9-]*$/.test(r?.id ?? "")) p.push(`routine id "${r?.id}" must be kebab-case`);
    if (ids.has(r?.id)) p.push(`duplicate routine id "${r.id}"`);
    ids.add(r?.id);
    if (!r?.name) p.push(`${r?.id}: name is required`);
    if (!/^(CRON_TZ=\S+ )?(\S+ ){4}\S+$/.test(r?.cron ?? "")) p.push(`${r?.id}: cron "${r?.cron}" is not a 5-field cron expression`);
    if (r?.cron && /\* \* [^ ]*6[^ ]*$/.test(r.cron) && SABBATH_IDS.has(r.id)) p.push(`${r.id}: fires on Saturday, which is the Sabbath`);
    if (!Array.isArray(r?.skills) || r.skills.length === 0) p.push(`${r?.id}: skills must be a non-empty list`);
    if (!r?.skills?.includes("standing-rules")) p.push(`${r?.id}: every routine must include the standing-rules skill`);
    if (!["push", "none"].includes(r?.notify)) p.push(`${r?.id}: notify must be push or none`);
    if (typeof r?.model !== "string") p.push(`${r?.id}: model is required`);
  }
  return p;
}

function section(title: string, body: string): string {
  return `\n\n==================== ${title} ====================\n\n${body.trim()}\n`;
}

/** The self-contained prompt for one routine. */
export function compileRoutine(emp: Employee, file: RoutinesFile, r: RoutineSpec): string {
  const skill = (name: string) => {
    const s = emp.skills.find((x) => x.name === name);
    if (!s) throw new Error(`${r.id}: skill "${name}" is not in agent.yaml`);
    return s;
  };
  const seed = (name: string) => {
    const s = emp.seeds.find((x) => x.name === name);
    if (!s) throw new Error(`${r.id}: seed "${name}" is not in memory/seed/`);
    return { name, body: readFileSync(s.path, "utf8") };
  };
  const skills = r.skills.map(skill);
  const seeds = r.seeds.map(seed);
  const head = `You are Radar, Kev Williams' chief of staff (employee "radar" in the Agent-Builder workshop). This is the routine "${r.name}" (id ${r.id}), firing on schedule "${r.cron}". Pacific time. Fresh session, no memory: research live and never fabricate.

STEP 0, READ THE LIVE FILES. The authoritative version of everything below lives in the repository ${REPO} (branch ${file.branch}, folder employees/radar/). Do this first:
1. If employees/radar/ exists in the working directory, read persona.md, the skills listed here, and memory/seed/ and memory/live/ from there. They override the embedded copies below.
2. Otherwise run: git clone --depth 1 --branch ${file.branch} ${REPO} /tmp/agent-builder, then read the same files from /tmp/agent-builder/employees/radar/.
3. If both fail, the embedded copies below are authoritative. Say so in your closing summary.
Saturday is the Sabbath: if today is Saturday in Pacific time and this routine is not the Sunday Edition build, stop now with one line.

Then do exactly what the playbook "${skills[skills.length - 1]!.name}" says, honouring every standing rule, the interrupt rules and the trust ramp where they apply. Close with a short plain summary of what you did, what you sent, and anything you could not do.`;
  let out = head;
  out += section("PERSONA (employees/radar/persona.md)", emp.persona);
  out += section("BRAND STANDARD (employees/_shared/eden-brand.md)", emp.brand.replace(/^# .*\n+/, ""));
  for (const s of skills) out += section(`PLAYBOOK: ${s.name} (employees/radar/skills/${s.name}.md)`, s.body);
  for (const s of seeds) out += section(`SEED MEMORY: ${s.name} (employees/radar/memory/seed/${s.name}.md)`, s.body);
  return out;
}

export type TriggerPayload = {
  id: string;
  action: "update" | "create";
  trigger_id: string | null;
  name: string;
  cron_expression: string;
  model: string;
  notifications: { push: boolean; email: boolean };
  prompt_file: string;
  prompt_chars: number;
};

export function deployPlan(file: RoutinesFile, outDir: string, prompts: Record<string, string>): TriggerPayload[] {
  return file.routines.map((r) => ({
    id: r.id,
    action: r.trigger_id ? "update" : "create",
    trigger_id: r.trigger_id,
    name: r.name,
    cron_expression: r.cron,
    model: r.model,
    notifications: { push: r.notify === "push", email: false },
    prompt_file: join(outDir, `${r.id}.md`),
    prompt_chars: prompts[r.id]?.length ?? 0,
  }));
}

export function compileAll(employeeDir: string): { file: RoutinesFile; prompts: Record<string, string> } {
  const emp = loadEmployee(employeeDir);
  const file = loadRoutines(employeeDir);
  const prompts: Record<string, string> = {};
  for (const r of file.routines) prompts[r.id] = compileRoutine(emp, file, r);
  return { file, prompts };
}
