// The Eden Daily as data (Kev, 28 Oct 2026): the Command Center reads `daily/{YYYY-MM-DD}` instead of a PDF.
// Schema and rules: projects/virtual-office/daily-schema.md. Pure functions: no network, no writes. The CLI is workshop/office/daily.ts.
//
// The builder is a WHITELIST: it copies named fields out of the paper's data and nothing else, so a stray `salary`, `phone`,
// `email`, `gender` or `notes_from_crelate` key in the input can never reach the page. Free text is then scrubbed (emails, phone
// numbers, pay figures next to pay words, street addresses, health detail, discreet client names), and `assertSafe` re-checks
// the finished document as a backstop. A phone is only ever a flag: M, D, M D or a dash.
import { dayOfWeek } from "./office-game.js";

export const SCHEMA_VERSION = 1;

/** The Seven Pillars by weekday: Mon 01 ... Sun 07 (employees/_shared/eden-brand.md). */
export const PILLARS = [
  { n: 1, name: "Righteousness", verse: "Colossians 3:23" },
  { n: 2, name: "Winning", verse: "2 Timothy 4:7-8" },
  { n: 3, name: "Accountability", verse: "Matthew 12:36; James 5:16" },
  { n: 4, name: "Discipline", verse: "Proverbs 12:1" },
  { n: 5, name: "Transparency", verse: "Psalm 25:21" },
  { n: 6, name: "Growth", verse: "Psalm 78:72" },
  { n: 7, name: "Execution", verse: "Ecclesiastes 9:10" },
] as const;
export const pillarFor = (date: string) => PILLARS[(dayOfWeek(date) + 6) % 7]!;   // dayOfWeek: 0 = Sunday

/** The habit strip, in paper order. The writer only ever writes these blank; the check-out (or Kev's tick) fills them. */
export const HABIT_KEYS = ["bible", "rps", "mps", "workout", "drinks", "wisdom", "agency", "growth", "weight"] as const;
/** Kev's live marks (daily/{date}/ticks/{kind}-{ref}). `row` is one call-sheet row (d, v, c, out, note in ONE document, so the three taps never race). */
export const TICK_KINDS = ["must", "row", "touch", "habit", "scripture", "checkout"] as const;
export type TickKind = (typeof TICK_KINDS)[number];

// ---- the document ----
export type Lead = { id: string; addedAt: string | null; name: string; title: string; company: string; ph: string; src: string; crelateUrl: string | null; linkedin: string | null; note: string };
export type Sheet = { id: string; title: string; eyebrow: string; window: { pt: string; et: string }; tz: string; eastCoast: boolean; brief: string; opener: string; sub: string; url: string | null; leads: Lead[] };
export type RunItem = { at: string; title: string; note: string; powerHour: boolean; sheetId: string | null };
export type MustItem = { id: string; addedAt: string | null; at: string; title: string; note: string };
export type Decision = { id: string; text: string; pick: string; alertId: string | null };
export type QcItem = { id: string; addedAt: string | null; name: string; clientSeat: string; date: string; lastTouch: string; do: string; today: boolean; group: string; asOf: string };
export type Study = { ref: string; text: string; setting: string; words: { word: string; orig: string; note: string }[]; reflect: string[]; prayer: string; memory: string };
export type DailyDoc = {
  schema: number; date: string; dow: string; label: string;
  pillar: { n: number; name: string; verse: string }; scripture: string;
  habits: Record<string, string>; streaks: Record<string, number | null>;
  run: RunItem[]; must: MustItem[]; decisions: Decision[]; qc: QcItem[]; sheets: Sheet[]; study: Study | null;
  sources: string[]; builtAt: string; builtBy: string;
};

// ---- the input: the paper's own data, dumped by the stand-up build (all optional unless noted) ----
export type PaperInput = {
  scripture?: string;
  discreetClients?: string[];                       // names to scrub from every text field
  habits?: Record<string, string>;
  streaks?: Record<string, number | null>;          // from the past check-out rows; null or absent = not logged (never inferred)
  run?: { at: string; title: string; note?: string; powerHour?: boolean; sheetId?: string }[];
  must?: { at: string; title: string; note?: string }[];
  decisions?: { text: string; pick?: string; alertId?: string }[];
  qc?: { name: string; client?: string; seat?: string; clientSeat?: string; discreet?: boolean; date?: string; lastTouch?: string; do?: string; today?: boolean; group?: string; asOf?: string }[];
  sheets?: { id: string; title: string; eyebrow?: string; window: { pt: string; et?: string }; sub?: string; url?: string; eastCoast?: boolean; tz?: string; brief?: string; opener?: string;
    leads: { name: string; title?: string; company?: string; ph?: string; src?: string; crelateUrl?: string; linkedin?: string; note?: string }[] }[];
  study?: { ref: string; text?: string; setting?: string; words?: { word: string; orig?: string; note?: string }[]; reflect?: string[]; prayer?: string; memory?: string };
  sources?: string[];
};

export type BuildOpts = { now?: Date; builtBy?: string; existing?: Partial<DailyDoc> | null };
export type BuildResult = { doc: DailyDoc; redactions: string[]; warnings: string[] };

// ---- scrubbing ----
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RUN = /\(?\+?\d[\d\s().-]{5,}\d/g;
const ADDRESS = /\b\d{1,5}\s+(?:[NSEW]\.?\s+)?[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Pl|Place|Cir|Circle)\b\.?/g;
const PAY_WORDS = /\b(salary|salaries|compensation|comp|base|bonus|commission|ote|wages?|hourly|sign-on|per diem|take-home)\b/i;
const MONEY = /\$\s?\d[\d,]*(?:\.\d+)?\s?[kKmM]?\b|\b\d{2,3}\s?[kK]\b|\b\d{2,3},\d{3}\b|\b\d{5,6}\b/g;
/** Broad: for Kev's own schedule, decisions and candidate touch notes, where any medical word means personal detail. */
const HEALTH = /\b(diagnos\w*|disease|cancer|chemo\w*|surgery|surgical|medication|prescription|therap(?:y|ist)|mental health|depress\w*|anxiety|injur\w*|pregnan\w*|hospital\w*|illness|sick|doctor|physician|dentist|dental|biopsy|thyroid|hyperthyroid\w*|graves'? disease|diabet\w*|blood pressure|clinic|cardiolog\w*|rehab)\b/i;
/** Narrow: for lead sheets and sheet copy, where "hospital" or "clinic" is a building type, not a person. */
const HEALTH_NARROW = /\b(diagnos\w*|surgery|chemo\w*|cancer|medication|prescription|pregnan\w*|illness|medical leave|disabilit\w*)\b/i;
const EEO = /\b(ethnicity|ethnic|gender|disabilit\w*)\b/i;
const FORBIDDEN_KEY = /^(salary|comp|compensation|pay|rate|bonus|commission|phone|mobile|cell|email|ssn|address|gender|ethnicity|race|disability|dob|birthdate|health)$/i;

/** Stateless test for the /g patterns. */
function has(re: RegExp, s: string): boolean { re.lastIndex = 0; const r = re.test(s); re.lastIndex = 0; return r; }

/** Digits-only length of a phone-looking run, ignoring ISO dates. */
function phoneRuns(s: string): string[] {
  return (s.match(PHONE_RUN) ?? []).filter((m) => !ISO_DATE.test(m.trim()) && m.replace(/\D/g, "").length >= 7);
}

type Redactor = { log: string[]; discreet: RegExp | null };
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type Health = "broad" | "narrow" | "off";
/** One free-text field: strip what must never reach the page, log each redaction by field and reason (never the content).
 *  health: "broad" for Kev's schedule, decisions and touch notes (the whole field is replaced by `blank`); "narrow" for notes on leads and sheets;
 *  "off" for names, titles and companies, where "Graves" or "Hospital Corp" is just a name. */
function clean(rx: Redactor, path: string, v: unknown, max: number, health: Health = "narrow", blank = ""): string {
  let t = String(v ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (health !== "off" && (has(health === "broad" ? HEALTH : HEALTH_NARROW, t) || has(EEO, t))) { rx.log.push(`${path}: health or EEO detail`); return blank; }
  if (rx.discreet && has(rx.discreet, t)) { rx.log.push(`${path}: discreet client name`); t = t.replace(rx.discreet, "Client · discreet"); }
  if (has(EMAIL, t)) { rx.log.push(`${path}: email`); t = t.replace(EMAIL, "[email]"); }
  if (phoneRuns(t).length) { rx.log.push(`${path}: phone number`); for (const m of phoneRuns(t)) t = t.replace(m, "[number]"); }
  if (has(ADDRESS, t)) { rx.log.push(`${path}: street address`); t = t.replace(ADDRESS, "[address]"); }
  if (has(PAY_WORDS, t) && has(MONEY, t)) { rx.log.push(`${path}: pay figure`); t = t.replace(MONEY, "[amount]"); }
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

// ---- field normalizers ----
class InputError extends Error {}
const bad = (msg: string): never => { throw new InputError(msg); };

/** "07:00", "7:00 am" or "1:30 pm" -> "HH:MM" Pacific. A bare "7:00" is ambiguous and refused. */
export function hhmm(v: unknown, path: string): string {
  const s = String(v ?? "").trim();
  let m = /^(\d{2}):(\d{2})$/.exec(s);
  if (m) { const h = Number(m[1]), mi = Number(m[2]); if (h > 23 || mi > 59) bad(`${path}: "${s}" is not a time`); return s; }
  m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s);
  if (m) {
    let h = Number(m[1]); const mi = Number(m[2]), pm = m[3]!.toLowerCase() === "pm";
    if (h < 1 || h > 12 || mi > 59) bad(`${path}: "${s}" is not a time`);
    if (h === 12) h = 0;
    if (pm) h += 12;
    return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
  }
  return bad(`${path}: "${s}" is ambiguous. Use 24-hour "13:00" or "1:00 pm".`);
}
const addHours = (t: string, h: number) => { const [hh, mm] = t.split(":").map(Number) as [number, number]; return `${String((hh + h + 24) % 24).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; };
const range = (v: string, path: string) => { const p = v.split(/\s*[-–]\s*/); if (p.length !== 2) bad(`${path}: "${v}" is not a range like 11:00-12:00`); return [hhmm(p[0], path), hhmm(p[1], path)] as const; };

/** A phone is a flag and nothing else. Anything with digits in it is refused, never guessed at. */
export function phoneFlag(v: unknown, who: string): string {
  const s = String(v ?? "").trim();
  if (!s || /^[-—–]+$/.test(s)) return "—";
  if (!/^[MD](?:[\s/,&]+[MD])?$/i.test(s)) return bad(`${who}: phone must be a flag (M, D, M D or —), got "${s.replace(/\d/g, "#")}"`);
  const set = new Set(s.toUpperCase().match(/[MD]/g));
  return ["M", "D"].filter((x) => set.has(x)).join(" ");
}

function safeUrl(v: unknown, hosts: RegExp, who: string): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  let u: URL;
  try { u = new URL(s); } catch { return bad(`${who}: "${s.slice(0, 40)}" is not a URL`); }
  if (u.protocol !== "https:" || !hosts.test(u.hostname)) return bad(`${who}: link host ${u.hostname} is not allowed`);
  if (has(EMAIL, s)) return bad(`${who}: link carries an email`);
  return u.toString();
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function buildDaily(date: string, input: PaperInput, opts: BuildOpts = {}): BuildResult {
  if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) bad(`date "${date}" must be YYYY-MM-DD`);
  const now = opts.now ?? new Date();
  const discreet = (input.discreetClients ?? []).map((s) => s.trim()).filter(Boolean);
  const rx: Redactor = { log: [], discreet: discreet.length ? new RegExp(discreet.map(esc).join("|"), "gi") : null };
  const warnings: string[] = [];
  const dow = DOW_NAMES[dayOfWeek(date)]!;

  // A rebuild over an existing document (a sweep adding a hot callback at 11:40) stamps the items that were not there before.
  const had = (list: { id: string; addedAt?: string | null }[] | undefined) => new Map((list ?? []).map((x) => [x.id, x.addedAt ?? null] as const));
  const hadMust = had(opts.existing?.must), hadQc = had(opts.existing?.qc), hadLead = had(opts.existing?.sheets?.flatMap((x) => x.leads));
  const stamp = (seen: Map<string, string | null>, id: string, on: boolean): string | null => (!on ? null : seen.has(id) ? seen.get(id)! : now.toISOString());

  const run: RunItem[] = (input.run ?? []).map((r, i) => {
    const title = clean(rx, `run[${i}].title`, r.title, 160, "broad", "Private appointment");
    return { at: hhmm(r.at, `run[${i}].at`), title, note: title === "Private appointment" ? "" : clean(rx, `run[${i}].note`, r.note, 240, "broad"), powerHour: !!r.powerHour, sheetId: r.sheetId ? slug(r.sheetId) : null };
  }).sort((a, b) => a.at.localeCompare(b.at));

  const must: MustItem[] = (input.must ?? []).map((m, i) => ({
    id: `m${i + 1}`, addedAt: stamp(hadMust, `m${i + 1}`, !!opts.existing?.must?.length), at: hhmm(m.at, `must[${i}].at`), title: clean(rx, `must[${i}].title`, m.title, 160, "broad", "Private item"), note: clean(rx, `must[${i}].note`, m.note, 240, "broad"),
  }));

  const decisions: Decision[] = (input.decisions ?? []).map((d, i) => ({
    id: `d${i + 1}`, alertId: d.alertId ? slug(d.alertId) : null, text: clean(rx, `decisions[${i}].text`, d.text, 320, "broad", "Private item"), pick: clean(rx, `decisions[${i}].pick`, d.pick, 240, "broad"),
  }));

  const qc: QcItem[] = (input.qc ?? []).map((q, i) => {
    // A discreet client is "Client · discreet" and its name never reaches the page; the seat can stay.
    const seat = clean(rx, `qc[${i}].seat`, q.seat, 80, "off");
    const clientSeat = q.discreet ? `Client · discreet${seat ? ` · ${seat}` : ""}` : clean(rx, `qc[${i}].clientSeat`, q.clientSeat ?? [q.client, q.seat].filter(Boolean).join(" · "), 120, "off");
    return {
      id: `q${i + 1}`, addedAt: stamp(hadQc, `q${i + 1}`, !!opts.existing?.qc?.length), name: clean(rx, `qc[${i}].name`, q.name, 80, "off"), clientSeat, date: clean(rx, `qc[${i}].date`, q.date, 60), lastTouch: clean(rx, `qc[${i}].lastTouch`, q.lastTouch, 80, "broad"),
      do: clean(rx, `qc[${i}].do`, q.do, 240, "broad"), today: !!q.today, group: clean(rx, `qc[${i}].group`, q.group, 60), asOf: clean(rx, `qc[${i}].asOf`, q.asOf, 20),
    };
  });

  const sheets: Sheet[] = (input.sheets ?? []).map((s, si) => {
    const id = slug(s.id) || bad(`sheets[${si}].id is empty`);
    const [ps, pe] = range(s.window.pt, `sheets[${si}].window.pt`);
    const [es, ee] = s.window.et ? range(s.window.et, `sheets[${si}].window.et`) : [addHours(ps, 3), addHours(pe, 3)];
    if (s.eastCoast && ps > "13:00") warnings.push(`sheet ${id}: East Coast Power Hour starts ${ps} PT, after the 1:00 PT limit`);
    const leads: Lead[] = (s.leads ?? []).map((l, li) => {
      const who = `sheets[${si}].leads[${li}] (${String(l.name ?? "?").slice(0, 30)})`;
      return {
        id: `${id}-${String(li + 1).padStart(2, "0")}`, addedAt: stamp(hadLead, `${id}-${String(li + 1).padStart(2, "0")}`, hadLead.size > 0), name: clean(rx, `${who}.name`, l.name, 80, "off"), title: clean(rx, `${who}.title`, l.title, 120, "off"), company: clean(rx, `${who}.company`, l.company, 80, "off"),
        ph: phoneFlag(l.ph, who), src: clean(rx, `${who}.src`, l.src, 12, "off"),
        crelateUrl: safeUrl(l.crelateUrl, /(^|\.)crelate\.com$/i, `${who}.crelateUrl`), linkedin: safeUrl(l.linkedin, /(^|\.)linkedin\.com$/i, `${who}.linkedin`),
        note: clean(rx, `${who}.note`, l.note, 160),
      };
    });
    return {
      id, title: clean(rx, `sheets[${si}].title`, s.title, 120), eyebrow: clean(rx, `sheets[${si}].eyebrow`, s.eyebrow, 120), window: { pt: `${ps}-${pe}`, et: `${es}-${ee}` },
      tz: clean(rx, `sheets[${si}].tz`, s.tz ?? (s.eastCoast ? "ET" : "PT"), 4, "off"), eastCoast: !!s.eastCoast,
      brief: clean(rx, `sheets[${si}].brief`, s.brief, 600), opener: clean(rx, `sheets[${si}].opener`, s.opener, 400),
      sub: clean(rx, `sheets[${si}].sub`, s.sub, 400), url: safeUrl(s.url, /(^|\.)(google\.com|claude\.ai)$/i, `sheets[${si}].url`), leads,
    };
  });
  for (const r of run) if (r.sheetId && !sheets.some((s) => s.id === r.sheetId)) warnings.push(`run item "${r.title.slice(0, 40)}" points at sheet ${r.sheetId}, which is not in sheets`);

  const st = input.study;
  const study: Study | null = st ? {
    ref: clean(rx, "study.ref", st.ref, 60), text: clean(rx, "study.text", st.text, 1500), setting: clean(rx, "study.setting", st.setting, 2500),
    words: (st.words ?? []).map((w, i) => ({ word: clean(rx, `study.words[${i}].word`, w.word, 80), orig: clean(rx, `study.words[${i}].orig`, w.orig, 80), note: clean(rx, `study.words[${i}].note`, w.note, 900) })),
    reflect: (st.reflect ?? []).map((q, i) => clean(rx, `study.reflect[${i}]`, q, 500)),
    prayer: clean(rx, "study.prayer", st.prayer, 1200), memory: clean(rx, "study.memory", st.memory, 500),
  } : null;

  // Habits start blank. A rebuild keeps anything the check-out or Kev has already filled in.
  const habits: Record<string, string> = Object.fromEntries(HABIT_KEYS.map((k) => [k, ""]));
  for (const [k, v] of Object.entries({ ...(input.habits ?? {}), ...(opts.existing?.habits ?? {}) })) if ((HABIT_KEYS as readonly string[]).includes(k) && String(v ?? "").trim()) habits[k] = clean(rx, `habits.${k}`, v, 40);

  // Streaks come from the past check-out rows. Absent or null stays null: a blank is a blank, never a guess.
  const streaks: Record<string, number | null> = Object.fromEntries(HABIT_KEYS.map((k) => {
    const n = input.streaks?.[k];
    return [k, typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 9999 ? n : null];
  }));

  const m = Number(date.slice(5, 7)), d = Number(date.slice(8, 10));
  const doc: DailyDoc = {
    schema: SCHEMA_VERSION, date, dow, label: `${dow}, ${MONTHS[m - 1]} ${d}`,
    pillar: { ...pillarFor(date) }, scripture: clean(rx, "scripture", input.scripture ?? st?.ref, 80),
    habits, streaks, run, must, decisions, qc, sheets, study,
    sources: (input.sources ?? []).map((s, i) => clean(rx, `sources[${i}]`, s, 160)).filter(Boolean),
    builtAt: now.toISOString(), builtBy: opts.builtBy ?? "radar",
  };
  assertSafe(doc);
  return { doc, redactions: rx.log, warnings };
}

/** The backstop. Throws if anything that must never reach the page is in the finished document. Link fields are checked by host, not text. */
export function assertSafe(doc: unknown): void {
  const problems: string[] = [];
  const walk = (v: unknown, path: string, key = ""): void => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`, key));
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) { if (FORBIDDEN_KEY.test(k)) problems.push(`${path}.${k}: forbidden field`); walk(x, path ? `${path}.${k}` : k, k); }
      return;
    }
    if (typeof v !== "string" || key === "crelateUrl" || key === "linkedin" || key === "url") return;
    if (has(EMAIL, v)) problems.push(`${path}: email`);
    if (phoneRuns(v).length) problems.push(`${path}: phone number`);
    if (has(ADDRESS, v)) problems.push(`${path}: street address`);
    if (has(PAY_WORDS, v) && has(MONEY, v)) problems.push(`${path}: pay figure`);
    if (has(HEALTH_NARROW, v) || has(EEO, v)) problems.push(`${path}: health or EEO detail`);
    if (key === "ph" && !/^(—|M|D|M D)$/.test(v)) problems.push(`${path}: phone is not a flag`);
  };
  walk(doc, "");
  if (problems.length) throw new InputError(`daily document is not safe to write:\n  ${problems.join("\n  ")}`);
}

// ---- Kev's live marks: daily/{date}/ticks/{kind}-{ref} (written by the page and the check-out, never by this builder) ----
//   must       ref = a must id (m1)          value true|false
//   row        ref = a lead id (vmg-est-precon-07)   d, v, c booleans; out "" | "O" | "F.U."; note text. Dial, VM, Conn and the stamp are ONE document.
//   touch      ref = a qc id (q3)            value true|false (the page also files an actions/ row so Radar clears the Team Hub touch)
//   habit      ref = a HABIT_KEYS key        value text or number as Kev enters it
//   scripture  ref = "read"                  value true|false (feeds the Bible habit)
//   checkout   ref = rps | conn | win | miss | note | sent     value number, text or true
// Counts (connections, dials, RPs) are derived from the ticks and never stored. `at` is the time of the last change; the latest write wins.
export type Tick = { kind: TickKind; ref: string; at: string; value?: boolean | number | string; d?: boolean; v?: boolean; c?: boolean; out?: "" | "O" | "F.U."; note?: string };
/** The document id of a tick: one per thing ticked, so a re-tick overwrites and the nightly writer can never touch it. */
export const tickId = (kind: TickKind, ref: string) => `${kind}-${ref}`;
export function checkTick(t: Tick): void {
  if (!(TICK_KINDS as readonly string[]).includes(t.kind)) bad(`tick kind "${t.kind}" is not one of ${TICK_KINDS.join(", ")}`);
  if (!/^[A-Za-z0-9_.~:@+-]{1,120}$/.test(t.ref) || /^\.\.?$/.test(t.ref)) bad(`tick ref "${t.ref}" is not a valid id`);
  if (Number.isNaN(Date.parse(t.at))) bad(`tick at "${t.at}" is not a time`);
  if (t.kind === "habit" && !(HABIT_KEYS as readonly string[]).includes(t.ref)) bad(`habit tick ref "${t.ref}" is not one of ${HABIT_KEYS.join(", ")}`);
  if (t.kind === "row") {
    for (const k of ["d", "v", "c"] as const) if (t[k] !== undefined && typeof t[k] !== "boolean") bad(`row tick ${k} must be true or false`);
    if (t.out !== undefined && !["", "O", "F.U."].includes(t.out)) bad(`row tick out "${t.out}" must be "", "O" or "F.U."`);
    if (t.note !== undefined && (typeof t.note !== "string" || t.note.length > 600)) bad("row tick note must be text of 600 characters or fewer");
  }
}

/** The ArtifactData batch for one day. `version` is the existing document's version, or undefined when it is new. */
export function writesFor(date: string, filePath: string, version?: number) {
  return [{ op: "set" as const, collection: "daily", doc_id: date, file_path: filePath, ...(version !== undefined ? { if_version: version } : {}) }];
}
export { InputError };
