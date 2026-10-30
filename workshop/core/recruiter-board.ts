// The recruiter leaderboard for the Command Center ("Recruiters · Crelate · this week"), Kev, 28 Oct 2026.
// Pure functions: no network, no writes. The Crelate read is workshop/workforce/recruiting-board.ts (read-only); this turns its board
// document into `meta/crelate`, the one document the page reads (documented in projects/virtual-office/bench-sources.json).
//
// Counts only. Never pay, commission, phone, email, candidate names or any money figure; the people are the recruiters' first names.
// Week = Monday to Sunday, Pacific, to date. The standard is 15 RPs a day, Monday to Friday, and a day's 15 falls due at noon Pacific
// ("15 RPs by noon"), so nobody is marked behind at 8am for a number that is not due yet.
import { addDays, dayOfWeek, pacificDate } from "./office-game.js";

export const SCHEMA = 1;
export const PER_DAY = 15;
export const DUE_HOUR = 12;                       // a day's standard falls due at noon Pacific
/** The Team pulse reads the last 10 weekdays: last Monday-to-Friday and this one. Days not yet reached are null (no data), never zero. */
export const PULSE_WEEKDAYS = 10;
export const SOURCE_LIVE = "Crelate, read-only (API v3, pulled by the hourly office run)";
export const SOURCE_FILE = "Round Table board file (projects/workforce/board/current.json), the last Crelate pull saved in the repo";

export type Five = { rps: number; mps: number; ptcs: number; subs: number; ftis: number };
export type CountsLite = Partial<Record<"rps" | "mps" | "ptcs" | "subs" | "ftis", number>>;

/** The part of the Round Table board document (workshop/workforce/recruiting-board.ts) this needs. Older files have no mon_week or today. */
export type BoardForLeaderboard = {
  generated_at?: string;
  week?: { start?: string; through?: string; mon_start?: string };
  goals?: { rps_per_day?: number; rps_week?: number; mps_week?: number };
  recruiters?: {
    slug?: string; name?: string; status?: string; in_goal?: boolean;
    this?: CountsLite; mon_week?: CountsLite; today?: CountsLite; rp_by_day?: Record<string, number>;
    rp_by_day_2w?: Record<string, number>;   // RPs by Pacific day from the Monday before last Monday (newer board files)
  }[];
};

export type RecruiterRow = {
  name: string;
  inGoal: boolean;                      // false for a trainee: counted in the totals, no standard yet
  week: Five;
  today: Five | null;                   // null when the data was not pulled today
  rpDays: (number | null)[];            // RPs on each of dayKeys, null where there is no data (a day not reached, or the older board file does not reach back)
  standardToDate: number | null;        // RPs due so far this week at 15 a day; null with no standard
  gap: number | null;                   // week RPs minus standardToDate (negative = behind)
  behind: boolean;
};

export type CrelateDoc = {
  schema: number;
  asOf: string;                         // when Crelate was read (the data's own time, never the sync time)
  syncedAt: string;                     // when this document was written
  source: string;
  live: boolean;                        // a pull made by this run, not the file in the repo
  ageMin: number;                       // minutes between asOf and syncedAt
  weekOf: string;                       // the Monday of the week the figures cover
  through: string;                      // the last Pacific day the figures cover
  weekIsCurrent: boolean;               // false: these are an earlier week's figures (the file fallback after a new week began)
  todayCurrent: boolean;                // the data was pulled today, so the Today column is real
  weekBasis: "monday" | "sunday-file";  // sunday-file: an older board file; RPs are re-cut to Monday from its daily counts, the other counts are its Sunday-start week
  perDay: number;
  goals: { rpsWeek: number; mpsWeek: number };   // per recruiter in goal, per week (Kev, 23 Oct 2026)
  dayKeys: string[];                    // the last 10 weekdays, last Monday through this Friday; rpDays line up with it
  weekdaysCounted: number;
  recruiters: RecruiterRow[];
  team: { week: Five; today: Five | null; rpDays: (number | null)[]; standardToDate: number; gap: number; behind: number; people: number };
  notes: string[];
};

const zero = (): Five => ({ rps: 0, mps: 0, ptcs: 0, subs: 0, ftis: 0 });
const five = (c: CountsLite | undefined): Five => ({ rps: c?.rps ?? 0, mps: c?.mps ?? 0, ptcs: c?.ptcs ?? 0, subs: c?.subs ?? 0, ftis: c?.ftis ?? 0 });
const add = (a: Five, b: Five): Five => ({ rps: a.rps + b.rps, mps: a.mps + b.mps, ptcs: a.ptcs + b.ptcs, subs: a.subs + b.subs, ftis: a.ftis + b.ftis });

const hourFmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hourCycle: "h23", hour: "2-digit" });
/** The Pacific hour (0 to 23) of an instant. */
export function ptHour(ms: number): number { return Number(hourFmt.format(new Date(ms))); }

/** The Monday on or before a date: the start of the Monday-to-Sunday week it belongs to (a Sunday belongs to the week that is ending). */
export function mondayOf(date: string): string { return addDays(date, -((dayOfWeek(date) + 6) % 7)); }

/** Weekdays (Monday to Friday) from the Monday through the last day covered, up to Friday. */
export function weekdaysThrough(monday: string, through: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 5; i++) { const d = addDays(monday, i); if (d <= through) out.push(d); }
  return out;
}

/**
 * RPs due so far at `perDay` a day: every weekday before the last day covered counts in full, and the last day counts once noon Pacific
 * has passed (or when it is not a weekday there is nothing to add). `through` is the Pacific day the data runs through and
 * `hourAtRead` the Pacific hour it was read, so a stale file is judged at the moment it was read, not at the hour someone looks at it.
 */
export function standardToDate(monday: string, through: string, hourAtRead: number, perDay = PER_DAY): number {
  const days = weekdaysThrough(monday, through);
  if (!days.length) return 0;
  const last = days[days.length - 1]!;
  const lastIsThrough = last === through;                      // through a Saturday or Sunday: every weekday is complete
  const full = lastIsThrough && hourAtRead < DUE_HOUR ? days.length - 1 : days.length;
  return full * perDay;
}

/** Behind pace: has a standard and fewer RPs than are due. Exactly on the number is on pace. */
export function isBehind(rps: number, standard: number | null): boolean { return standard != null && rps < standard; }

/** Sum of a Monday-to-through window of a person's RPs by day (an older board file has only these). */
export function rpsFromDays(byDay: Record<string, number> | undefined, monday: string, through: string): number {
  let n = 0;
  for (const [d, v] of Object.entries(byDay ?? {})) if (d >= monday && d <= through) n += v;
  return n;
}

/** Monday to Friday of the week before the one starting `monday`, then Monday to Friday of `monday`'s week: ten dates. */
export function pulseDayKeys(monday: string): string[] {
  const out: string[] = [];
  for (const m of [addDays(monday, -7), monday]) for (let i = 0; i < 5; i++) out.push(addDays(m, i));
  return out;
}

/**
 * One person's RPs on each day key. A day after the last day covered is null. The 10-day map (rp_by_day_2w) covers every day it reaches,
 * so a day with no entry is a real zero; an older board file has only the Sunday-start week's days, so earlier days are null (not read).
 */
export function rpDaysFor(keys: string[], through: string, weekStart: string | undefined, two: Record<string, number> | undefined, one: Record<string, number> | undefined): (number | null)[] {
  return keys.map((d) => {
    if (d > through) return null;
    if (two) return two[d] ?? 0;
    if (one && weekStart && d >= weekStart) return one[d] ?? 0;
    return null;
  });
}

export function buildCrelateDoc(board: BoardForLeaderboard, live: boolean, now: Date): CrelateDoc {
  const asOf = board.generated_at ?? now.toISOString();
  const asOfMs = Date.parse(asOf);
  const through = board.week?.through ?? pacificDate(asOfMs);
  const monday = board.week?.mon_start ?? mondayOf(through);
  const hourAtRead = ptHour(asOfMs);
  const perDay = board.goals?.rps_per_day ?? PER_DAY;
  const todayCurrent = pacificDate(asOfMs) === pacificDate(now.getTime()) && pacificDate(asOfMs) === through;
  const weekIsCurrent = monday === mondayOf(pacificDate(now.getTime()));
  const std = standardToDate(monday, through, hourAtRead, perDay);
  const people = (board.recruiters ?? []).filter((p) => p.status === "active");
  const hasMon = people.some((p) => p.mon_week);
  const hasToday = people.some((p) => p.today);
  const dayKeys = pulseDayKeys(monday);

  const rows: RecruiterRow[] = people.map((p) => {
    // Older board files have only the Sunday-start week and RPs by day: re-cut the RPs to Monday, keep the rest as the file has them.
    const week = hasMon ? five(p.mon_week) : { ...five(p.this), rps: rpsFromDays(p.rp_by_day, monday, through) };
    const today: Five | null = !todayCurrent ? null
      : hasToday ? five(p.today)
      : { ...zero(), rps: p.rp_by_day?.[through] ?? 0 };      // the file has only RPs for the day: the rest would be a guess, so it stays zero and the page says so
    const inGoal = p.in_goal === true;
    const standard = inGoal ? std : null;
    const rpDays = rpDaysFor(dayKeys, through, board.week?.start, p.rp_by_day_2w, p.rp_by_day);
    return { name: p.name ?? p.slug ?? "?", inGoal, week, today, rpDays, standardToDate: standard, gap: standard == null ? null : week.rps - standard, behind: isBehind(week.rps, standard) };
  }).sort((a, b) => b.week.rps - a.week.rps || a.name.localeCompare(b.name));

  const teamWeek = rows.reduce((t, r) => add(t, r.week), zero());
  const teamToday = todayCurrent ? rows.reduce((t, r) => add(t, r.today ?? zero()), zero()) : null;
  const inGoalRows = rows.filter((r) => r.inGoal);
  const teamDays = dayKeys.map((_, i) => { const v = rows.map((r) => r.rpDays[i]).filter((x): x is number => x != null); return v.length ? v.reduce((a, b) => a + b, 0) : null; });
  const teamStd = inGoalRows.reduce((t, r) => t + (r.standardToDate ?? 0), 0);
  const teamInGoalRps = inGoalRows.reduce((t, r) => t + r.week.rps, 0);

  const notes: string[] = [];
  if (!live) notes.push(`Not a live read: the figures are the board file saved ${asOf.slice(0, 10)}, the last Crelate pull in the repo. They update the next time the office run has CRELATE_API_KEY.`);
  if (!hasMon) notes.push("This file was written before the Monday-start week: RPs are re-cut to Monday from its daily counts; PTC, submittal and first interview counts are its Sunday-start week.");
  if (!hasMon && todayCurrent) notes.push("This file has today's RPs only; the other counts for today are not in it.");
  if (!weekIsCurrent) notes.push(`These figures are for the week of ${monday}, not the current week.`);
  notes.push(`Standard: ${perDay} RPs a day, Monday to Friday; a day's ${perDay} falls due at noon Pacific. Trainees have no standard yet.`);

  const doc: CrelateDoc = {
    schema: SCHEMA, asOf, syncedAt: now.toISOString(), source: live ? SOURCE_LIVE : SOURCE_FILE, live,
    ageMin: Math.max(0, Math.round((now.getTime() - asOfMs) / 60000)),
    weekOf: monday, through, weekIsCurrent, todayCurrent, weekBasis: hasMon ? "monday" : "sunday-file", perDay,
    goals: { rpsWeek: board.goals?.rps_week ?? perDay * 5, mpsWeek: board.goals?.mps_week ?? 100 },
    dayKeys,
    weekdaysCounted: weekdaysThrough(monday, through).length,
    recruiters: rows,
    team: { week: teamWeek, today: teamToday, rpDays: teamDays, standardToDate: teamStd, gap: teamInGoalRps - teamStd, behind: rows.filter((r) => r.behind).length, people: rows.length },
    notes,
  };
  assertCrelateSafe(doc);
  return doc;
}

const ALLOWED_KEYS = new Set(["schema", "asOf", "syncedAt", "source", "live", "ageMin", "weekOf", "through", "weekIsCurrent", "todayCurrent", "weekBasis", "perDay", "weekdaysCounted", "goals", "rpsWeek", "mpsWeek", "dayKeys", "rpDays", "recruiters", "team", "notes",
  "name", "inGoal", "week", "today", "standardToDate", "gap", "behind", "people", "rps", "mps", "ptcs", "subs", "ftis"]);

/** The document is counts, dates and first names. Throws on any other key, an email, a phone number or a dollar figure, so a bad field can never be written. */
export function assertCrelateSafe(doc: unknown): void {
  const walk = (v: unknown, path: string): void => {
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        if (!ALLOWED_KEYS.has(k)) throw new Error(`meta/crelate: field "${path}.${k}" is not a count, a date or a name`);
        walk(x, `${path}.${k}`);
      }
    }
  };
  walk(doc, "doc");
  const text = JSON.stringify(doc);
  if (/@|\$\s?\d|\b\d{3}[-.\s)]\s?\d{3}[-.\s]\d{4}\b/.test(text)) throw new Error("meta/crelate carries an email, a phone number or a dollar figure");
}
