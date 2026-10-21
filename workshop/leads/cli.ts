// npm run leads -- check [dir|files...]     check sheets against the landing format (default: employees/scout/sheets)
// npm run leads -- stage [dir|files...]     check, then copy passing sheets into projects/leads/sheets and rewrite index.json
// npm run leads -- link <file.csv> <drive-sheet-url> [title]   record the Drive sheet Scout uploaded; marks it landed today
// npm run leads -- stage-set <file.csv> phones|crelate|moved [YYYY-MM-DD]   date one pipeline step (default today)
// npm run leads -- log [--out file]         write projects/leads/lead-log.csv (the Lead Log Radar uploads to the master folder)
// npm run leads -- verify                   check every staged sheet and that index.json matches the folder
// Offline. Prints counts and file names only: never a phone number, a name or a ZoomInfo field.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { checkSheet, canonicalize, carryOver, entryFor, leadLogCsv, markLanded, setStage, superseded, upgradeEntry, type IndexEntry, type StageStep } from "./leads.ts";

const ROOT = resolve(import.meta.dirname, "../..");
export const SHEETS = join(ROOT, "projects/leads/sheets");
export const INDEX = join(ROOT, "projects/leads/index.json");
export const LOG = join(ROOT, "projects/leads/lead-log.csv");
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const readIndex = () => { const doc = JSON.parse(readFileSync(INDEX, "utf8")); doc.sheets = (doc.sheets as IndexEntry[]).map((e) => upgradeEntry(e, "2026-10-21")); return doc; };
const SCOUT = join(ROOT, "employees/scout/sheets");

function listCsv(args: string[]): string[] {
  const inputs = args.length ? args : [SCOUT];
  const out: string[] = [];
  for (const a of inputs) {
    const p = resolve(a);
    if (statSync(p).isDirectory()) out.push(...readdirSync(p).filter((f) => f.endsWith(".csv")).sort().map((f) => join(p, f)));
    else out.push(p);
  }
  return out;
}

function printReport(r: ReturnType<typeof checkSheet>) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.file}  ${r.rows} rows  tiers ${JSON.stringify(r.tiers)}`);
  const errs = r.findings.filter((f) => f.level === "error"); const sorted = [...errs, ...r.findings.filter((f) => f.level === "warn")];
  for (const f of sorted.slice(0, 4)) console.log(`      ${f.level}${f.row ? ` row ${f.row}` : ""}: ${f.msg}`);
  if (sorted.length > 4) console.log(`      ... ${errs.length} error(s) and ${sorted.length - errs.length} warning(s) in all`);
}

const argv = process.argv.slice(2);
const keepFailed = argv.includes("--keep-failed");
const [cmd, ...rest] = argv.filter((a) => a !== "--keep-failed");
if (cmd === "check" || cmd === "stage") {
  const files = listCsv(rest);
  const skip = superseded(files.map((f) => basename(f)));
  let bad = 0, staged = 0;
  const entries: IndexEntry[] = [];
  if (cmd === "stage") mkdirSync(SHEETS, { recursive: true });
  for (const f of files) {
    const name = basename(f);
    if (skip.has(name)) { console.log(`SKIP  ${name}  (${skip.get(name)})`); continue; }
    const text = readFileSync(f, "utf8");
    const r = checkSheet(name, text);
    printReport(r);
    if (!r.ok) { bad++; if (!(cmd === "stage" && keepFailed)) continue; }
    if (cmd === "stage") {
      writeFileSync(join(SHEETS, name), canonicalize(text));
      entries.push(entryFor(name, text));
      staged++;
    }
  }
  if (cmd === "stage") {
    // keep the Drive link, stage and dates already recorded for a sheet
    const prior: Record<string, IndexEntry> = existsSync(INDEX) ? Object.fromEntries((readIndex().sheets as IndexEntry[]).map((e) => [e.file, e])) : {};
    for (let i = 0; i < entries.length; i++) entries[i] = carryOver(entries[i]!, prior[entries[i]!.file]);
    for (const [file, e] of Object.entries(prior)) if (!entries.some((x) => x.file === file) && existsSync(join(SHEETS, file))) entries.push(e);
    entries.sort((a, b) => a.file.localeCompare(b.file));
    writeFileSync(INDEX, JSON.stringify({ note: "Repo mirror of the sheets the leads artifact reads. Internal, Eden only. Written by npm run leads -- stage.", sheets: entries }, null, 2) + "\n");
    console.log(`\nstaged ${staged} (${bad} flagged needs-fix${keepFailed ? "" : ", not staged"}), index ${entries.length} sheets`);
  } else console.log(`\nchecked ${files.length - skip.size}, failed ${bad}`);
  process.exit(bad ? 1 : 0);
} else if (cmd === "link") {
  const [file, url, title] = rest;
  if (!file || !url || !/^https:\/\/docs\.google\.com\/spreadsheets\//.test(url)) { console.error("usage: npm run leads -- link <file.csv> <https://docs.google.com/spreadsheets/...>"); process.exit(1); }
  const doc = readIndex();
  const i = (doc.sheets as IndexEntry[]).findIndex((x) => x.file === basename(file));
  if (i < 0) { console.error(`${basename(file)} is not staged; run stage first`); process.exit(1); }
  const e = doc.sheets[i] as IndexEntry;
  doc.sheets[i] = markLanded({ ...e, driveUrl: url, title: title ?? e.title }, today());
  writeFileSync(INDEX, JSON.stringify(doc, null, 2) + "\n");
  console.log(`linked ${e.file} (landed ${doc.sheets[i].landedAt})`);
} else if (cmd === "stage-set") {
  const [file, step, date] = rest;
  try {
    const doc = readIndex();
    const i = (doc.sheets as IndexEntry[]).findIndex((x) => x.file === basename(file ?? ""));
    if (i < 0) throw new Error(`${file ?? "(no file)"} is not in the index`);
    doc.sheets[i] = setStage(doc.sheets[i], step as StageStep, date ?? today());
    writeFileSync(INDEX, JSON.stringify(doc, null, 2) + "\n");
    console.log(`${doc.sheets[i].file}: stage ${doc.sheets[i].stage}`);
  } catch (err) { console.error(`stage-set: ${(err as Error).message}`); console.error("usage: npm run leads -- stage-set <file.csv> phones|crelate|moved [YYYY-MM-DD]"); process.exit(1); }
} else if (cmd === "log") {
  const oi = rest.indexOf("--out");
  const out = oi >= 0 && rest[oi + 1] ? resolve(rest[oi + 1]!) : LOG;
  const sheets = readIndex().sheets as IndexEntry[];
  writeFileSync(out, leadLogCsv(sheets));
  const by: Record<string, number> = {};
  for (const e of sheets) by[e.stage] = (by[e.stage] ?? 0) + 1;
  console.log(`wrote ${out}: ${sheets.length} sheets ${JSON.stringify(by)}`);
} else if (cmd === "verify") {
  const files = readdirSync(SHEETS).filter((f) => f.endsWith(".csv")).sort();
  const index = readIndex().sheets as IndexEntry[];
  let bad = 0;
  for (const f of files) {
    const r = checkSheet(f, readFileSync(join(SHEETS, f), "utf8"));
    const e = index.find((x) => x.file === f);
    if (!r.ok && e?.status !== "needs-fix") { bad++; printReport(r); }
    if (r.ok && e?.status === "needs-fix") { bad++; console.log(`FAIL  ${f} now passes; restage to clear needs-fix`); }
    if (!e) { bad++; console.log(`FAIL  ${f} is not in index.json`); }
    else if (e.rows !== r.rows) { bad++; console.log(`FAIL  ${f} index says ${e.rows} rows, file has ${r.rows}`); }
    if (!/,Mobile,Mobile source$/.test(readFileSync(join(SHEETS, f), "utf8").split("\n")[0]!)) { bad++; console.log(`FAIL  ${f} lacks the Mobile columns at the end`); }
  }
  for (const e of index) if (!files.includes(e.file)) { bad++; console.log(`FAIL  index lists ${e.file} but the file is missing`); }
  for (const e of index) if (e.movedAt && !e.crelateAt) { bad++; console.log(`FAIL  ${e.file} is dated Moved but not In Crelate`); }
  // Scout sheets built but not landed (not staged, or staged with no Drive link). A flag, not a failure.
  const scout = readdirSync(SCOUT).filter((f) => f.endsWith(".csv")).sort();
  const skipped = superseded(scout);
  const notLanded = scout.filter((f) => !skipped.has(f) && !index.find((e) => e.file === f && e.driveUrl && e.landedAt));
  for (const f of notLanded) console.log(`NOT LANDED  ${f} (in employees/scout/sheets, not staged or no Drive link)`);
  const nf = index.filter((e) => e.status === "needs-fix").map((e) => e.file);
  console.log(bad ? `\n${bad} problem(s)` : `\nOK: ${files.length} sheets, ${index.reduce((a, e) => a + e.rows, 0)} rows, index matches${notLanded.length ? `; ${notLanded.length} scout sheet(s) NOT LANDED` : ""}${nf.length ? `; needs-fix: ${nf.join(", ")}` : ""}`);
  process.exit(bad ? 1 : 0);
} else {
  console.error("usage: npm run leads -- check|stage [--keep-failed] [dir|files...]  |  link <file> <url> [title]  |  stage-set <file> phones|crelate|moved [date]  |  log  |  verify");
  process.exit(1);
}
