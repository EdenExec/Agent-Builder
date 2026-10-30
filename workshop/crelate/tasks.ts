// Kev's open Crelate tasks for the Command Center (Q, 30 Oct 2026; ticket t-202610300221-crnf).
// Crelate's API v3 has no notifications or @mentions feed; tasks are what it exposes. Kev, 30 Oct: "use relevance
// screening, if its severely outdated/old, move on from it and remove it from my queue." Read-only: GET only, nothing
// in Crelate changes. Stale tasks leave Kev's list here; clearing them inside Crelate is a separate, Kev-approved step.
//
//   npm run crelate-tasks            JSON for the Command Center doc meta/crelate-tasks (Radar's runner writes it)
//
// Kept per task: id, a cleaned one-line title (no emails or phone numbers), due date, the record it hangs on (type and
// name), whether someone else assigned it, days overdue. The API key is read from CRELATE_API_KEY and never printed.
import { pathToFileURL } from "node:url";
import { defaultFetcher, type Fetcher } from "../lib/http.ts";

export const API = "https://app.crelate.com/api3/";
const BROWSER_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const DAY = 86_400_000;

/** Screening: a task is stale when it was due more than STALE_DUE_DAYS ago and nobody touched it for STALE_TOUCH_DAYS,
 *  or it has no due date and nobody touched it for NO_DUE_TOUCH_DAYS. Someone else's fresh assignment is never stale. */
export const STALE_DUE_DAYS = 45;
export const STALE_TOUCH_DAYS = 30;
export const NO_DUE_TOUCH_DAYS = 60;

export type RawTask = {
  Id: string; Display?: string; When?: string | null; CreatedOn?: string; ModifiedOn?: string;
  CreatedById?: { Id?: string; Title?: string } | null; ParentId?: { Id?: string; EntityName?: string; Title?: string } | null;
};
export type TaskRow = {
  id: string; title: string; due: string | null; overdueDays: number | null;
  record: { type: string; name: string } | null; assignedBy: "self" | "other"; assignerName?: string;
};
export type TaskDoc = { asOf: string; active: TaskRow[]; movedOn: { count: number; oldestDue: string | null }; screening: string };

/** One line, no markup, no emails or phone numbers, at most 140 characters. */
export function cleanTitle(s: string | undefined): string {
  let t = String(s ?? "");
  const tt = t.trim();
  if (tt.startsWith("[") || tt.startsWith("\"")) { try { const v = JSON.parse(tt); t = Array.isArray(v) ? v.join(" ") : String(v); } catch { /* plain */ } }
  t = t.replace(/<[^>]*>/g, " ")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, "[phone]")
    .replace(/\s+/g, " ").trim();
  return t.length > 140 ? `${t.slice(0, 139)}…` : t || "(no title)";
}

const days = (from: string | null | undefined, now: number) => {
  if (!from) return null;
  const t = Date.parse(from);
  return Number.isNaN(t) ? null : Math.floor((now - t) / DAY);
};

export function isStale(t: RawTask, selfId: string, now: number): boolean {
  const dueAgo = days(t.When, now);
  const touched = days(t.ModifiedOn ?? t.CreatedOn, now) ?? Infinity;
  const fromOther = !!t.CreatedById?.Id && t.CreatedById.Id !== selfId;
  if (fromOther && (days(t.CreatedOn, now) ?? Infinity) <= STALE_TOUCH_DAYS) return false;
  if (dueAgo === null) return touched > NO_DUE_TOUCH_DAYS;
  return dueAgo > STALE_DUE_DAYS && touched > STALE_TOUCH_DAYS;
}

export function screen(tasks: RawTask[], selfId: string, now = Date.now()): TaskDoc {
  const active: TaskRow[] = [];
  const stale: RawTask[] = [];
  for (const t of tasks) {
    if (!t?.Id) continue;
    if (isStale(t, selfId, now)) { stale.push(t); continue; }
    const dueAgo = days(t.When, now);
    const other = !!t.CreatedById?.Id && t.CreatedById.Id !== selfId;
    active.push({
      id: t.Id, title: cleanTitle(t.Display), due: t.When ? t.When.slice(0, 10) : null,
      overdueDays: dueAgo !== null && dueAgo > 0 ? dueAgo : null,
      record: t.ParentId?.Title ? { type: String(t.ParentId.EntityName ?? "").replace(/s$/, "") || "Record", name: cleanTitle(t.ParentId.Title) } : null,
      assignedBy: other ? "other" : "self", ...(other && t.CreatedById?.Title ? { assignerName: cleanTitle(t.CreatedById.Title) } : {}),
    });
  }
  // others' assignments first, then most overdue, then soonest due, then no date
  active.sort((a, b) => (a.assignedBy === b.assignedBy ? 0 : a.assignedBy === "other" ? -1 : 1)
    || (b.overdueDays ?? -1) - (a.overdueDays ?? -1) || (a.due ?? "9999").localeCompare(b.due ?? "9999"));
  const dues = stale.map((t) => t.When).filter(Boolean).sort() as string[];
  return {
    asOf: new Date(now).toISOString(), active,
    movedOn: { count: stale.length, oldestDue: dues[0]?.slice(0, 10) ?? null },
    screening: `Hidden: due over ${STALE_DUE_DAYS} days ago and untouched ${STALE_TOUCH_DAYS}+ days, or no due date and untouched ${NO_DUE_TOUCH_DAYS}+ days. Still open in Crelate.`,
  };
}

export async function pullTasks(apiKey: string, fetcher: Fetcher = defaultFetcher): Promise<{ selfId: string; tasks: RawTask[] }> {
  const headers = { "X-Api-Key": apiKey, "user-agent": BROWSER_UA, accept: "application/json" };
  const get = async (path: string) => {
    const res = await fetcher(API + path, { method: "GET", headers, signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`GET ${path.split("?")[0]}: HTTP ${res.status}`);
    const j = (await res.json()) as { Data?: any; Errors?: any[] };
    if (Array.isArray(j.Errors) && j.Errors.length) throw new Error(`GET ${path.split("?")[0]}: ${JSON.stringify(j.Errors).slice(0, 200)}`);
    return j.Data;
  };
  const self = await get("users/self");
  const selfId = String(self?.Id ?? "");
  if (!selfId) throw new Error("users/self returned no id");
  const tasks: RawTask[] = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const page = await get(`tasks?owner_ids=${encodeURIComponent(selfId)}&completed=false&limit=100&offset=${offset}&sort_by=When&fields=Id,Display,When,CreatedOn,ModifiedOn,CreatedById,ParentId`);
    const rows = Array.isArray(page) ? page : [];
    tasks.push(...rows);
    if (rows.length < 100) break;
  }
  return { selfId, tasks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const key = process.env.CRELATE_API_KEY;
  if (!key) { console.error("CRELATE_API_KEY is not set in this environment."); process.exit(1); }
  const { selfId, tasks } = await pullTasks(key);
  console.log(JSON.stringify(screen(tasks, selfId), null, 2));
}
