// Reads the files behind the desk sheets' projects (Kev, 29 Oct 2026): the briefs, projects/virtual-office/project-owners.yaml and each project's
// schedule table. All read-only; the pure logic is in workshop/core/office-projects.ts.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parse } from "yaml";
import type { ProjectDef } from "../core/desk-projects.ts";
import { cutWords, squash, type ProjectItem } from "../core/office-projects.js";

type Block = { title?: string; agents?: string[]; keywords?: string[]; schedule?: string; status?: string };
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** The `office:` block of a brief (YAML key, or markdown front matter) plus the brief's own title. */
function readBrief(dir: string): { title?: string; office: Block } {
  const y = join(dir, "brief.yaml"), m = join(dir, "brief.md");
  try {
    if (existsSync(y)) { const d = parse(readFileSync(y, "utf8")) as { project?: string; office?: Block } | null; return { title: d?.project, office: d?.office ?? {} }; }
    if (existsSync(m)) {
      const text = readFileSync(m, "utf8"), fm = /^---\n([\s\S]*?)\n---/.exec(text);
      let front: { title?: string; office?: Block } = {};
      if (fm) { try { front = (parse(fm[1]!) as typeof front) ?? {}; } catch { /* a front matter we cannot read counts as none */ } }
      return { title: front.title ?? /^#\s+(.+)$/m.exec(text)?.[1], office: front.office ?? {} };
    }
  } catch { /* an unreadable brief lists no project from itself */ }
  return { office: {} };
}

const cells = (line: string) => line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

/** "Wed 28 Oct (A)", "Fri 8 Jan 2027" -> ISO date; the year defaults to the file's. */
export function parseDue(text: string, fallbackYear: number): string | null {
  const m = /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+(20\d\d))?/i.exec(text);
  if (!m) return null;
  return `${m[3] ?? fallbackYear}-${String(MONTHS.indexOf(m[2]!.toLowerCase()) + 1).padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
}

/** A path in backticks that exists in the repo (relative to the schedule's folder or the repo root): the document a row is about. */
function docLink(row: string, base: string): string | undefined {
  for (const m of row.matchAll(/`([^`\s]+\.[a-z]{2,4}|[^`\s]+\/)`/g)) {
    for (const root of [base, ".", join(base, "..", "..", "employees", "pm", "briefs")]) {
      const p = join(root, m[1]!);
      if (existsSync(p)) return relative(".", resolve(p));
    }
  }
  return undefined;
}

/**
 * The deliverables table(s) of a schedule file as items. State rule: a status starting "Done" is shipped (dated by "(23 Oct)" in the status, else the file's date);
 * a row Kev owns that is Slipped, At risk, Waiting on, "ready for Kev" or due today or earlier needs him; everything else is open.
 */
export function scheduleRows(file: string, today: string): { owner: string; item: ProjectItem; status: string }[] {
  const text = readFileSync(file, "utf8"), fileDate = /^date:\s*(\d{4}-\d{2}-\d{2})/m.exec(text)?.[1] ?? today, year = Number(fileDate.slice(0, 4));
  const out: { owner: string; item: ProjectItem; status: string }[] = [];
  let head: string[] | null = null;
  for (const line of text.split("\n")) {
    if (!line.trim().startsWith("|")) { head = null; continue; }
    const c = cells(line);
    if (c.every((x) => /^:?-+:?$/.test(x))) continue;
    if (c.includes("ID") && c.includes("Status") && c.includes("Owner")) { head = c; continue; }
    if (!head) continue;
    const at = (name: string) => c[head!.indexOf(name)] ?? "";
    const id = at("ID"), what = at("Deliverable") || at("Milestone");
    if (!/^[A-Z]{2}-\d+$/.test(id) || !what) continue;
    const status = at("Status"), owner = at("Owner"), due = parseDue(at("Due"), year), next = at("Next action");
    const done = /^done\b/i.test(status);
    const kev = /^kev\b/i.test(owner);
    const needs = !done && kev && (/slipped|at risk|waiting on|ready for kev/i.test(status) || (due !== null && due <= today));
    const doneAt = done ? (parseDue(status, year) ?? fileDate) : null;
    out.push({
      owner, status,
      item: { title: `${id} ${cutWords(what.replace(/\s*\([^)]*\)/g, ""), 7)}`, state: done ? "shipped" : needs ? "needs" : "open", link: docLink(line, dirname(file)) ?? "", at: doneAt ? `${doneAt}T12:00:00Z` : null, note: squash(next || status) },
    });
  }
  return out;
}

/** One-line summary of a schedule ("3 of 26 rows done, 1 slipped, 1 at risk"), at most ten words. */
export function scheduleStatus(rows: { status: string }[]): string {
  const n = (re: RegExp) => rows.filter((r) => re.test(r.status)).length;
  const parts = [`${n(/^done\b/i)} of ${rows.length} rows done`];
  if (n(/slipped/i)) parts.push(`${n(/slipped/i)} slipped`);
  if (n(/at risk/i)) parts.push(`${n(/at risk/i)} at risk`);
  return cutWords(parts.join(", "), 10);
}

/** Every project that names at least one agent. `root` is the repo's projects folder. */
export function loadProjectDefs(root = "projects", today = new Date().toISOString().slice(0, 10)): ProjectDef[] {
  const regFile = join(root, "virtual-office", "project-owners.yaml");
  const reg = existsSync(regFile) ? ((parse(readFileSync(regFile, "utf8")) as { projects?: Record<string, Block> })?.projects ?? {}) : {};
  const slugs = new Set([...readdirSync(root).filter((n) => statSync(join(root, n)).isDirectory()), ...Object.keys(reg)]);
  const defs: ProjectDef[] = [];
  for (const id of [...slugs].sort()) {
    const dir = join(root, id);
    if (!existsSync(dir)) continue;
    const brief = readBrief(dir), r = reg[id] ?? {}, o = brief.office;
    const agents = o.agents ?? r.agents ?? [];
    if (!agents.length) continue;
    const schedule = o.schedule ?? r.schedule;
    const def: ProjectDef = { id, title: o.title ?? r.title ?? squash(brief.title ?? id).slice(0, 60), agents, keywords: [...(o.keywords ?? []), ...(r.keywords ?? [])] };
    const briefFile = ["brief.yaml", "brief.md"].map((n) => join(dir, n)).find(existsSync);
    if (schedule && existsSync(schedule)) {
      const rows = scheduleRows(schedule, today);
      def.rows = rows.map(({ owner, item }) => ({ owner, item }));
      def.status = o.status ?? r.status ?? scheduleStatus(rows);
      def.link = schedule;
    } else { if (o.status ?? r.status) def.status = o.status ?? r.status; if (briefFile) def.link = briefFile; }
    defs.push(def);
  }
  return defs;
}
