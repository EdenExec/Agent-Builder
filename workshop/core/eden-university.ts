// Eden University: the track.json shape, its checks, and the database writes the loader makes.
// Dean writes projects/eden-university/<track-id>/track.json; the page reads `tracks/{id}`; this file is the contract between them.
// Nothing here touches a live system: it validates files and builds the write plan Radar applies with ArtifactData.

export const CHECKERS = ["bridger", "jenny", "nick", "kev", "self"] as const;
export type Checker = (typeof CHECKERS)[number];

export interface Phase { id: string; title: string; weekFrom: number; weekTo: number }
export interface Module {
  id: string; phase: string; title: string; goal: string; steps: string[]; proof: string;
  minutes: number; checker: Checker; link?: string;
}
export interface Track {
  id: string; title: string; audience: string; supervisor: string; weeks: number;
  phases: Phase[]; modules: Module[];
}
export interface Check { errors: string[]; warnings: string[] }

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/;
const PHONE = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/;
const SOFT = /\b(salary|salaries|pay rate|hourly rate|stipend|wage|medical|diagnos\w*|disability|health condition)\b|\$\s?\d/i;

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

/** Check one parsed track.json. Errors stop the load of that track; warnings are printed and the load goes on. */
export function checkTrack(raw: unknown, dirName?: string): Check {
  const errors: string[] = [], warnings: string[] = [];
  const t = raw as Record<string, unknown>;
  if (!t || typeof t !== "object" || Array.isArray(t)) return { errors: ["track.json is not an object"], warnings };
  for (const k of ["id", "title", "audience", "supervisor"]) if (!isStr(t[k])) errors.push(`${k}: missing or empty`);
  if (isStr(t.id) && !/^[a-z0-9][a-z0-9-]*$/.test(t.id)) errors.push(`id "${t.id}" must be lowercase letters, digits and hyphens`);
  if (isStr(t.id) && dirName && t.id !== dirName) warnings.push(`id "${t.id}" differs from its folder "${dirName}"`);
  if (!isNum(t.weeks) || (t.weeks as number) < 1) errors.push("weeks: must be a number of 1 or more");
  if (!Array.isArray(t.phases) || t.phases.length === 0) errors.push("phases: need at least one");
  if (!Array.isArray(t.modules) || t.modules.length === 0) errors.push("modules: need at least one");
  const phaseIds = new Set<string>();
  if (Array.isArray(t.phases)) {
    t.phases.forEach((p: Record<string, unknown>, i: number) => {
      const at = `phases[${i}]`;
      if (!p || typeof p !== "object") { errors.push(`${at}: not an object`); return; }
      if (!isStr(p.id)) errors.push(`${at}.id: missing`);
      else if (phaseIds.has(p.id)) errors.push(`${at}.id "${p.id}" is repeated`);
      else phaseIds.add(p.id);
      if (!isStr(p.title)) errors.push(`${at}.title: missing`);
      if (!isNum(p.weekFrom) || !isNum(p.weekTo)) errors.push(`${at}: weekFrom and weekTo must be numbers`);
      else if ((p.weekTo as number) < (p.weekFrom as number)) errors.push(`${at}: weekTo is before weekFrom`);
      else if (isNum(t.weeks) && (p.weekTo as number) > (t.weeks as number)) warnings.push(`${at}: weekTo ${p.weekTo} is past the track's ${t.weeks} weeks`);
    });
  }
  if (Array.isArray(t.modules)) {
    const seen = new Set<string>();
    t.modules.forEach((m: Record<string, unknown>, i: number) => {
      const at = `modules[${i}]${isStr(m?.id) ? ` (${m.id})` : ""}`;
      if (!m || typeof m !== "object") { errors.push(`${at}: not an object`); return; }
      if (!isStr(m.id)) errors.push(`${at}.id: missing`);
      else if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(m.id)) errors.push(`${at}.id: letters, digits, hyphen and underscore only`);
      else if (seen.has(m.id)) errors.push(`${at}.id is repeated`);
      else seen.add(m.id);
      if (!isStr(m.title)) errors.push(`${at}.title: missing`);
      if (!isStr(m.phase)) errors.push(`${at}.phase: missing`);
      else if (phaseIds.size && !phaseIds.has(m.phase)) errors.push(`${at}.phase "${m.phase}" is not a phase of this track`);
      if (!isStr(m.goal)) warnings.push(`${at}.goal: empty`);
      if (!Array.isArray(m.steps) || m.steps.length === 0 || !m.steps.every(isStr)) errors.push(`${at}.steps: need a list of non-empty strings`);
      if (!isStr(m.proof)) warnings.push(`${at}.proof: empty, so the learner has nothing to submit against`);
      if (!isNum(m.minutes) || (m.minutes as number) <= 0) errors.push(`${at}.minutes: must be a positive number`);
      if (!isStr(m.checker) || !(CHECKERS as readonly string[]).includes(m.checker.toLowerCase())) errors.push(`${at}.checker "${m.checker}" must be one of ${CHECKERS.join("|")}`);
      if (m.link !== undefined && m.link !== null && m.link !== "" && typeof m.link !== "string") errors.push(`${at}.link: must be a string`);
    });
  }
  const text = strings(raw);
  if (text.some((s) => EMAIL.test(s))) errors.push("contains an email address; the university never stores emails");
  if (text.some((s) => PHONE.test(s))) errors.push("contains a phone number; the university never stores phones");
  if (text.some((s) => SOFT.test(s))) warnings.push("mentions pay, a dollar amount or health words; check that none of it is a person's own detail");
  return { errors, warnings };
}

/** The document the page reads at tracks/{id}: the file as written, with the checker lower-cased and a few derived fields. */
export function trackDoc(t: Track, source: string, loadedAt: string): Record<string, unknown> {
  return {
    id: t.id, title: t.title, audience: t.audience, supervisor: t.supervisor, weeks: t.weeks,
    phases: t.phases.map((p) => ({ id: p.id, title: p.title, weekFrom: p.weekFrom, weekTo: p.weekTo })),
    modules: t.modules.map((m) => ({
      id: m.id, phase: m.phase, title: m.title, goal: m.goal ?? "", steps: m.steps, proof: m.proof ?? "",
      minutes: m.minutes, checker: String(m.checker).toLowerCase(), link: m.link ?? "",
    })),
    moduleCount: t.modules.length,
    totalMinutes: t.modules.reduce((a, m) => a + m.minutes, 0),
    source, loadedAt,
  };
}

export interface WriteEntry { op: "set"; collection: "tracks"; doc_id: string; file_path: string }
/** An ArtifactData batch body: one `set` per track, each reading its document from a local JSON file. */
export function batchFor(entries: { id: string; file: string }[]): { writes: WriteEntry[] } {
  return { writes: entries.map((e) => ({ op: "set", collection: "tracks", doc_id: e.id, file_path: e.file })) };
}

// ---- The page's progress arithmetic, mirrored here so it has a unit test. The page carries the same functions. ----
export type Status = "new" | "progress" | "submitted" | "signed" | "self";
export interface Progress { startDate?: string; steps?: Record<string, number[]>; submissions?: Record<string, { text?: string; link?: string; at?: string }> }
export interface Signoff { modules?: Record<string, { by?: string; byName?: string; at?: string; note?: string }> }

export function moduleStatus(m: Module, p?: Progress, s?: Signoff): Status {
  if (s?.modules?.[m.id]) return "signed";
  if (p?.submissions?.[m.id]) return m.checker === "self" ? "self" : "submitted";
  return (p?.steps?.[m.id]?.length ?? 0) > 0 ? "progress" : "new";
}
export const isDone = (st: Status) => st === "signed" || st === "self";

export function percentDone(t: Track, p?: Progress, s?: Signoff): number {
  if (!t.modules.length) return 0;
  return Math.round((100 * t.modules.filter((m) => isDone(moduleStatus(m, p, s))).length) / t.modules.length);
}

const DAY = 86_400_000;
/** The last day of a module's phase window: start date plus weekTo weeks. */
export function phaseEnd(t: Track, m: Module, startDate: string): number {
  const ph = t.phases.find((x) => x.id === m.phase);
  const weeks = ph ? ph.weekTo : t.weeks;
  return new Date(startDate + "T00:00:00").getTime() + weeks * 7 * DAY;
}
/** Behind = the learner has not submitted a module more than `graceDays` (3) after its phase window closed. */
export function behindModules(t: Track, p: Progress | undefined, s: Signoff | undefined, now: number, graceDays = 3): Module[] {
  if (!p?.startDate) return [];
  return t.modules.filter((m) => {
    const st = moduleStatus(m, p, s);
    return st !== "signed" && st !== "self" && st !== "submitted" && now > phaseEnd(t, m, p.startDate!) + graceDays * DAY;
  });
}
