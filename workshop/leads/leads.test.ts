import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { checkSheet, canonicalize, parseSheet, superseded, entryFor } from "./leads.ts";

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
    assert.deepEqual(Object.keys(e).sort(), ["built", "discreet", "driveUrl", "errors", "file", "rows", "status", "tiers"]);
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
  test("only needs-fix sheets may fail the check", () => {
    for (const f of files) if (!checkSheet(f, readFileSync(join(dir, f), "utf8")).ok) assert.equal(idx.find((x) => x.file === f)!.status, "needs-fix", f);
  });
});
