// Turns a lead sheet (CSV or XLSX) into a normalized CloudTalk load plan.
// Pure and offline: it reads sheets and optional snapshots of what CloudTalk and Crelate already hold, and it never
// calls either system. The nightly routine does the lookups and the load; this decides what to load and why not.
//
// Rules this file enforces (spec: projects/cloudtalk-nightly/brief.md):
//  - ZoomInfo phones never load. A phone is blocked when its column, its row source or its phone-source says ZoomInfo.
//  - No usable phone, no load: the row goes to the "no phone" list that is drafted back to Nida.
//  - Column allowlist, never copy-then-drop. Salary, EEO, home address and personal email columns are named in the
//    report (header only) and their values are never read into the plan.
//  - The CLI report and the closing summary carry counts and names, never phone digits.
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { parseCsv } from "./csv.ts";
import { readXlsx } from "./xlsx.ts";

export type Role =
  | "name" | "first" | "last" | "title" | "company" | "phone" | "phone_source" | "email" | "linkedin" | "city" | "state"
  | "location" | "tz" | "source" | "owner" | "suggested_owner" | "client" | "jo" | "crelate" | "blocked" | "ignored";

export type Sheet = {
  file: string;
  /** 1-based sheet row number of the header row (rows above it are preamble notes). */
  headerRow: number;
  header: string[];
  preamble: string[];
  rows: { n: number; cells: string[] }[];
};

export type CloudTalkContact = { id: number | string; name?: string; phones?: string[]; emails?: string[] };
export type CrelateContact = { id: string; name: string; company?: string; linkedin?: string; owner?: string; last_activity?: string };

export type Options = {
  owner?: string;
  client?: string;
  jo?: string;
  /** YYYY-MM-DD; falls back to the file name prefix, then today. */
  date?: string;
  today?: string;
  /** Mark only the first N loadable rows for loading; the rest are deferred (the 10-row test). */
  limit?: number;
  /** Extra tags on every loaded row, for example "Q Test Load" on the 10-row test so a second test can be refused. */
  extraTags?: string[];
  cloudtalk?: CloudTalkContact[];
  crelate?: CrelateContact[];
};

export type CreateArgs = {
  name: string;
  company?: string;
  title?: string;
  city?: string;
  state?: string;
  website?: string;
  source: string;
  phone_numbers: string[];
  emails: string[];
  tags: string[];
};

export type LoadItem = {
  ref: { file: string; row: number };
  /** Exactly the arguments for cloudtalk_create_contact. */
  create: CreateArgs;
  meta: { time_zone?: string; crelate?: { id?: string; owner?: string; last_activity?: string; note?: string; matched_by: string } };
};

export type NoPhone = { ref: { file: string; row: number }; name: string; title?: string; company?: string; city?: string; state?: string; jo?: string; reason: "none" | "zoominfo" | "invalid" | "zoominfo_and_invalid" };
export type Skipped = { ref: { file: string; row: number }; name: string; reason: "no_name" | "client_staff" | "duplicate_in_sheet" | "deferred_by_limit"; detail?: string };
export type TagExisting = { ref: { file: string; row: number }; name: string; contact_id: number | string; matched_by: "phone" | "email"; tags: string[] };

export type BatchInfo = { file: string; header_row: number; rows: number; client?: string; jo?: string; owner?: string; date: string; tags_common: string[]; roles: Record<string, string>; blocked_columns: string[]; ignored_columns: string[]; warnings: string[] };

export type Plan = {
  version: 1;
  mode: "dry-run";
  generated: string;
  rules: string[];
  batches: BatchInfo[];
  summary: {
    rows: number; load: number; no_phone: number; zoominfo_phones_blocked: number; invalid_phones: number; exists_in_cloudtalk: number;
    duplicate_in_sheet: number; client_staff: number; no_name: number; deferred_by_limit: number; in_crelate: number;
    cloudtalk_dedupe: "ran" | "not run (no CloudTalk snapshot supplied)"; crelate_dedupe: "ran" | "not run (no Crelate snapshot supplied)";
  };
  load: LoadItem[];
  tag_existing: TagExisting[];
  no_phone: NoPhone[];
  skipped: Skipped[];
  /** What the routine must look up before it trusts the dedupe (loadable and no-phone rows only). */
  lookups: { phones: string[]; emails: string[]; names: { name: string; company?: string }[] };
};

export const RULES = [
  "ZoomInfo phones never load.",
  "A row with no usable phone does not load; it goes back to Nida.",
  "Only allowlisted columns are read. Salary, EEO, home address and personal email columns are never read.",
  "Nothing is written to CloudTalk or Crelate by this tool.",
];

// ---------- reading ----------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Header labels that mark a column as one of the roles; checked in this order. */
export function classifyHeader(raw: string): Role {
  const h = norm(raw);
  if (!h || h === "#" || h === "no" || h === "row") return "ignored";
  const isEmail = /\be ?mail\b|\bemail\b/.test(h);
  if (/\b(home|personal|private)\b/.test(h) || /\b(salary|compensation|comp|bonus|ethnicity|ethnic|race|gender|sex|disability|disabled|veteran|dob|birthday|birth|age|ssn|social|marital|street|mailing)\b/.test(h)) return "blocked";
  if (/\baddress\b/.test(h) && !isEmail) return "blocked";
  if (/\bphone\b.*\bsource\b|\bsource\b.*\bphone\b|\bphone from\b/.test(h)) return "phone_source";
  if (isEmail) return "email";
  if (/\b(phone|mobile|cell|direct|tel|telephone)\b/.test(h)) return "phone";
  if (/\blinkedin\b/.test(h)) return "linkedin";
  if (/^(in )?crelate\b/.test(h)) return "crelate";
  if (/^suggested (owner|recruiter)\b/.test(h)) return "suggested_owner";
  if (/^(owner|recruiter|assigned to|assigned recruiter|recruiter owner)$/.test(h)) return "owner";
  if (/^(client|client name)$/.test(h)) return "client";
  if (/^(jo|job order|job|jo name|search|req|requisition)$/.test(h)) return "jo";
  if (/^(name|full name|candidate|candidate name|contact|contact name)$/.test(h)) return "name";
  if (/^(first name|first|given name)$/.test(h)) return "first";
  if (/^(last name|last|surname|family name)$/.test(h)) return "last";
  if (/^(title|job title|current title|position|current position|candidate title)$/.test(h)) return "title";
  if (/^(company|employer|current company|organization|organisation|company name)$/.test(h)) return "company";
  if (/^(city|town)$/.test(h)) return "city";
  if (/^(state|st|state province|province)$/.test(h)) return "state";
  if (/^(location|city state|metro)$/.test(h)) return "location";
  if (/^(time zone|timezone|tz)$/.test(h)) return "tz";
  if (/^source$/.test(h)) return "source";
  return "ignored";
}

const NAME_ROLES = new Set<Role>(["name", "first"]);

function looksLikeHeader(cells: string[]): boolean {
  const roles = cells.map(classifyHeader);
  return roles.some((r) => NAME_ROLES.has(r)) && roles.filter((r) => r !== "ignored").length >= 2;
}

export function sheetFromRows(file: string, all: string[][]): Sheet {
  let h = -1;
  for (let i = 0; i < Math.min(all.length, 8); i++) if (looksLikeHeader(all[i]!)) { h = i; break; }
  if (h < 0) throw new Error(`${basename(file)}: no header row found (need a Name or First Name column and one more known column)`);
  const rows = [];
  for (let i = h + 1; i < all.length; i++) {
    const cells = all[i]!;
    if (cells.every((c) => !c.trim())) continue;
    rows.push({ n: i + 1, cells });
  }
  return {
    file: basename(file),
    headerRow: h + 1,
    header: all[h]!.map((c) => c.trim()),
    preamble: all.slice(0, h).flat().map((c) => c.trim()).filter(Boolean),
    rows,
  };
}

export function readSheet(path: string, sheetName?: string): Sheet {
  const ext = extname(path).toLowerCase();
  let all: string[][];
  if (ext === ".csv" || ext === ".txt") all = parseCsv(readFileSync(path, "utf8"));
  else if (ext === ".xlsx" || ext === ".xlsm") all = readXlsx(path, sheetName);
  else throw new Error(`${basename(path)}: only .csv and .xlsx lead sheets are supported`);
  return sheetFromRows(path, all);
}

// ---------- normalizers ----------

const ZI = /zoom\s*info|\bzi\b/i;

export type PhoneResult = { e164?: string; invalid?: true };

/** US/Canada numbers to E.164. International numbers must carry a +. Extensions are dropped (CloudTalk has no field for them). */
export function normalizePhone(raw: string): PhoneResult {
  let s = raw.trim();
  if (!s) return {};
  s = s.replace(/\s*(?:ext\.?|extension|x|#)\s*\d{1,6}\s*$/i, "");
  const plus = s.startsWith("+");
  const digits = s.replace(/\D/g, "");
  if (!digits) return { invalid: true };
  const nanp = (d: string): PhoneResult =>
    /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(d) && !/^(\d)\1{9}$/.test(d) ? { e164: `+1${d}` } : { invalid: true };
  if (plus) {
    if (digits.startsWith("1")) return digits.length === 11 ? nanp(digits.slice(1)) : { invalid: true };
    return digits.length >= 8 && digits.length <= 15 ? { e164: `+${digits}` } : { invalid: true };
  }
  if (digits.length === 10) return nanp(digits);
  if (digits.length === 11 && digits.startsWith("1")) return nanp(digits.slice(1));
  return { invalid: true };
}

export function splitPhones(cell: string): string[] {
  return cell.split(/[;\n|]|\s\/\s|\s+or\s+/i).map((p) => p.trim()).filter(Boolean);
}

const TZ_MAP: [RegExp, string][] = [
  [/^(pst|pdt|pt|pacific)\b/i, "PST"],
  [/^(mst|mdt|mt|mountain)\b/i, "MST"],
  [/^(cst|cdt|ct|central)\b/i, "CST"],
  [/^(est|edt|et|eastern)\b/i, "EST"],
];
export function normalizeTz(raw: string): string | undefined {
  const s = raw.trim();
  for (const [re, v] of TZ_MAP) if (re.test(s)) return v;
  return undefined;
}

const ACRONYMS = new Set(["PM", "PE", "PX", "MD", "DC", "VDC", "BIM", "WPB", "FL", "TI", "MEP", "APM", "GC", "VMG", "PB", "HSI", "EVP", "VP", "CM", "QA", "QC", "HVAC", "IT", "NYC", "LA", "TX", "ID", "AZ", "CA", "GA", "NC", "SC", "VA", "MD", "DE", "WA", "OR", "CO", "UT", "NV", "TN"]);
const SMALL = new Set(["and", "of", "the", "for", "in", "at", "to"]);
export function titleCase(slug: string): string {
  return slug.split(/[\s_-]+/).filter(Boolean).map((w, i) => {
    const up = w.toUpperCase();
    if (ACRONYMS.has(up)) return up;
    if (i > 0 && SMALL.has(w.toLowerCase())) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(" ");
}

/** File-name slugs that start a lead sheet name, longest first. The value is the client label used in tags. */
const CLIENT_SLUGS: [string, string][] = [
  ["pb-south", "PB South"],
  ["prometheus", "Prometheus"],
  ["hoffman", "Hoffman"],
  ["triton", "Triton"],
  ["moss", "Moss"],
  ["baker", "Baker"],
  ["vmg", "VMG"],
];

export function fromFileName(file: string): { date?: string; client?: string; role?: string } {
  const stem = basename(file, extname(file));
  const dm = /^(\d{4}-\d{2}-\d{2})-(.*)$/.exec(stem);
  const date = dm?.[1];
  const rest = (dm?.[2] ?? stem).toLowerCase();
  for (const [slug, label] of CLIENT_SLUGS) {
    if (rest === slug || rest.startsWith(`${slug}-`)) return { date, client: label, role: titleCase(rest.slice(slug.length + 1)) || undefined };
  }
  return { date };
}

export function linkedinProfileKey(url: string): string | undefined {
  const m = /linkedin\.com\/in\/([^/?#\s]+)/i.exec(url.trim());
  return m ? `in/${decodeURIComponent(m[1]!).toLowerCase()}` : undefined;
}

const CORP = new Set(["inc", "llc", "co", "corp", "corporation", "company", "ltd", "lp", "llp", "the", "group", "holdings"]);
const NAME_SUFFIX = new Set(["jr", "sr", "ii", "iii", "iv", "phd", "pe", "pmp"]);
export function nameKey(name: string): string {
  const toks = norm(name).split(" ").filter((t) => t.length > 1 && !NAME_SUFFIX.has(t));
  return toks.join(" ");
}
export function companyKey(c: string): string {
  return norm(c).split(" ").filter((t) => t && !CORP.has(t)).join(" ");
}
const nameCompanyKey = (name: string, company?: string) => (company ? `${nameKey(name)}|${companyKey(company)}` : undefined);

const clean = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
const cap = (s: string | undefined, n: number, warn: (m: string) => void, label: string): string | undefined => {
  const v = clean(s);
  if (!v) return undefined;
  if (v.length > n) { warn(`${label} cut to ${n} characters`); return v.slice(0, n); }
  return v;
};

export function makeTag(prefix: string, value: string): string | undefined {
  const v = clean(value).replace(/[,;|]/g, " ").replace(/\s+/g, " ");
  if (!v) return undefined;
  return `${prefix} ${v}`.slice(0, 60);
}

// ---------- the plan ----------

function parseLocation(loc: string): { city?: string; state?: string } {
  const m = /^(.+?),\s*([A-Za-z]{2})\b/.exec(loc.trim());
  return m ? { city: clean(m[1]), state: m[2]!.toUpperCase() } : { city: clean(loc) || undefined };
}

export function buildPlan(sheets: Sheet[], opts: Options = {}): Plan {
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const plan: Plan = {
    version: 1, mode: "dry-run", generated: new Date().toISOString(), rules: RULES, batches: [],
    summary: {
      rows: 0, load: 0, no_phone: 0, zoominfo_phones_blocked: 0, invalid_phones: 0, exists_in_cloudtalk: 0, duplicate_in_sheet: 0,
      client_staff: 0, no_name: 0, deferred_by_limit: 0, in_crelate: 0,
      cloudtalk_dedupe: opts.cloudtalk ? "ran" : "not run (no CloudTalk snapshot supplied)",
      crelate_dedupe: opts.crelate ? "ran" : "not run (no Crelate snapshot supplied)",
    },
    load: [], tag_existing: [], no_phone: [], skipped: [], lookups: { phones: [], emails: [], names: [] },
  };

  const ctByPhone = new Map<string, CloudTalkContact>();
  const ctByEmail = new Map<string, CloudTalkContact>();
  for (const c of opts.cloudtalk ?? []) {
    for (const p of c.phones ?? []) { const n = normalizePhone(p).e164; if (n) ctByPhone.set(n, c); }
    for (const e of c.emails ?? []) ctByEmail.set(e.trim().toLowerCase(), c);
  }
  const crByLinkedin = new Map<string, CrelateContact>();
  const crByNameCo = new Map<string, CrelateContact>();
  for (const c of opts.crelate ?? []) {
    const lk = c.linkedin ? linkedinProfileKey(c.linkedin) : undefined;
    if (lk) crByLinkedin.set(lk, c);
    const k = nameCompanyKey(c.name, c.company);
    if (k) crByNameCo.set(k, c);
  }

  /** key -> first sighting, for duplicates inside the sheets being planned. */
  const seen = new Map<string, string>();
  let loadable = 0;
  const lookupPhones = new Set<string>();
  const lookupEmails = new Set<string>();

  for (const sheet of sheets) {
    const warnings: string[] = [];
    const warn = (m: string) => { if (!warnings.includes(m)) warnings.push(m); };
    const roles = sheet.header.map(classifyHeader);
    const idx = (r: Role) => roles.flatMap((x, i) => (x === r ? [i] : []));
    const first = (r: Role) => idx(r)[0];
    const blocked = sheet.header.filter((_, i) => roles[i] === "blocked");
    const ignored = sheet.header.filter((_, i) => roles[i] === "ignored" && sheet.header[i]);
    const fn = fromFileName(sheet.file);
    const date = opts.date ?? fn.date ?? today;
    const clientCol = first("client");
    const joCol = first("jo");
    const ownerCol = first("owner");
    const batchClient = opts.client ?? fn.client;
    const batchJo = opts.jo ?? (fn.client && fn.role ? `${fn.client} ${fn.role}` : fn.role);
    const batchOwner = opts.owner;
    if (!batchClient && clientCol === undefined) warn("no client found (file name, option or column): rows load without a Client tag");
    if (!batchJo && joCol === undefined) warn("no JO found (file name, option or column): rows load without a JO tag");
    if (!batchOwner && ownerCol === undefined) warn("no owner on this sheet: rows load without an Owner tag until Kev assigns one");
    if (!first("name") && !first("first")) warn("no name column");
    const phoneCols = idx("phone");
    const zoomHeaderCols = new Set(phoneCols.filter((i) => ZI.test(sheet.header[i]!)));

    const batch: BatchInfo = {
      file: sheet.file, header_row: sheet.headerRow, rows: sheet.rows.length, client: batchClient, jo: batchJo, owner: batchOwner, date,
      tags_common: [], roles: Object.fromEntries(sheet.header.map((h, i) => [h, roles[i]!]).filter(([h]) => h)),
      blocked_columns: blocked, ignored_columns: ignored, warnings,
    };
    if (blocked.length) warn(`columns never read: ${blocked.join(", ")}`);
    plan.batches.push(batch);

    for (const { n, cells } of sheet.rows) {
      plan.summary.rows++;
      const get = (r: Role) => clean(cells[first(r) ?? -1]);
      const ref = { file: sheet.file, row: n };
      const nm = get("name") || clean(`${get("first")} ${get("last")}`);
      const company = get("company") || undefined;
      let city = get("city") || undefined;
      let state = get("state") || undefined;
      if (!city && !state && get("location")) ({ city, state } = parseLocation(get("location")));
      const title = get("title") || undefined;
      const rowClient = (clientCol !== undefined ? get("client") : "") || batchClient;
      const rowJo = (joCol !== undefined ? get("jo") : "") || batchJo;
      const rowOwner = (ownerCol !== undefined ? get("owner") : "") || batchOwner;

      const tz = get("tz") ? normalizeTz(get("tz")) : undefined;
      if (get("tz") && !tz) warn(`time zone "${get("tz")}" not recognised (PST, MST, CST, EST); no TZ tag for those rows`);
      const mkTags = (inCrelate: boolean) =>
        [
          rowOwner ? makeTag("Owner", rowOwner) : undefined,
          rowClient ? makeTag("Client", rowClient) : undefined,
          rowJo ? makeTag("JO", rowJo) : undefined,
          makeTag("Lead", date),
          tz ? makeTag("TZ", tz) : undefined,
          inCrelate ? "In Crelate" : undefined,
          ...(opts.extraTags ?? []).map((t) => clean(t)),
        ].filter((t): t is string => !!t);

      if (!nm) { plan.summary.no_name++; plan.skipped.push({ ref, name: "", reason: "no_name" }); continue; }
      if (rowClient && company && companyKey(company) === companyKey(rowClient)) {
        plan.summary.client_staff++;
        plan.skipped.push({ ref, name: nm, reason: "client_staff", detail: `works at ${rowClient}` });
        continue;
      }

      // phones: the allowlisted phone columns only, ZoomInfo-sourced values blocked
      // A "Phone Source" value, when the row has one, says where the phone came from and decides. Without it the row's own
      // Source decides, and a ZoomInfo row is blocked (the safe side: Nida adds a Phone Source to release her own numbers).
      const rowSourceZi = get("phone_source") ? ZI.test(get("phone_source")) : ZI.test(get("source"));
      let sawZi = false;
      let sawInvalid = false;
      const phones: string[] = [];
      for (const i of phoneCols) {
        for (const piece of splitPhones(cells[i] ?? "")) {
          if (zoomHeaderCols.has(i) || rowSourceZi) { sawZi = true; continue; }
          const r = normalizePhone(piece);
          if (r.e164) { if (!phones.includes(r.e164)) phones.push(r.e164); } else sawInvalid = true;
        }
      }
      if (sawZi) plan.summary.zoominfo_phones_blocked++;
      if (sawInvalid) plan.summary.invalid_phones++;

      const emails = [...new Set(idx("email").flatMap((i) => (cells[i] ?? "").split(/[;,\s]+/)).map((e) => e.trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))];
      const linkedinRaw = get("linkedin");
      const lkKey = linkedinRaw ? linkedinProfileKey(linkedinRaw) : undefined;

      if (!phones.length) {
        const ctByMail = emails.map((e) => ctByEmail.get(e)).find(Boolean);
        if (ctByMail) {
          plan.summary.exists_in_cloudtalk++;
          plan.tag_existing.push({ ref, name: nm, contact_id: ctByMail.id, matched_by: "email", tags: mkTags(false) });
          continue;
        }
        plan.summary.no_phone++;
        const reason = sawZi && sawInvalid ? "zoominfo_and_invalid" : sawZi ? "zoominfo" : sawInvalid ? "invalid" : "none";
        plan.no_phone.push({ ref, name: nm, title, company, city, state, jo: rowJo || undefined, reason });
        if (emails[0]) lookupEmails.add(emails[0]);
        continue;
      }

      // in-sheet duplicates
      const keys = [...phones.map((p) => `p:${p}`), ...emails.map((e) => `e:${e}`), ...(lkKey ? [`l:${lkKey}`] : []), ...(nameCompanyKey(nm, company) ? [`n:${nameCompanyKey(nm, company)}`] : [])];
      const dupOf = keys.map((k) => seen.get(k)).find(Boolean);
      if (dupOf) {
        plan.summary.duplicate_in_sheet++;
        plan.skipped.push({ ref, name: nm, reason: "duplicate_in_sheet", detail: `same as ${dupOf}` });
        continue;
      }
      for (const k of keys) seen.set(k, `${sheet.file} row ${n}`);

      // CloudTalk dedupe: phone or email
      const ctHit = phones.map((p) => ({ c: ctByPhone.get(p), by: "phone" as const })).find((x) => x.c) ?? emails.map((e) => ({ c: ctByEmail.get(e), by: "email" as const })).find((x) => x.c);

      // Crelate dedupe: LinkedIn profile URL, then name + company
      let crHit: { c: CrelateContact; by: string } | undefined;
      const byLk = lkKey ? crByLinkedin.get(lkKey) : undefined;
      if (byLk) crHit = { c: byLk, by: "linkedin" };
      else {
        const k = nameCompanyKey(nm, company);
        const byNc = k ? crByNameCo.get(k) : undefined;
        if (byNc) crHit = { c: byNc, by: "name+company" };
      }
      const sheetCrelate = get("crelate");
      const sheetSaysIn = !!sheetCrelate && !/^(pending|no\b|not\b|none|-|n\/a|unknown)/i.test(sheetCrelate);
      if (crHit || sheetSaysIn) plan.summary.in_crelate++;

      const tags = mkTags(!!(crHit || sheetSaysIn));

      if (ctHit?.c) {
        plan.summary.exists_in_cloudtalk++;
        plan.tag_existing.push({ ref, name: nm, contact_id: ctHit.c.id, matched_by: ctHit.by, tags });
        continue;
      }

      loadable++;
      if (opts.limit !== undefined && loadable > opts.limit) {
        plan.summary.deferred_by_limit++;
        plan.skipped.push({ ref, name: nm, reason: "deferred_by_limit" });
        continue;
      }

      const rowWarn = (m: string) => warn(`${m} (some rows)`);
      const create: CreateArgs = {
        name: cap(nm, 150, rowWarn, "name")!,
        company: cap(company, 100, rowWarn, "company"),
        title: cap(title, 255, rowWarn, "title"),
        city: cap(city, 255, rowWarn, "city"),
        state: cap(state, 255, rowWarn, "state"),
        website: lkKey && linkedinRaw.length <= 100 ? linkedinRaw.trim() : undefined,
        source: `Eden lead load ${date}`.slice(0, 64),
        phone_numbers: phones,
        emails,
        tags,
      };
      for (const k of Object.keys(create) as (keyof CreateArgs)[]) if (create[k] === undefined) delete create[k];
      plan.load.push({
        ref, create,
        meta: {
          time_zone: tz,
          crelate: crHit ? { id: crHit.c.id, owner: crHit.c.owner, last_activity: crHit.c.last_activity, matched_by: crHit.by } : sheetSaysIn ? { note: sheetCrelate.slice(0, 80), matched_by: "sheet column" } : undefined,
        },
      });
      for (const p of phones) lookupPhones.add(p);
      for (const e of emails) lookupEmails.add(e);
      plan.lookups.names.push({ name: nm, company });
    }
    const noOwner = plan.load.filter((l) => l.ref.file === sheet.file && !l.create.tags.some((t) => t.startsWith("Owner "))).length;
    if (noOwner && (ownerCol !== undefined || batchOwner)) warn(`${noOwner} loadable rows have no owner yet (Kev assigns at the JO meeting): they load without an Owner tag and are tagged later`);
    batch.tags_common = [batchOwner ? makeTag("Owner", batchOwner) : undefined, batchClient ? makeTag("Client", batchClient) : undefined, batchJo ? makeTag("JO", batchJo) : undefined, makeTag("Lead", date)].filter((t): t is string => !!t);
  }
  plan.summary.load = plan.load.length;
  plan.lookups.phones = [...lookupPhones];
  plan.lookups.emails = [...lookupEmails];
  return plan;
}

// ---------- outputs that leave the plan ----------

export const REASON_TEXT: Record<NoPhone["reason"], string> = {
  none: "no phone on the sheet",
  zoominfo: "only a ZoomInfo phone (not loaded)",
  invalid: "phone is not a valid number",
  zoominfo_and_invalid: "only a ZoomInfo or invalid phone",
};

const csvCell = (v: string | undefined) => { const s = v ?? ""; return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

/** The list that goes back to Nida. No phone digits, no email, no LinkedIn: names, roles and why. */
export function noPhoneCsv(plan: Plan): string {
  const head = ["Sheet", "Row", "Name", "Title", "Company", "City", "State", "JO", "Why it did not load"];
  const lines = plan.no_phone.map((r) => [r.ref.file, String(r.ref.row), r.name, r.title, r.company, r.city, r.state, r.jo, REASON_TEXT[r.reason]].map(csvCell).join(","));
  return [head.join(","), ...lines].join("\n") + "\n";
}

/** A draft for Kev to read and send. Never sent by a tool or a routine. */
export function nidaDraft(plan: Plan, date: string): { subject: string; body: string } {
  const n = plan.no_phone.length;
  const zi = plan.no_phone.filter((r) => r.reason === "zoominfo" || r.reason === "zoominfo_and_invalid").length;
  const byJo = new Map<string, number>();
  for (const r of plan.no_phone) byJo.set(r.jo ?? "(no JO named)", (byJo.get(r.jo ?? "(no JO named)") ?? 0) + 1);
  const lines = [
    "Hi Nida,",
    "",
    `${plan.summary.load} of ${plan.summary.rows} leads from the ${date} sheets loaded into CloudTalk for the recruiters.`,
    `${n} did not, because they have no usable phone number${zi ? ` (${zi} had only a ZoomInfo number, and those never load)` : ""}.`,
    "",
    "By job order:",
    ...[...byJo].sort((a, b) => b[1] - a[1]).map(([jo, c]) => `- ${jo}: ${c}`),
    "",
    "The full list is attached (sheet, row, name, company, why). If you can add a phone that did not come from ZoomInfo, send those rows back on the same sheet and they load the next night.",
    "",
    "Kev",
  ];
  return { subject: `Leads with no phone, ${date}: ${n} to fill in`, body: lines.join("\n") };
}

/** Counts only: safe for a log, the paper and the closing summary. */
export function summaryText(plan: Plan): string {
  const s = plan.summary;
  const out = [
    `Rows read ${s.rows} from ${plan.batches.length} sheet(s). Ready to load ${s.load}.`,
    `No usable phone ${s.no_phone} (ZoomInfo phones blocked on ${s.zoominfo_phones_blocked} rows, invalid phones on ${s.invalid_phones}).`,
    `Already in CloudTalk ${s.exists_in_cloudtalk}. Duplicates inside the sheets ${s.duplicate_in_sheet}. Client staff skipped ${s.client_staff}. No name ${s.no_name}. Held back by the test limit ${s.deferred_by_limit}.`,
    `Already in Crelate ${s.in_crelate}. CloudTalk dedupe: ${s.cloudtalk_dedupe}. Crelate dedupe: ${s.crelate_dedupe}.`,
  ];
  for (const b of plan.batches) {
    out.push(`- ${b.file}: ${b.rows} rows; client ${b.client ?? "?"}; JO ${b.jo ?? "?"}; owner ${b.owner ?? "unassigned"}; tags ${b.tags_common.join(" / ")}`);
    for (const w of b.warnings) out.push(`    note: ${w}`);
  }
  return out.join("\n");
}
