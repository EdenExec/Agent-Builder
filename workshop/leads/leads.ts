// Scout's lead-sheet landing spot: one canonical format, one place, checked before anything lands.
// Pure and offline. It reads CSV lead sheets, checks them against the format Kev set (13 Oct: City, State and
// Time Zone as three separate columns), and stages good ones into projects/leads/sheets with the two phone
// columns Noah fills (Mobile, Mobile source). It never calls Drive, Crelate, ZoomInfo or CloudTalk.
//
// Privacy: ZoomInfo phones never land (a Mobile value must name a non-ZoomInfo source). Salary, comp, EEO,
// home address and personal email columns are refused by header name; their values are never read.
import { parseCsv } from "../cloudtalk/csv.ts";

export const REQUIRED = ["Name", "Title", "Company", "City", "State", "Time Zone", "LinkedIn"] as const;
export const PHONE_COLUMNS = ["Mobile", "Mobile source"] as const;
export const TIME_ZONES = ["PST", "MST", "CST", "EST"] as const;
/** Header words that must never appear in a lead sheet. Matched on the header only. */
export const FORBIDDEN_HEADER = /salary|comp(ensation)?\b|\bpay\b|ethnic|gender|disab|\brace\b|home address|street|personal e-?mail|\be-?mail\b/i;

export type ParsedSheet = { header: string[]; rows: string[][]; preamble: string[] };
export type Finding = { level: "error" | "warn"; row?: number; msg: string };
export type Report = { file: string; rows: number; tiers: Record<string, number>; findings: Finding[]; ok: boolean };

/** Reads a sheet; rows above the header (a "NOTE ..." line) become the preamble. The header is the row that starts with "#" or Name. */
export function parseSheet(text: string): ParsedSheet {
  const all = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  const h = all.findIndex((r) => r.length > 3 && (r[0]!.trim() === "#" || r.some((c) => c.trim() === "Name")));
  if (h < 0) return { header: [], rows: [], preamble: all.map((r) => r.join(",")) };
  return { header: all[h]!.map((c) => c.trim()), rows: all.slice(h + 1), preamble: all.slice(0, h).map((r) => r.join(",")) };
}

/** A section label such as "MOSS REFERRAL ASKS ONLY (not a dial)": one filled cell in a row of blanks. Kept in the file, never counted as a lead. */
export const isLabel = (cells: string[]) => cells.filter((c) => c.trim() !== "").length === 1 && cells[0]!.trim() !== "" && !/^\d+$/.test(cells[0]!.trim());

const idx = (header: string[], name: string) => header.findIndex((c) => c.toLowerCase() === name.toLowerCase());

export function checkSheet(file: string, text: string): Report {
  const { header, rows } = parseSheet(text);
  const findings: Finding[] = [];
  const err = (msg: string, row?: number) => findings.push({ level: "error", msg, row });
  const warn = (msg: string, row?: number) => findings.push({ level: "warn", msg, row });
  const tiers: Record<string, number> = {};
  if (!header.length) { err("no header row found"); return { file, rows: 0, tiers, findings, ok: false }; }
  for (const c of header) if (FORBIDDEN_HEADER.test(c)) err(`forbidden column "${c}" (comp, EEO, address and email never ride on a lead sheet)`);
  for (const r of REQUIRED) if (idx(header, r) < 0) err(`missing column "${r}"`);
  if (header.some((c) => /^(metro|location)$/i.test(c)) && (idx(header, "City") < 0 || idx(header, "State") < 0)) err("one combined Metro/Location column; City, State and Time Zone must be separate");
  const [iName, iCity, iState, iTz, iLi] = ["Name", "City", "State", "Time Zone", "LinkedIn"].map((n) => idx(header, n)) as [number, number, number, number, number];
  const iTier = idx(header, "Tier"), iSrc = idx(header, "Source"), iMob = idx(header, "Mobile"), iMobSrc = idx(header, "Mobile source");
  if (iSrc < 0) warn('no "Source" column (ZoomInfo id or "LinkedIn search")');
  const seen = new Set<string>();
  rows.filter((cells) => !isLabel(cells)).forEach((cells, k) => {
    const n = k + 1;
    const g = (i: number) => (i >= 0 ? (cells[i] ?? "").trim() : "");
    if (!g(iName)) err("blank name", n);
    if (!g(iCity)) warn("blank City", n);
    if (iState >= 0 && !/^[A-Z]{2}$/.test(g(iState))) err(`State "${g(iState)}" is not a two-letter code`, n);
    if (iTz >= 0 && !(TIME_ZONES as readonly string[]).includes(g(iTz))) err(`Time Zone "${g(iTz)}" is not PST, MST, CST or EST`, n);
    if (iLi >= 0 && !/^https?:\/\//.test(g(iLi))) err("LinkedIn is blank or not a URL", n);
    const key = `${g(iName).toLowerCase()}|${g(idx(header, "Company")).toLowerCase()}`;
    if (seen.has(key)) warn(`duplicate name and company "${g(iName)}"`, n); else seen.add(key);
    if (iTier >= 0) tiers[g(iTier) || "?"] = (tiers[g(iTier) || "?"] ?? 0) + 1;
    if (iMob >= 0 && g(iMob)) {
      if (!g(iMobSrc)) err("Mobile filled but Mobile source is blank", n);
      else if (/zoominfo|\bZI\b/i.test(g(iMobSrc))) err("a ZoomInfo phone may never land on a sheet", n);
    }
  });
  const leadRows = rows.filter((c) => !isLabel(c)).length;
  if (!leadRows) err("no rows");
  return { file, rows: leadRows, tiers, findings, ok: !findings.some((f) => f.level === "error") };
}

const q = (c: string) => (/[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);

/** The canonical landing copy: preamble dropped, the sheet's own columns kept in order, Mobile and Mobile source appended when absent. */
export function canonicalize(text: string): string {
  const { header, rows } = parseSheet(text);
  const out = [...header];
  const add = PHONE_COLUMNS.filter((c) => idx(header, c) < 0);
  const lines = [[...out, ...add].map(q).join(",")];
  for (const r of rows) lines.push([...header.map((_, i) => r[i] ?? ""), ...add.map(() => "")].map(q).join(","));
  return lines.join("\n") + "\n";
}

export type IndexEntry = { file: string; rows: number; tiers: Record<string, number>; built: string; discreet: boolean; driveUrl: string | null; status: "ok" | "needs-fix"; errors: number };

/** Which files are replaced by a newer version beside them, and so are not staged. */
export function superseded(files: string[]): Map<string, string> {
  const out = new Map<string, string>();
  const set = new Set(files);
  for (const f of files) {
    if (/-v\d+\.csv$/.test(f)) continue;
    const v2 = f.replace(/\.csv$/, "-v2.csv");
    if (set.has(v2)) out.set(f, `replaced by ${v2}`);
    const m = /^(\d{4}-\d{2}-\d{2}-)?(.*)\.csv$/.exec(f);
    if (m && /-px-md-/.test(f)) out.set(f, "Kev 19 Oct: the seat is Project Executive, not MD; replaced by the five VMG role files");
    if (f.startsWith("sofla-estimating-procurement-") && !/-v2\.csv$/.test(f) && set.has(f.replace(/\.csv$/, "-v2.csv"))) out.set(f, `replaced by ${f.replace(/\.csv$/, "-v2.csv")}`);
  }
  return out;
}

export function entryFor(file: string, text: string): IndexEntry {
  const r = checkSheet(file, text);
  const built = /^(\d{4}-\d{2}-\d{2})/.exec(file)?.[1] ?? /(\d{4}-\d{2}-\d{2})/.exec(file)?.[1] ?? "";
  return { file, rows: r.rows, tiers: r.tiers, built, discreet: /inl-safety/.test(file), driveUrl: null, status: r.ok ? "ok" : "needs-fix", errors: r.findings.filter((f) => f.level === "error").length };
}
