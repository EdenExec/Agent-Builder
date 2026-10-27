// The recruiting team's board data, built read-only from Crelate (Q, 23 Oct 2026).
// Feeds "The Board" at the top of the Round Table (projects/workforce/draft/round-table.html).
// Counting rules are Dean's (employees/dean/memory/seed/crelate-scorecard-spec.md): RPs count activities; MPs, resumes,
// PTCs, submittals and FTIs count unique contacts per recruiter; the by-JO table counts the same way inside each job.
// Nothing here writes to Crelate. Nothing here keeps a candidate name, phone, email or any comp field: contacts are
// reduced to an opaque id for de-duplication and then dropped. The API key is read from the environment by the CLI and
// never printed.
import { defaultFetcher, type Fetcher } from "../lib/http.ts";

/* ---------------------------------------------------------------- constants */

export const API = "https://app.crelate.com/api3/";
const BROWSER_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"; // Cloudflare blocks default clients

export const VERBS = {
  rp: "996532fa-687f-43b7-240e-6c5d86f3dc08",
  mp: "90f0f186-ef1d-4179-ba68-bac188f3dc08",
  resumes: "a8859da5-c9a9-4885-e332-6e6988f3dc08",
  ptcs: "92c42981-6c7b-4525-a7fd-4d7e86f3dc08",
  subs: "b92f0a4a-42f1-464a-c7ce-55ed88f3dc08",
  ftis: "edd73b17-5cfe-402c-6377-d9afafefdc08",
} as const;

export type MetricKey = "rps" | "mps" | "resumes" | "ptcs" | "subs" | "ftis" | "offers";
export const METRICS: MetricKey[] = ["rps", "mps", "resumes", "ptcs", "subs", "ftis", "offers"];
const VERB_TO_METRIC: Record<string, Exclude<MetricKey, "offers">> = {
  [VERBS.rp]: "rps", [VERBS.mp]: "mps", [VERBS.resumes]: "resumes", [VERBS.ptcs]: "ptcs", [VERBS.subs]: "subs", [VERBS.ftis]: "ftis",
};

/** Board columns that hold active job orders (pipeline cleanup, 21 Oct 2026). Filled is read only to catch offers and placements. */
export const ACTIVE_COLUMNS: Record<string, string> = {
  "0c13de6f-e565-415e-c0ef-993e114add08": "RETAINED",
  "0da0478c-2d78-407a-a8f1-99f87446dd08": "TOP",
  "5a236fa5-7ea5-48dc-6f0e-b7f87446dd08": "GO NOW",
  "e6fa493f-f5d0-4e05-904a-cbde08041886": "Typical",
};
export const FILLED_COLUMN = "3b392950-0160-4c12-b810-c1b4afefdc08";

export const GOALS = {
  rps_per_day: 15, rps_week: 75,           // Eden standard: 15 RPs by noon, 75 a week
  mps_per_day: 20, mps_week: 100,          // Kev, 23 Oct 2026: 20 a day ("meaningful connections")
  accelerator_per_quarter: 25000,          // Kev, 23 Oct 2026: $25k a quarter per recruiter
} as const;

export type Group = "recruiter" | "leadership";
export type Person = { slug: string; name: string; full: string; role: string; group: Group; ids: string[]; start?: string; inGoal?: boolean };

/** Roster: Dean's seven (team-and-baseline.md) plus Kunji and Kyle, who Kev named on 23 Oct 2026. Kyle has no Crelate user until he starts (2 Nov). */
export const ROSTER: Person[] = [
  { slug: "max", name: "Max", full: "Max Betcher", role: "Headhunter", group: "recruiter", ids: ["89fa787a-070f-43a8-b3df-60de080410bb"] },
  { slug: "evan", name: "Evan", full: "Evan MacArthur", role: "Headhunter", group: "recruiter", ids: ["82fcd797-7b12-4612-a235-62de080301fa"] },
  { slug: "noah", name: "Noah", full: "Noah Fields", role: "Headhunter", group: "recruiter", ids: ["29b91eae-fc26-4455-b304-62de0803002e"] },
  { slug: "andrew", name: "Andrew", full: "Andrew Johnson", role: "Headhunter", group: "recruiter", ids: ["9c963c7a-ac1a-4f90-82e4-f6dd0803ea2d"] },
  { slug: "bridger", name: "Bridger", full: "Bridger Stainbrook", role: "Headhunter, remote", group: "recruiter", ids: ["83f31e94-56a1-435a-8974-bbde0802ba1a"] },
  { slug: "kunji", name: "Kunji", full: "Kunji Elder", role: "Trainee", group: "recruiter", ids: ["8efc5cf2-d953-408f-8eb9-a4de08032ef2"], inGoal: false }, // no Crelate activity since 1 Sep; Kev to say when the 75 a week starts
  { slug: "kyle", name: "Kyle", full: "Kyle Cockell", role: "Incoming, Boise", group: "recruiter", ids: [], start: "2026-11-02" },
  { slug: "nick", name: "Nick", full: "Nick Leckwold", role: "Operations", group: "leadership", ids: ["6964a256-20dd-4756-abfc-dedd08004293", "f3559cdc-f847-486d-2c61-cba1d7f2dc08"] },
  { slug: "kev", name: "Kev", full: "Kevin Williams", role: "Founder", group: "leadership", ids: ["b3f4a630-5dd1-44a0-cc82-08f8b9f2dc08"] },
];

/** Names the Rev Report uses in its Rec. column. */
const REV_ALIASES: Record<string, string> = {
  max: "max", evan: "evan", "evan mac": "evan", noah: "noah", andrew: "andrew", juice: "andrew", juicy: "andrew",
  bridger: "bridger", kunji: "kunji", kyle: "kyle", nick: "nick", kev: "kev", kevin: "kev",
};

/* ---------------------------------------------------------------- Pacific time */

const PT = "America/Los_Angeles";
const ptFmt = new Intl.DateTimeFormat("en-US", { timeZone: PT, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" });

function ptParts(ms: number) {
  const o: Record<string, string> = {};
  for (const p of ptFmt.formatToParts(new Date(ms))) o[p.type] = p.value;
  return { y: +o.year!, m: +o.month!, d: +o.day!, hh: +o.hour!, mm: +o.minute!, ss: +o.second!, wd: o.weekday! };
}
/** Pacific calendar date (YYYY-MM-DD) of an instant. */
export function ptDate(ms: number): string {
  const p = ptParts(ms);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}
function ptOffsetMs(ms: number): number {
  const p = ptParts(ms);
  return Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - Math.floor(ms / 1000) * 1000;
}
/** The instant (UTC ms) at which a Pacific calendar date starts. Handles the November change. */
export function ptMidnightUtc(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number) as [number, number, number];
  const naive = Date.UTC(y, m - 1, d);
  let t = naive - ptOffsetMs(naive + 8 * 3600e3);
  t = naive - ptOffsetMs(t); // second pass settles the day the clocks change
  return t;
}
export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function weekdayOf(ymd: string): number { // 0 Sunday
  const [y, m, d] = ymd.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dayLabel(ymd: string): string { const [, m, d] = ymd.split("-").map(Number) as [number, number, number]; return `${DAYS[weekdayOf(ymd)]} ${d} ${MONTHS[m - 1]}`; }
export function ptStamp(ms: number): string {
  const p = ptParts(ms), h12 = p.hh % 12 === 0 ? 12 : p.hh % 12;
  return `${p.wd} ${p.d} ${MONTHS[p.m - 1]} ${p.y}, ${h12}:${String(p.mm).padStart(2, "0")} ${p.hh < 12 ? "AM" : "PM"} PT`;
}

export type Windows = {
  weekStart: string; lastStart: string; lastEnd: string; today: string;
  thisFromMs: number; nowMs: number; lastFromMs: number; lastToMs: number; lastSameToMs: number;
};
/** Weeks run Sunday 00:00 to Saturday 23:59 Pacific (Kev, 23 Oct 2026: "Sun 18 Oct to today"). */
export function weekWindows(nowMs: number): Windows {
  const today = ptDate(nowMs);
  const weekStart = addDays(today, -weekdayOf(today));
  const lastStart = addDays(weekStart, -7);
  const thisFromMs = ptMidnightUtc(weekStart), lastFromMs = ptMidnightUtc(lastStart);
  return {
    weekStart, lastStart, lastEnd: addDays(weekStart, -1), today,
    thisFromMs, nowMs, lastFromMs, lastToMs: thisFromMs,
    lastSameToMs: Math.min(thisFromMs, lastFromMs + (nowMs - thisFromMs)),
  };
}

/* ---------------------------------------------------------------- Crelate reads */

export type ActivityRow = {
  Id?: string; When?: string;
  VerbId?: { Id?: string } | null;
  ParentId?: { Id?: string } | null;                                  // the contact: id only is used, never the title
  RegardingId?: { Id?: string; EntityName?: string } | null;          // the job
  Owners?: { Id?: string; IsPrimary?: boolean }[] | null;
  CreatedById?: { Id?: string } | null;
};
export type StageRow = { Date?: string; Contact?: { Id?: string } | null; Stage?: { Title?: string } | null; Action?: string; User?: { Id?: string } | null; Job?: { Id?: string } | null };
export type JobRow = { Id: string; JobNum?: number; Name?: string; SalesWorkflowItemStatusId?: { Id?: string; Title?: string } | null; NumberOfPlacements?: number };

export class CrelateError extends Error {}

export function makeClient(apiKey: string, fetcher: Fetcher = defaultFetcher) {
  async function get<T = any>(path: string, retries = 3): Promise<T> {
    const url = API + path;
    for (let attempt = 0; ; attempt++) {
      const res = await fetcher(url, { headers: { "X-Api-Key": apiKey, "user-agent": BROWSER_UA }, signal: AbortSignal.timeout(60_000) });
      if (res.status === 429 && attempt < retries) { await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); continue; }
      // report the status and the endpoint only; never the key or the headers
      if (!res.ok) throw new CrelateError(`Crelate HTTP ${res.status} on ${path.split("?")[0]}`);
      const body = (await res.json()) as any;
      const ignored = (body?.Errors ?? []).filter((e: any) => /IgnoredParameter/i.test(JSON.stringify(e)));
      if (ignored.length) throw new CrelateError(`Crelate ignored a filter on ${path.split("?")[0]}; the counts would be wrong`);
      return body as T;
    }
  }
  async function pageAll<T>(path: string, size: number): Promise<T[]> {
    const out: T[] = [];
    const sep = path.includes("?") ? "&" : "?";
    for (let off = 0; off < 20_000; off += size) {
      const j = await get<{ Data: T[] }>(`${path}${sep}limit=${size}&offset=${off}`);
      out.push(...(j.Data ?? []));
      if ((j.Data ?? []).length < size) break;
    }
    return out;
  }
  return {
    activities: (afterIso: string) =>
      pageAll<ActivityRow>(`activities?verb_ids=${Object.values(VERBS).join(",")}&when_after=${afterIso}&fields=Id,VerbId,RegardingId,ParentId,When,Owners,CreatedById`, 200),
    jobs: () =>
      pageAll<JobRow>(`jobs?statuses=${[...Object.keys(ACTIVE_COLUMNS), FILLED_COLUMN].join(",")}&fields=Id,JobNum,Name,SalesWorkflowItemStatusId,NumberOfPlacements`, 100),
    stageEntries: (jobId: string, afterIso: string) =>
      pageAll<StageRow>(`jobs/${jobId}/contacts/history?created_after=${afterIso}`, 200),
  };
}
export type Client = ReturnType<typeof makeClient>;

/* ---------------------------------------------------------------- counting */

export type Counts = Record<MetricKey, number>;
const zero = (): Counts => ({ rps: 0, mps: 0, resumes: 0, ptcs: 0, subs: 0, ftis: 0, offers: 0 });
const ownerSlug = new Map<string, string>();
for (const p of ROSTER) for (const id of p.ids) ownerSlug.set(id, p.slug);

/** Everyone on the roster who owns an activity. Dean's rule is owner_ids, which credits every owner (Kev often co-owns a PTC logged for a recruiter).
 *  If no owner is on the roster, the person who logged it. */
export function slugsOf(a: ActivityRow): string[] {
  const out = new Set<string>();
  for (const o of a.Owners ?? []) { const s = ownerSlug.get(o?.Id ?? ""); if (s) out.add(s); }
  if (!out.size) { const s = ownerSlug.get(a.CreatedById?.Id ?? ""); if (s) out.add(s); }
  return [...out];
}

type Bucket = { counts: Counts; seen: Set<string>; byDay: Record<string, number> };
const bucket = (): Bucket => ({ counts: zero(), seen: new Set(), byDay: {} });
function addTo(b: Bucket, metric: Exclude<MetricKey, "offers">, a: ActivityRow, who: string, day: string | null) {
  if (metric === "rps") { b.counts.rps++; if (day) b.byDay[day] = (b.byDay[day] ?? 0) + 1; return; }
  // unique contacts per recruiter; with no contact on the activity, fall back to counting the activity
  const key = `${metric}|${who}|${a.ParentId?.Id ?? "act:" + a.Id}`;
  if (b.seen.has(key)) return;
  b.seen.add(key); b.counts[metric]++;
}

export type PersonCounts = { this: Counts; lastSame: Counts; lastFull: Counts; rpsByDay: Record<string, number> };
export type JoCounts = { rps: number; resumes: number; ptcs: number; ftis: number };
export type JoRow = { id: string; num: number | null; name: string; column: string; this: JoCounts; last: JoCounts; people: string[] };

export type CountResult = {
  persons: Record<string, PersonCounts>;
  jos: JoRow[];
  other: { this: JoCounts; last: JoCounts };       // activity on a job that is not an active JO (buckets, portals, filled, closed)
  none: { this: JoCounts; last: JoCounts };        // activity with no job attached
  strayDates: number;
  activeTotal: number;                              // active JOs on the board, with or without activity
};
const jc = (): JoCounts => ({ rps: 0, resumes: 0, ptcs: 0, ftis: 0 });
const JO_METRICS = ["rps", "resumes", "ptcs", "ftis"] as const;

export function countActivities(rows: ActivityRow[], jobs: JobRow[], stages: StageRow[], w: Windows): CountResult {
  const activeJobs = new Map<string, JobRow>();
  for (const j of jobs) if (ACTIVE_COLUMNS[j.SalesWorkflowItemStatusId?.Id ?? ""]) activeJobs.set(j.Id, j);

  const per: Record<string, { this: Bucket; lastSame: Bucket; lastFull: Bucket }> = {};
  for (const p of ROSTER) per[p.slug] = { this: bucket(), lastSame: bucket(), lastFull: bucket() };
  type JoAcc = { t: Bucket; l: Bucket; people: Set<string> };
  const joAcc = new Map<string, JoAcc>();
  const otherT = bucket(), otherL = bucket(), noneT = bucket(), noneL = bucket();
  let strayDates = 0;

  for (const a of rows) {
    const metric = VERB_TO_METRIC[a.VerbId?.Id ?? ""];
    const ms = Date.parse(a.When ?? "");
    if (!metric || !Number.isFinite(ms)) continue;
    if (ms > w.nowMs) { strayDates++; continue; }               // a stray future date (one was seen in the year 9999)
    const whos = slugsOf(a);
    if (!whos.length) continue;                                  // not on the roster (other staff): not counted
    const inThis = ms >= w.thisFromMs, inLast = ms >= w.lastFromMs && ms < w.lastToMs;
    if (!inThis && !inLast) continue;
    const day = inThis ? ptDate(ms) : null;
    const jobId = a.RegardingId?.Id;
    const isJob = !!jobId && (!a.RegardingId?.EntityName || /^jobs?$/i.test(a.RegardingId.EntityName));
    for (const who of whos) {
      if (inThis) addTo(per[who]!.this, metric, a, who, day);
      if (inLast) {
        addTo(per[who]!.lastFull, metric, a, who, null);
        if (ms < w.lastSameToMs) addTo(per[who]!.lastSame, metric, a, who, null);
      }
      if (!(JO_METRICS as readonly string[]).includes(metric)) continue;   // MPs and submittals are not by-JO measures
      let t: Bucket, l: Bucket, people: Set<string> | null = null;
      if (!isJob) { t = noneT; l = noneL; }
      else if (!activeJobs.has(jobId!)) { t = otherT; l = otherL; }
      else {
        let acc = joAcc.get(jobId!);
        if (!acc) { acc = { t: bucket(), l: bucket(), people: new Set() }; joAcc.set(jobId!, acc); }
        t = acc.t; l = acc.l; people = acc.people;
      }
      if (inThis) { addTo(t, metric, a, who, null); people?.add(who); }
      if (inLast) { addTo(l, metric, a, who, null); people?.add(who); }
    }
  }

  // offers: a contact entering a stage called "Offer ..." on a job, credited to the person who moved them (unique per person and contact)
  for (const s of stages) {
    if (!/^offer/i.test(s.Stage?.Title ?? "")) continue;
    const ms = Date.parse(s.Date ?? "");
    const who = ownerSlug.get(s.User?.Id ?? "");
    if (!who || !Number.isFinite(ms) || ms > w.nowMs) continue;
    const key = `offers|${who}|${s.Contact?.Id ?? s.Date}`;
    if (ms >= w.thisFromMs) { const b = per[who]!.this; if (!b.seen.has(key)) { b.seen.add(key); b.counts.offers++; } }
    if (ms >= w.lastFromMs && ms < w.lastToMs) {
      const b = per[who]!.lastFull; if (!b.seen.has(key)) { b.seen.add(key); b.counts.offers++; }
      if (ms < w.lastSameToMs) { const c = per[who]!.lastSame; if (!c.seen.has(key)) { c.seen.add(key); c.counts.offers++; } }
    }
  }

  const persons: Record<string, PersonCounts> = {};
  for (const p of ROSTER) {
    const x = per[p.slug]!;
    persons[p.slug] = { this: x.this.counts, lastSame: x.lastSame.counts, lastFull: x.lastFull.counts, rpsByDay: x.this.byDay };
  }
  const toJc = (b: Bucket): JoCounts => ({ rps: b.counts.rps, resumes: b.counts.resumes, ptcs: b.counts.ptcs, ftis: b.counts.ftis });
  const jos: JoRow[] = [...joAcc.entries()].map(([id, acc]) => {
    const j = activeJobs.get(id)!;
    return {
      id, num: j.JobNum ?? null, name: (j.Name ?? "").trim(), column: ACTIVE_COLUMNS[j.SalesWorkflowItemStatusId?.Id ?? ""] ?? "",
      this: toJc(acc.t), last: toJc(acc.l),
      people: ROSTER.filter((p) => acc.people.has(p.slug)).map((p) => p.slug),
    };
  }).sort((a, b) => b.this.rps - a.this.rps || b.last.rps - a.last.rps || (a.num ?? 0) - (b.num ?? 0));
  return { persons, jos, other: { this: toJc(otherT), last: toJc(otherL) }, none: { this: toJc(noneT), last: toJc(noneL) }, strayDates, activeTotal: activeJobs.size };
}

/** Days in the week (Pacific) on which a person logged at least 15 RPs. */
export function daysAtGoal(rpsByDay: Record<string, number>): number {
  return Object.values(rpsByDay).filter((n) => n >= GOALS.rps_per_day).length;
}

/* ---------------------------------------------------------------- Rev Report (optional CSV export of the "2026 Rev Report" tab) */

export type RevRow = { rec: string; split: number | null; start: string | null; gross: number; candidate: string };
function csvRows(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
export function money(s: string | undefined): number | null {
  const t = (s ?? "").replace(/[$,\s]/g, "");
  if (t === "" || t === "-") return t === "-" ? 0 : null;
  const neg = /^\(.*\)$/.test(t), n = Number(t.replace(/[()]/g, ""));
  return Number.isFinite(n) ? (neg ? -n : n) : null;
}
function pct(s: string | undefined): number | null {
  const t = (s ?? "").replace(/[%\s]/g, "");
  if (!t) return null; const n = Number(t); return Number.isFinite(n) ? n / 100 : null;
}
function startDate(s: string | undefined, year: number): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/.exec((s ?? "").trim());
  if (!m) return null;
  const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : year;
  return `${y}-${String(+m[1]!).padStart(2, "0")}-${String(+m[2]!).padStart(2, "0")}`;
}
/** Reads the Rev Report export. Keeps only the recruiter, split, start date and Eden Gross; no salary, fee rate or candidate detail is kept. */
export function parseRevCsv(text: string, year = 2026): RevRow[] {
  const rows = csvRows(text);
  const hi = rows.findIndex((r) => r.some((c) => /^\s*prtnr\s*$/i.test(c)) && r.some((c) => /^\s*rec\.?\s*$/i.test(c)));
  if (hi < 0) throw new Error("Rev Report CSV: header row with Prtnr and Rec. not found");
  const head = rows[hi]!.map((c) => c.trim().toLowerCase());
  const col = (re: RegExp) => head.findIndex((c) => re.test(c));
  const iRec = col(/^rec\.?$/), iSplit = col(/^split/), iStart = col(/^start date/), iGross = col(/^eden gross/), iCand = col(/^candidate/);
  if ([iRec, iSplit, iStart, iGross].some((i) => i < 0)) throw new Error("Rev Report CSV: Rec., Split %, Start Date or Eden Gross column missing");
  const out: RevRow[] = [];
  for (const r of rows.slice(hi + 1)) {
    const gross = money(r[iGross]);
    if (gross == null && !(r[iRec] ?? "").trim()) continue;
    if (!(r[iStart] ?? "").trim() && gross == null) continue;
    out.push({ rec: (r[iRec] ?? "").trim(), split: pct(r[iSplit]), start: startDate(r[iStart], year), gross: gross ?? 0, candidate: iCand >= 0 ? (r[iCand] ?? "").trim() : "" });
  }
  return out;
}
export function quarterOf(ymd: string): { start: string; end: string; label: string } {
  const [y, m] = ymd.split("-").map(Number) as [number, number];
  const q = Math.floor((m - 1) / 3), sm = q * 3 + 1;
  const start = `${y}-${String(sm).padStart(2, "0")}-01`;
  const end = new Date(Date.UTC(y, sm + 2, 0)).toISOString().slice(0, 10);
  return { start, end, label: `Q${q + 1} ${y}` };
}
export type RevResult = {
  perPerson: Record<string, number>; placementsWeek: number; placementsQtd: number;
  unmapped: string[]; noSplit: number; noPartnerRec: number;
};
/** Credit = Eden Gross x Split % on rows with a recruiter named, by Start Date in the quarter. A row with a recruiter but no split is not credited (flagged). */
export function revenueByRecruiter(rows: RevRow[], w: Windows): RevResult {
  const q = quarterOf(w.today), perPerson: Record<string, number> = {}, unmapped = new Set<string>();
  let noSplit = 0, noPartnerRec = 0, placementsWeek = 0, placementsQtd = 0;
  for (const r of rows) {
    if (!r.start || r.start < q.start || r.start > q.end) continue;
    const isRetainer = /retainer|engagement/i.test(r.candidate);
    if (!isRetainer && r.gross > 0) { placementsQtd++; if (r.start >= w.weekStart && r.start <= w.today) placementsWeek++; }
    if (!r.rec) { noPartnerRec++; continue; }
    const slug = REV_ALIASES[r.rec.toLowerCase()];
    if (!slug) { unmapped.add(r.rec); continue; }
    if (r.split == null) { noSplit++; continue; }
    perPerson[slug] = (perPerson[slug] ?? 0) + r.gross * r.split;
  }
  for (const k of Object.keys(perPerson)) perPerson[k] = Math.round(perPerson[k]! * 100) / 100;
  return { perPerson, placementsWeek, placementsQtd, unmapped: [...unmapped], noSplit, noPartnerRec };
}

/* ---------------------------------------------------------------- the board document */

export type HubFigures = { billings_ytd: number; pct_to_goal?: number; to_goal?: number; as_of: string; source: string };
export type BoardInput = {
  nowMs: number; counts: CountResult; hub?: HubFigures; rev?: RevResult; jobsRead: number; stageJobsRead: number; fetchedActivities: number;
};
const sum = (list: Counts[]): Counts => { const t = zero(); for (const c of list) for (const k of METRICS) t[k] += c[k]; return t; };

export function buildBoard(inp: BoardInput) {
  const w = weekWindows(inp.nowMs), c = inp.counts, q = quarterOf(w.today);
  const started = (p: Person) => !p.start || p.start <= w.today;
  const people = ROSTER.map((p) => {
    const x = c.persons[p.slug]!, live = p.ids.length > 0;
    const status = !started(p) ? "starts" : live ? "active" : "no Crelate user";
    const revSynced = !!inp.rev && live;
    const qtd = revSynced ? (inp.rev!.perPerson[p.slug] ?? 0) : null;
    return {
      slug: p.slug, name: p.name, role: p.role, group: p.group, status, start: p.start ?? null, in_goal: p.inGoal !== false && p.group === "recruiter" && status === "active",
      this: x.this, last_same: x.lastSame, last_full: x.lastFull,
      rp_days_at_15: daysAtGoal(x.rpsByDay), rp_by_day: x.rpsByDay,
      revenue_qtd: qtd, pct_to_accelerator: qtd == null ? null : Math.round((qtd / GOALS.accelerator_per_quarter) * 1000) / 10,
    };
  });
  const recruiters = people.filter((p) => p.group === "recruiter");
  const counted = recruiters.filter((p) => p.status === "active");   // everyone working counts toward the totals
  const goalN = recruiters.filter((p) => p.in_goal).length;        // only those with a weekly standard count toward the goal
  const leadership = people.filter((p) => p.group === "leadership");
  const team = {
    this: sum(counted.map((p) => p.this)), last_same: sum(counted.map((p) => p.last_same)), last_full: sum(counted.map((p) => p.last_full)),
  };
  const desk = {
    this: sum(people.filter((p) => p.status === "active").map((p) => p.this)),
    last_same: sum(people.filter((p) => p.status === "active").map((p) => p.last_same)),
    last_full: sum(people.filter((p) => p.status === "active").map((p) => p.last_full)),
  };
  const n = goalN;
  const jo = (x: JoCounts) => x;
  const throughLabel = ptStamp(inp.nowMs);
  const notes: string[] = [];
  if (c.strayDates) notes.push(`${c.strayDates} activity row(s) dated in the future were ignored.`);
  const unmatchedRps = c.other.this.rps + c.none.this.rps;
  const allRps = c.jos.reduce((s, j) => s + j.this.rps, 0) + unmatchedRps;
  if (allRps > 0) notes.push(`${unmatchedRps} of ${allRps} RPs this week (${Math.round((unmatchedRps / allRps) * 100)}%) are not on an active JO: ${c.none.this.rps} have no job attached, ${c.other.this.rps} sit on buckets, portals or closed jobs.`);
  if (inp.rev) {
    if (inp.rev.unmapped.length) notes.push(`Rev Report names not matched to a recruiter: ${inp.rev.unmapped.join(", ")}.`);
    if (inp.rev.noSplit) notes.push(`${inp.rev.noSplit} Rev Report row(s) name a recruiter but have no split; not credited.`);
  }

  return {
    schema: 1,
    generated_at: new Date(inp.nowMs).toISOString(),
    as_of: throughLabel,
    source: "Crelate API v3, read-only (Crelate stays the system of record)",
    week: {
      start: w.weekStart, through: w.today, partial: true, label: `${dayLabel(w.weekStart)} to ${dayLabel(w.today)}`,
      note: "Weeks run Sunday to Saturday, Pacific. A week in progress is compared with last week to the same point, not with last week's full total.",
    },
    last_week: { start: w.lastStart, end: w.lastEnd, same_point_through: new Date(w.lastSameToMs).toISOString(), label: `${dayLabel(w.lastStart)} to ${dayLabel(w.lastEnd)}` },
    goals: {
      ...GOALS, recruiters_counted: counted.length, recruiters_in_goal: n, rps_team_week: GOALS.rps_week * n, mps_team_week: GOALS.mps_week * n,
      accelerator_team_quarter: GOALS.accelerator_per_quarter * n, quarter: q.label,
      other_goals: "Resumes, PTCs, submittals, FTIs and offers: goal not set.",
    },
    metric_notes: {
      rps: "Recruiting calls logged, counted as activities.",
      mps: "Crelate MP activity, unique contacts per recruiter. Kev's 20-a-day meaningful-connection goal is applied to it; meaningful connections are also tallied on the call sheet, which Crelate does not see.",
      resumes: "Resumes received, unique contacts.", ptcs: "Presented to client, unique contacts.", subs: "Submittal and Files, unique contacts.", ftis: "First-time interviews, unique contacts.",
      offers: "Contacts moved into an Offer stage on a job, by the person who moved them.",
    },
    team, desk,
    recruiters, leadership,
    jos: c.jos.map((j) => ({ ...j, this: jo(j.this), last: jo(j.last) })),
    jos_other: { label: "Not on an active JO (buckets, portals, filled, closed)", ...c.other },
    jos_none: { label: "No job attached", ...c.none },
    jos_meta: { active_jobs_counted_from: "RETAINED, TOP, GO NOW and Typical columns", active_total: c.activeTotal, with_activity: c.jos.length, jobs_read: inp.jobsRead },
    revenue: {
      hub: inp.hub
        ? { status: "hub figure, not gated by Tally", billings_ytd: inp.hub.billings_ytd, pct_to_goal: inp.hub.pct_to_goal ?? null, to_goal: inp.hub.to_goal ?? null, as_of: inp.hub.as_of, source: inp.hub.source }
        : { status: "not synced" },
      recruiters: inp.rev
        ? { status: "from Rev Report export", quarter: q.label, rule: "Eden Gross x Split % on rows naming the recruiter, by Start Date in the quarter", placements_week: inp.rev.placementsWeek, placements_qtd: inp.rev.placementsQtd }
        : { status: "not synced", why: "The Rev Report tab was not available as a full export. Re-run with --rev-csv <export of the 2026 Rev Report tab>.", quarter: q.label },
    },
    counts_meta: { activities_read: inp.fetchedActivities, stage_jobs_read: inp.stageJobsRead },
    notes,
  };
}
export type Board = ReturnType<typeof buildBoard>;

/* ---------------------------------------------------------------- run */

export async function runBoard(opts: { client: Client; nowMs?: number; hub?: HubFigures; revCsv?: string }): Promise<Board> {
  const nowMs = opts.nowMs ?? Date.now(), w = weekWindows(nowMs);
  const after = new Date(w.lastFromMs).toISOString().replace(".000Z", "Z");
  const [activities, jobs] = await Promise.all([opts.client.activities(after), opts.client.jobs()]);
  const stages: StageRow[] = [];
  for (const j of jobs) stages.push(...(await opts.client.stageEntries(j.Id, after)));
  const counts = countActivities(activities, jobs, stages, w);
  const rev = opts.revCsv ? revenueByRecruiter(parseRevCsv(opts.revCsv), w) : undefined;
  return buildBoard({ nowMs, counts, hub: opts.hub, rev, jobsRead: jobs.length, stageJobsRead: jobs.length, fetchedActivities: activities.length });
}
