// Recruiter desk: the per-recruiter config, the stamp-out, and the one filter that keeps one recruiter's data out of another's desk.
// Spec: projects/recruiter-desk/brief.md. Pure functions; the CLI is workshop/office/recruiter-desk.ts.
// Rules baked in: no pay, no phone, no email, no client names in example data, no other recruiter's numbers.

export type Track = "standard" | "accelerated" | "established";
export const TRACKS: Track[] = ["standard", "accelerated", "established"];

export interface RampStep { from: string; rpsDay: number }
export interface Checkpoint { name: string; date: string }

export interface DeskConfig {
  slug: string;
  name: string;           // as the recruiter is known at Eden, for example "Kyle Cockell"
  first: string;
  hubName: string;        // how the Hub's `team[].recruiter` spells this person, the key for the JO filter
  office: string;         // Vancouver, Boise or Remote
  startDate: string;      // YYYY-MM-DD
  track: Track;
  standards: { rpsDay: number; rpsWeek: number; rotateDays: number };
  ramp: RampStep[];       // the daily RP target by date; empty for an established recruiter
  checkpoints: Checkpoint[];
  template: string;       // template version the desk was stamped from
  stampedOn: string;      // YYYY-MM-DD
}

export const TEMPLATE_VERSION = "v0.1";
export const MARKER_START = "/*DESK_CONFIG_START*/";
export const MARKER_END = "/*DESK_CONFIG_END*/";
const OFFICES = ["Vancouver", "Boise", "Remote"];

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return isoDay(d);
}
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T12:00:00Z"));

export function validSlug(s: string): boolean {
  return /^[a-z][a-z0-9-]{0,30}$/.test(s) && !s.endsWith("-");
}

/** The daily RP target by date. Established recruiters have no ramp (15 from day one). Ramp numbers are (A) until Kev confirms. */
export function rampFor(start: string, track: Track): RampStep[] {
  if (track === "established") return [];
  if (track === "accelerated") return [{ from: start, rpsDay: 0 }, { from: addDays(start, 7), rpsDay: 15 }];
  return [{ from: start, rpsDay: 0 }, { from: addDays(start, 7), rpsDay: 5 }, { from: addDays(start, 14), rpsDay: 10 }, { from: addDays(start, 21), rpsDay: 15 }];
}

/** Checkpoints from Dean's drafts (kyle-cockell-prestart.md for accelerated; the 90-day outline for standard). Dean owns the content; these are (A). */
export function checkpointsFor(start: string, track: Track): Checkpoint[] {
  if (track === "established") return [];
  if (track === "accelerated") return [
    { name: "1. Systems", date: addDays(start, 4) },
    { name: "2. Pace", date: addDays(start, 11) },
    { name: "3. Solo craft", date: addDays(start, 18) },
    { name: "4. Day 30", date: addDays(start, 29) },
  ];
  return [
    { name: "Crelate certified", date: addDays(start, 11) },
    { name: "Day 30: submittal certified, 15 RPs a day", date: addDays(start, 29) },
    { name: "Day 60: owns a search's depth chart", date: addDays(start, 59) },
    { name: "Day 90: ready to own a search", date: addDays(start, 89) },
  ];
}

export interface NewInput { slug: string; name: string; hubName?: string; office?: string; start: string; track?: Track; today?: string }

export function buildConfig(i: NewInput): DeskConfig {
  if (!validSlug(i.slug)) throw new Error(`Slug "${i.slug}" must be lowercase letters, digits and hyphens, starting with a letter.`);
  const name = i.name.trim().replace(/\s+/g, " ");
  if (!/^[A-Za-z][A-Za-z .'-]{1,40}$/.test(name)) throw new Error(`Name "${name}" must be letters only (no digits, emails or numbers).`);
  const office = i.office ?? "Vancouver";
  if (!OFFICES.includes(office)) throw new Error(`Office must be one of ${OFFICES.join(", ")}.`);
  if (!isDate(i.start)) throw new Error(`Start date "${i.start}" must be YYYY-MM-DD.`);
  const track = i.track ?? "standard";
  if (!TRACKS.includes(track)) throw new Error(`Track must be one of ${TRACKS.join(", ")}.`);
  const first = name.split(" ")[0]!;
  return {
    slug: i.slug, name, first, hubName: (i.hubName ?? first).trim(), office, startDate: i.start, track,
    standards: { rpsDay: 15, rpsWeek: 75, rotateDays: 14 },
    ramp: rampFor(i.start, track), checkpoints: checkpointsFor(i.start, track),
    template: TEMPLATE_VERSION, stampedOn: i.today ?? isoDay(new Date()),
  };
}

/** Put the config into the template. The template carries one marker pair around a JSON object and a <title> in its first lines. */
export function renderDesk(template: string, cfg: DeskConfig): string {
  const a = template.indexOf(MARKER_START), b = template.indexOf(MARKER_END);
  if (a < 0 || b < a || template.indexOf(MARKER_START, a + 1) >= 0) throw new Error("Template must contain exactly one DESK_CONFIG marker pair.");
  // "<" is escaped so a name can never close the script tag
  const json = JSON.stringify(cfg).replace(/</g, "\\u003c");
  const out = template.slice(0, a + MARKER_START.length) + json + template.slice(b);
  const title = `${cfg.first}'s Desk`;
  if (!/<title>[^<]*<\/title>/.test(out)) throw new Error("Template has no <title>.");
  return out.replace(/<title>[^<]*<\/title>/, `<title>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title>`);
}

export function readConfigFrom(html: string): DeskConfig {
  const a = html.indexOf(MARKER_START), b = html.indexOf(MARKER_END);
  if (a < 0 || b < a) throw new Error("No DESK_CONFIG marker pair.");
  return JSON.parse(html.slice(a + MARKER_START.length, b)) as DeskConfig;
}

/* ---------- privacy scan ---------- */

/** Client names (Scout's clients.md) plus the discreet ones. Example data and desk pages carry none of them. */
export const CLIENT_NAMES = ["Moss", "Baker", "Triton", "PB South", "VMG", "Megawatt", "Hoffman", "Pence Kelly", "Fortis", "Carmel", "Promethean", "Prometheus", "Swinerton", "INL"];

export function scanForbidden(text: string): string[] {
  const hits: string[] = [];
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(text.replace(/kev@edenexec\.com/g, ""))) hits.push("email address");
  if (/(?<![\w#.])\(?\+?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/.test(text)) hits.push("phone number");
  if (/\$\s?\d[\d,]*(\.\d+)?(?:[kKmM]\b)?/.test(text)) hits.push("dollar amount");
  for (const c of CLIENT_NAMES) if (new RegExp(`\\b${c.replace(/ /g, "\\s")}\\b`, "i").test(text)) hits.push(`client name "${c}"`);
  return hits;
}

/* ---------- seed documents (ArtifactData writes) ---------- */

export interface Write { op: "set"; collection: string; doc_id: string; data: Record<string, unknown> }

export function seedWrites(cfg: DeskConfig, now: string): Write[] {
  return [
    { op: "set", collection: "profile", doc_id: "me", data: { slug: cfg.slug, name: cfg.name, first: cfg.first, office: cfg.office, startDate: cfg.startDate, track: cfg.track, standards: cfg.standards, ramp: cfg.ramp, updated: now } },
    { op: "set", collection: "training", doc_id: "track", data: { track: cfg.track, checkpoints: cfg.checkpoints, source: "Dean, Eden University outline (A)", updated: now } },
  ];
}

/* ---------- the isolation filter: Hub jobs -> this recruiter's desk ---------- */

export interface HubJob {
  id?: string; client?: string; client_slug?: string; discreet?: boolean; role?: string; location?: string; status?: string; opened?: string; rank?: number;
  leads?: { title?: string; url?: string; count?: number; built?: string }[];
  team?: { recruiter?: string; since?: string; role_on_job?: string; note?: string }[];
  condition?: string; updated?: string; source?: string;
}
export interface DeskJob {
  id: string; role: string; client: string; discreet: boolean; location: string; status: string;
  since: string; roleOnJob: string; standby: boolean;
  coWorkers: { name: string; roleOnJob: string }[];
  leads: { title: string; url: string; count: number | null; built: string | null }[];
  due: { text: string; on: string }[]; lastActivityAt: string | null; hubUpdated: string | null;
}

const clean = (s: unknown, max = 90) => String(s ?? "").replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "").replace(/\(?\+?\d[\d\s().-]{8,}\d/g, "").replace(/\$\s?\d[\d,]*(\.\d+)?(?:[kKmM]\b)?/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const firstName = (s: unknown) => String(s ?? "").trim().split(/\s+/)[0] ?? "";

/**
 * Only the jobs this recruiter is on. Other recruiters appear as a first name and a role on the job, never with dates or numbers.
 * Dropped on purpose: the Hub's `condition`, per-person `note`, `rank`, `source`. A discreet client keeps the Hub's own "Client · discreet" label.
 * A job with no entry for this person is not returned at all, so another recruiter's work never enters this desk's database.
 */
export function jobsForRecruiter(hub: HubJob[], hubName: string): DeskJob[] {
  const me = hubName.trim().toLowerCase();
  const out: DeskJob[] = [];
  for (const j of hub) {
    if (j.status && j.status !== "active") continue;
    const mine = (j.team ?? []).find((t) => String(t.recruiter ?? "").trim().toLowerCase() === me);
    if (!mine) continue;
    const discreet = !!j.discreet;
    const id = String(j.id ?? `${j.client_slug ?? "jo"}-${clean(j.role, 40)}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
    out.push({
      id, role: clean(j.role), client: discreet ? "Client · discreet" : clean(j.client, 60), discreet,
      location: clean(j.location, 60), status: "active",
      since: String(mine.since ?? ""), roleOnJob: String(mine.role_on_job ?? ""), standby: mine.role_on_job === "standby",
      coWorkers: (j.team ?? []).filter((t) => t !== mine).map((t) => ({ name: firstName(t.recruiter), roleOnJob: String(t.role_on_job ?? "") })).filter((t) => t.name),
      leads: (j.leads ?? []).filter((l) => l.url).map((l) => ({ title: clean(l.title, 60), url: String(l.url), count: typeof l.count === "number" ? l.count : null, built: l.built ?? null })),
      due: [], lastActivityAt: null, hubUpdated: j.updated ?? null,
    });
  }
  return out;
}

export function daysOn(since: string, now: Date): number {
  const s = Date.parse(since + (since.length === 10 ? "T00:00:00Z" : ""));
  return Number.isNaN(s) ? 0 : Math.max(0, Math.floor((now.getTime() - s) / 86400000));
}

export function jobWrites(jobs: DeskJob[], now: string): Write[] {
  return jobs.map((j) => ({ op: "set" as const, collection: "jobs", doc_id: j.id, data: { ...j, updated: now } }));
}

/* ---------- Dean's checklist rows for one new desk ---------- */

export function checklistRows(cfg: DeskConfig): { step: string; who: string; kind: string }[] {
  return [
    { step: `Stamp the desk: npm run recruiter-desk -- new ${cfg.slug}`, who: "Q", kind: "tool" },
    { step: `Publish ${cfg.first}'s desk as a private artifact and seed it (profile, training, JOs)`, who: "Radar (Kev's batched yes)", kind: "gate: publish" },
    { step: `Share the desk with ${cfg.first}'s work address only; no link sharing`, who: "Kev", kind: "gate: share" },
    { step: `Give ${cfg.first} view access to the lead-sheet Drive folder for their JOs`, who: "Nick", kind: "access" },
    { step: `Connector session at the desk: Claude sign-in, allow Claude on the page, connect Google Calendar, allow calendar (about 10 minutes)`, who: `${cfg.first} with Nick`, kind: "day one" },
    { step: `Day two: connect Gmail and allow mail (optional, unlocks inbox drafts)`, who: cfg.first, kind: "day two" },
    { step: `Watch the first check-out land (daily boxes in the desk) and log any friction`, who: "Dean and Q", kind: "check" },
  ];
}
