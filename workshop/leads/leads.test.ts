import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { checkSheet, canonicalize, parseSheet, superseded, entryFor, stageOf, markLanded, setStage, carryOver, upgradeEntry, leadLogCsv, LOG_HEADER, type IndexEntry } from "./leads.ts";
import { parseCsv } from "../cloudtalk/csv.ts";

const H = "#,Tier,Name,Title,Company,City,State,Time Zone,LinkedIn,Source";
const row = (o: Partial<Record<string, string>> = {}) =>
  [o.n ?? "1", o.tier ?? "1", o.name ?? "Pat Example", "Superintendent", "Acme", o.city ?? "Boise", o.state ?? "ID", o.tz ?? "MST", o.li ?? "https://www.linkedin.com/in/pat", "ZoomInfo 1"].join(",");

describe("lead sheet landing check", () => {
  test("a good sheet passes and counts tiers", () => {
    const r = checkSheet("a.csv", `${H}\n${row()}\n${row({ name: "Sam Two", tier: "2" })}\n`);
    assert.equal(r.ok, true);
    assert.deepEqual(r.tiers, { "1": 1, "2": 1 });
  });
  test("City, State and Time Zone must be separate and valid (Kev, 13 Oct)", () => {
    assert.equal(checkSheet("a.csv", `${H}\n${row({ state: "Idaho" })}\n`).ok, false);
    assert.equal(checkSheet("a.csv", `${H}\n${row({ tz: "Mountain" })}\n`).ok, false);
    const combined = checkSheet("a.csv", "#,Tier,Name,Title,Company,Location,LinkedIn\n1,1,Pat,Sup,Acme,Boise ID,https://x.y\n");
    assert.ok(combined.findings.some((f) => /combined Metro\/Location|missing column "City"/.test(f.msg)));
  });
  test("LinkedIn is never blank", () => {
    assert.equal(checkSheet("a.csv", `${H}\n${row({ li: "" })}\n`).ok, false);
  });
  test("comp, EEO, home address and personal email headers are refused by name", () => {
    for (const bad of ["Salary", "Gender", "Home address", "Personal email", "Ethnicity", "Compensation"]) {
      const r = checkSheet("a.csv", `${H},${bad}\n${row()},x\n`);
      assert.equal(r.ok, false, bad);
      assert.ok(r.findings.some((f) => /forbidden column/.test(f.msg)));
    }
  });
  test("a ZoomInfo phone never lands: Mobile needs a non-ZoomInfo source", () => {
    const base = `${H},Mobile,Mobile source\n`;
    assert.equal(checkSheet("a.csv", `${base}${row()},208-555-0100,ZoomInfo\n`).ok, false);
    assert.equal(checkSheet("a.csv", `${base}${row()},208-555-0100,\n`).ok, false);
    assert.equal(checkSheet("a.csv", `${base}${row()},208-555-0100,Crelate\n`).ok, true);
    assert.equal(checkSheet("a.csv", `${base}${row()},,\n`).ok, true);
  });
  test("a section label (Moss referral asks) survives staging and is not counted as a lead", () => {
    const text = `${H}\n${row()}\n\nMOSS REFERRAL ASKS ONLY (not a dial)\n,,Sean G,Buyer,Moss,Miami,FL,EST,https://x.y,\n`;
    const r = checkSheet("a.csv", text);
    assert.equal(r.rows, 2);
    assert.match(canonicalize(text), /MOSS REFERRAL ASKS ONLY/);
  });
  test("canonicalize adds Mobile and Mobile source once, and is stable when run twice", () => {
    const once = canonicalize(`NOTE: a preamble line\n${H}\n${row()}\n`);
    assert.match(once.split("\n")[0]!, /,Source,Mobile,Mobile source$/);
    assert.ok(!once.includes("NOTE:"));
    assert.equal(canonicalize(once), once);
    assert.deepEqual(parseSheet(once).rows[0]!.slice(-2), ["", ""]);
  });
  test("v1 files and the MD sheet are not staged", () => {
    const s = superseded(["x-v2.csv", "x.csv", "2026-10-19-vmg-px-md-dc.csv", "y.csv"]);
    assert.ok(s.has("x.csv") && s.has("2026-10-19-vmg-px-md-dc.csv") && !s.has("y.csv") && !s.has("x-v2.csv"));
  });
  test("a discreet client is flagged from the file name, and the index never carries names or phones", () => {
    const e = entryFor("2026-10-19-inl-safety-manager-idaho-falls-v2.csv", `${H}\n${row()}\n`);
    assert.equal(e.discreet, true);
    assert.equal(e.built, "2026-10-19");
    assert.deepEqual(Object.keys(e).sort(), ["built", "crelateAt", "discreet", "driveUrl", "errors", "file", "landedAt", "movedAt", "note", "phonesAt", "rows", "stage", "status", "tiers", "title"]);
    assert.equal(e.stage, "staged");
  });
});

describe("lead pipeline: landed -> phones -> in-crelate -> moved", () => {
  const fresh = () => entryFor("2026-10-21-acme-super-boise.csv", `${H}\n${row()}\n`);
  const landed = () => markLanded({ ...fresh(), driveUrl: "https://docs.google.com/spreadsheets/d/abc/edit", title: "2026-10-21 · Acme · Super · 1 leads" }, "2026-10-21");
  test("a staged sheet is not landed until it has a Drive link and a date", () => {
    assert.equal(fresh().stage, "staged");
    assert.equal(landed().stage, "landed");
    assert.equal(stageOf({ driveUrl: null, landedAt: "2026-10-21", phonesAt: null, crelateAt: null, movedAt: null }), "staged");
  });
  test("landing keeps the first landed date", () => {
    assert.equal(markLanded(landed(), "2026-10-25").landedAt, "2026-10-21");
    assert.throws(() => markLanded(fresh(), "10/21"), /YYYY-MM-DD/);
  });
  test("stage-set dates each step in order and the stage follows the dates", () => {
    let e = setStage(landed(), "phones", "2026-10-22");
    assert.equal(e.stage, "phones");
    e = setStage(e, "crelate", "2026-10-23");
    assert.equal(e.stage, "in-crelate");
    e = setStage(e, "moved", "2026-10-23");
    assert.deepEqual([e.stage, e.phonesAt, e.crelateAt, e.movedAt], ["moved", "2026-10-22", "2026-10-23", "2026-10-23"]);
  });
  test("a sheet cannot get phones before it lands, or move before it is in Crelate", () => {
    assert.throws(() => setStage(fresh(), "phones", "2026-10-22"), /not landed/);
    assert.throws(() => setStage(landed(), "moved", "2026-10-22"), /not In Crelate/);
    assert.throws(() => setStage(landed(), "crelate", "yesterday"), /YYYY-MM-DD/);
    assert.throws(() => setStage(landed(), "archive" as never, "2026-10-22"), /step must be/);
  });
  test("re-staging a sheet (a daily or weekly reload) keeps its link, stage and dates", () => {
    const done = setStage(setStage(landed(), "phones", "2026-10-22"), "crelate", "2026-10-23");
    const again = carryOver(fresh(), done);
    assert.deepEqual([again.driveUrl, again.title, again.landedAt, again.phonesAt, again.crelateAt, again.stage], [done.driveUrl, done.title, "2026-10-21", "2026-10-22", "2026-10-23", "in-crelate"]);
    assert.equal(carryOver(fresh(), undefined).stage, "staged");
  });
  test("an index written before the Lead Log is upgraded: linked sheets count as landed", () => {
    const old = { ...fresh(), driveUrl: "https://docs.google.com/spreadsheets/d/old/edit" } as Partial<IndexEntry> & { file: string };
    for (const k of ["stage", "landedAt", "phonesAt", "crelateAt", "movedAt", "note", "title"]) delete (old as Record<string, unknown>)[k];
    const up = upgradeEntry(old, "2026-10-21");
    assert.deepEqual([up.stage, up.landedAt, up.phonesAt, up.note], ["landed", "2026-10-21", null, ""]);
  });
  test("the Lead Log has the nine columns, one row per sheet, dates by step, and no names or phones", () => {
    const a = setStage(setStage(landed(), "phones", "2026-10-22"), "crelate", "2026-10-23");
    const b = { ...entryFor("2026-10-19-inl-safety-manager-idaho-falls-v2.csv", `${H}\n${row()}\n`), driveUrl: "https://docs.google.com/spreadsheets/d/inl/edit", landedAt: "2026-10-20" } as IndexEntry;
    const rows = parseCsv(leadLogCsv([a, b]));
    assert.deepEqual(rows[0], [...LOG_HEADER]);
    assert.deepEqual(rows[0], ["Ref", "Sheet", "Drive link", "Rows", "Landed", "Phones added", "In Crelate", "Moved", "Owner note"]);
    assert.equal(rows.length, 3);
    assert.equal(rows[1]![1], "2026-10-19-inl-safety-manager-idaho-falls-v2");
    assert.match(rows[1]![8]!, /Discreet client/);
    assert.deepEqual(rows[2]!.slice(3, 8), ["1", "2026-10-21", "2026-10-22", "2026-10-23", ""]);
    assert.ok(!/Pat Example|208-/.test(leadLogCsv([a, b])));
  });
});

describe("the staged folder (projects/leads) as it stands", () => {
  const dir = join(import.meta.dirname, "../../projects/leads/sheets");
  const idx = JSON.parse(readFileSync(join(import.meta.dirname, "../../projects/leads/index.json"), "utf8")).sheets as { file: string; rows: number; status: string }[];
  const files = readdirSync(dir).filter((f) => f.endsWith(".csv"));
  test("every staged sheet is in the index with the right row count and ends in the Mobile columns", () => {
    assert.ok(files.length >= 19);
    for (const f of files) {
      const text = readFileSync(join(dir, f), "utf8");
      const e = idx.find((x) => x.file === f);
      assert.ok(e, `${f} indexed`);
      assert.equal(e!.rows, checkSheet(f, text).rows, f);
      assert.match(text.split("\n")[0]!, /,Mobile,Mobile source$/, f);
    }
    assert.equal(idx.length, files.length);
  });
  test("no staged sheet carries a phone number, a forbidden column or a discreet client name", () => {
    for (const f of files) {
      const text = readFileSync(join(dir, f), "utf8");
      const r = checkSheet(f, text);
      assert.ok(!r.findings.some((x) => /forbidden|ZoomInfo phone|Mobile/.test(x.msg)), f);
      if (/inl-safety/.test(f)) assert.ok(!/Baker (Concrete|Construction)/i.test(text), f);
    }
  });
  test("every indexed sheet has a stage that matches its dates, and nothing is Moved before In Crelate", () => {
    const full = JSON.parse(readFileSync(join(import.meta.dirname, "../../projects/leads/index.json"), "utf8")).sheets as IndexEntry[];
    for (const e of full) {
      assert.equal(e.stage, stageOf(e), e.file);
      if (e.movedAt) assert.ok(e.crelateAt, e.file);
      if (e.driveUrl) assert.ok(e.landedAt, e.file);
    }
  });
  test("only needs-fix sheets may fail the check", () => {
    for (const f of files) if (!checkSheet(f, readFileSync(join(dir, f), "utf8")).ok) assert.equal(idx.find((x) => x.file === f)!.status, "needs-fix", f);
  });
});
