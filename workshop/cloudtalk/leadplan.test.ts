import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateRawSync, crc32 } from "node:zlib";
import { parseCsv } from "./csv.ts";
import { readXlsx } from "./xlsx.ts";
import {
  buildPlan, sheetFromRows, readSheet, classifyHeader, normalizePhone, normalizeTz, fromFileName, linkedinProfileKey,
  noPhoneCsv, nidaDraft, summaryText, type Sheet,
} from "./leadplan.ts";

// Every name, company and number below is made up. 555-01xx numbers are reserved for fiction.
const sheet = (file: string, text: string): Sheet => sheetFromRows(file, parseCsv(text));

describe("csv", () => {
  test("quotes, doubled quotes, embedded newline, CRLF and BOM", () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n"two\nlines",z\r\n');
    assert.deepEqual(rows, [["a", "b"], ["x, y", 'say "hi"'], ["two\nlines", "z"]]);
  });
});

describe("headers", () => {
  test("allowlist roles", () => {
    assert.equal(classifyHeader("Name"), "name");
    assert.equal(classifyHeader("Mobile Phone"), "phone");
    assert.equal(classifyHeader("Direct"), "phone");
    assert.equal(classifyHeader("Email Address"), "email");
    assert.equal(classifyHeader("In Crelate (owner, last activity)"), "crelate");
    assert.equal(classifyHeader("Suggested owner"), "suggested_owner");
    assert.equal(classifyHeader("Time Zone"), "tz");
    assert.equal(classifyHeader("Company type"), "ignored");
  });
  test("private columns are blocked, never read", () => {
    for (const h of ["Desired Salary", "Compensation", "Gender", "Ethnicity", "Disability Status", "Home Address", "Home Phone", "Personal Email", "Date of Birth", "Street"]) {
      assert.equal(classifyHeader(h), "blocked", h);
    }
  });
});

describe("phones", () => {
  test("US numbers become E.164, extensions drop", () => {
    assert.equal(normalizePhone("(555) 234-0101").e164, "+15552340101");
    assert.equal(normalizePhone("1-555-234-0101 x22").e164, "+15552340101");
    assert.equal(normalizePhone("+1 555 234 0101").e164, "+15552340101");
    assert.equal(normalizePhone("+44 20 7946 0958").e164, "+442079460958");
  });
  test("junk is invalid, blank is nothing", () => {
    assert.equal(normalizePhone("n/a").invalid, true);
    assert.equal(normalizePhone("123-456").invalid, true);
    assert.equal(normalizePhone("000-000-0000").invalid, true);
    assert.deepEqual(normalizePhone("  "), {});
  });
  test("time zones normalise to the four tag values", () => {
    assert.equal(normalizeTz("Mountain"), "MST");
    assert.equal(normalizeTz("EDT"), "EST");
    assert.equal(normalizeTz("Hawaii"), undefined);
  });
});

describe("file names and keys", () => {
  test("date, client and role come from the Scout file name", () => {
    assert.deepEqual(fromFileName("2026-10-19-pb-south-wpb-field-engineer.csv"), { date: "2026-10-19", client: "PB South", role: "WPB Field Engineer" });
    assert.deepEqual(fromFileName("2026-10-19-hoffman-boise-pm-pe.csv"), { date: "2026-10-19", client: "Hoffman", role: "Boise PM PE" });
    assert.deepEqual(fromFileName("nida-leads.xlsx"), { date: undefined });
  });
  test("only real profile URLs count as LinkedIn keys, not search links", () => {
    assert.equal(linkedinProfileKey("https://www.linkedin.com/in/Pat-Example-123/?utm=x"), "in/pat-example-123");
    assert.equal(linkedinProfileKey("https://www.linkedin.com/search/results/people/?keywords=Pat%20Example"), undefined);
  });
});

const NIDA = `Name,Title,Company,Mobile,Email,City,State,Time Zone,LinkedIn,Owner,Desired Salary,Home Address,Source
Pat Example,Senior PM,Acme Builders,(555) 234-0101,pat@acme.test,Boise,ID,Mountain,https://www.linkedin.com/in/pat-example,Evan,175000,12 Elm St,Crelate
Lee Sample,Superintendent,Beta GC,,lee@beta.test,Reno,NV,PST,,Evan,160000,9 Oak Ave,Crelate
Sam Placeholder,Project Engineer,Gamma Inc,555-234-0102 / 555-234-0103,,Dallas,TX,CST,,Noah,120000,4 Pine Rd,Crelate
Zed Dupe,PM,Delta LLC,5552340101,,Boise,ID,MST,,Evan,1,2,Crelate
,Ghost,Nowhere,5552340199,,,,,,,,,
Quinn Zoom,VP,Epsilon Corp,5552340104,,Miami,FL,EST,,Noah,1,2,ZoomInfo 123
Rae Badnum,PM,Zeta,12-34,,Miami,FL,EST,,Noah,1,2,Crelate
`;

describe("load plan", () => {
  const plan = buildPlan([sheet("2026-10-19-hoffman-boise-pm-pe.csv", NIDA)], { today: "2026-10-20" });

  test("loadable rows carry E.164 phones, the four tags and the TZ tag", () => {
    const pat = plan.load.find((l) => l.create.name === "Pat Example")!;
    assert.deepEqual(pat.create.phone_numbers, ["+15552340101"]);
    assert.deepEqual(pat.create.emails, ["pat@acme.test"]);
    assert.deepEqual(pat.create.tags, ["Owner Evan", "Client Hoffman", "JO Hoffman Boise PM PE", "Lead 2026-10-19", "TZ MST"]);
    assert.equal(pat.create.website, "https://www.linkedin.com/in/pat-example");
    assert.equal(pat.create.source, "Eden lead load 2026-10-19");
    assert.equal(pat.create.city, "Boise");
    assert.equal(pat.create.state, "ID");
  });
  test("two numbers on one row both load", () => {
    const sam = plan.load.find((l) => l.create.name === "Sam Placeholder")!;
    assert.deepEqual(sam.create.phone_numbers, ["+15552340102", "+15552340103"]);
  });
  test("no phone goes to the Nida list with a reason", () => {
    const lee = plan.no_phone.find((r) => r.name === "Lee Sample")!;
    assert.equal(lee.reason, "none");
    const rae = plan.no_phone.find((r) => r.name === "Rae Badnum")!;
    assert.equal(rae.reason, "invalid");
  });
  test("ZoomInfo-sourced phones never load", () => {
    assert.ok(!plan.load.some((l) => l.create.name === "Quinn Zoom"));
    const q = plan.no_phone.find((r) => r.name === "Quinn Zoom")!;
    assert.equal(q.reason, "zoominfo");
    assert.equal(plan.summary.zoominfo_phones_blocked, 1);
  });
  test("a phone column named for ZoomInfo is blocked even when the source column is clean", () => {
    const p = buildPlan([sheet("x.csv", "Name,Company,ZoomInfo Direct Phone,Source\nAvi Test,Acme,5552340111,Crelate\n")]);
    assert.equal(p.load.length, 0);
    assert.equal(p.no_phone[0]!.reason, "zoominfo");
  });
  test("a separate Phone Source column blocks ZI rows", () => {
    const p = buildPlan([sheet("x.csv", "Name,Company,Phone,Phone Source\nAvi Test,Acme,5552340111,ZI\nBo Test,Acme,5552340112,Crelate\n")]);
    assert.deepEqual(p.load.map((l) => l.create.name), ["Bo Test"]);
  });
  test("a Phone Source value overrides a ZoomInfo lead source, so Nida can release her own numbers", () => {
    const p = buildPlan([sheet("x.csv", "Name,Company,Phone,Phone Source,Source\nAvi Test,Acme,5552340111,Crelate,ZoomInfo 9\nBo Test,Acme,5552340112,ZoomInfo,ZoomInfo 9\nCy Test,Acme,5552340113,,ZoomInfo 9\n")]);
    assert.deepEqual(p.load.map((l) => l.create.name), ["Avi Test"]);
    assert.equal(p.summary.zoominfo_phones_blocked, 2);
  });
  test("Sr and PM keep their usual spelling in a JO tag", () => {
    assert.equal(fromFileName("2026-10-19-prometheus-sr-construction-manager-retail-ti.csv").role, "Sr Construction Manager Retail TI");
  });
  test("a row without a name is skipped", () => {
    assert.equal(plan.summary.no_name, 1);
  });
  test("duplicate by phone inside the sheet is skipped and points at the first row", () => {
    const d = plan.skipped.find((s) => s.name === "Zed Dupe")!;
    assert.equal(d.reason, "duplicate_in_sheet");
    assert.match(d.detail!, /row 2/);
  });
  test("salary, home address and EEO values never reach the plan", () => {
    const text = JSON.stringify(plan);
    for (const secret of ["175000", "160000", "12 Elm St", "9 Oak Ave", "4 Pine Rd"]) assert.ok(!text.includes(secret), secret);
    assert.deepEqual(plan.batches[0]!.blocked_columns, ["Desired Salary", "Home Address"]);
  });
  test("counts add up", () => {
    const s = plan.summary;
    assert.equal(s.rows, 7);
    assert.equal(s.load + s.no_phone + s.duplicate_in_sheet + s.no_name + s.exists_in_cloudtalk + s.client_staff + s.deferred_by_limit, s.rows);
  });
  test("the Nida list and the summary carry no phone digits", () => {
    const blob = noPhoneCsv(plan) + summaryText(plan) + nidaDraft(plan, "2026-10-19").body;
    assert.ok(!/\d{3}[-) ]*\d{3}[- ]*\d{4}/.test(blob));
    assert.match(noPhoneCsv(plan), /Lee Sample/);
    assert.match(nidaDraft(plan, "2026-10-19").body, /ZoomInfo/);
  });
});

describe("dedupe against what CloudTalk and Crelate already hold", () => {
  const text = "Name,Title,Company,Phone,Email,LinkedIn,Owner\nPat Example,PM,Acme Builders,5552340101,,https://www.linkedin.com/in/pat-example,Evan\nLee Sample,Super,Beta GC Inc.,5552340102,lee@beta.test,,Evan\nJo Newlead,PE,Gamma,5552340103,,,Evan\nIvy Known,PX,Delta,5552340104,,,Evan\n";
  const plan = buildPlan([sheet("x.csv", text)], {
    cloudtalk: [{ id: 77, name: "Pat E.", phones: ["(555) 234-0101"] }, { id: 78, emails: ["LEE@beta.test"] }],
    crelate: [{ id: "c1", name: "Lee Sample", company: "Beta GC", owner: "Noah", last_activity: "2026-10-01" }, { id: "c2", name: "Jo Newlead", company: "Other Co", linkedin: "https://linkedin.com/in/jo-newlead" }],
  });
  test("phone or email already in CloudTalk: not created again, proposed as a tag-only update", () => {
    assert.deepEqual(plan.tag_existing.map((t) => [t.name, t.contact_id, t.matched_by]), [["Pat Example", 77, "phone"], ["Lee Sample", 78, "email"]]);
    assert.ok(!plan.load.some((l) => l.create.name === "Pat Example"));
    assert.equal(plan.summary.cloudtalk_dedupe, "ran");
  });
  test("already in Crelate by name and company: still loads, tagged In Crelate", () => {
    const ivy = plan.load.find((l) => l.create.name === "Ivy Known")!;
    assert.ok(!ivy.create.tags.includes("In Crelate"));
    const p2 = buildPlan([sheet("x.csv", text)], { crelate: [{ id: "c1", name: "Ivy Known", company: "Delta Co", owner: "Noah" }] });
    const hit = p2.load.find((l) => l.create.name === "Ivy Known")!;
    assert.ok(hit.create.tags.includes("In Crelate"));
    assert.equal(hit.meta.crelate?.matched_by, "name+company");
    assert.equal(hit.meta.crelate?.owner, "Noah");
  });
  test("already in Crelate by LinkedIn URL", () => {
    const p2 = buildPlan([sheet("x.csv", "Name,Company,Phone,LinkedIn\nJo Newlead,Gamma,5552340103,https://www.linkedin.com/in/jo-newlead/\n")], { crelate: [{ id: "c2", name: "Someone Else", linkedin: "https://linkedin.com/in/jo-newlead" }] });
    assert.equal(p2.load[0]!.meta.crelate?.matched_by, "linkedin");
    assert.equal(p2.summary.in_crelate, 1);
  });
  test("without snapshots the report says the dedupe did not run", () => {
    const p = buildPlan([sheet("x.csv", text)]);
    assert.match(p.summary.cloudtalk_dedupe, /not run/);
    assert.match(p.summary.crelate_dedupe, /not run/);
  });
});

describe("batch controls", () => {
  const rows = (n: number) => "Name,Company,Phone\n" + Array.from({ length: n }, (_, i) => `Person${String.fromCharCode(65 + i)} Test,Co${i},555234${String(1000 + i).padStart(4, "0")}`).join("\n") + "\n";
  test("--limit marks the first N and defers the rest", () => {
    const p = buildPlan([sheet("2026-10-19-triton-supers.csv", rows(5))], { limit: 2 });
    assert.equal(p.load.length, 2);
    assert.equal(p.summary.deferred_by_limit, 3);
  });
  test("an extra tag rides on every loaded row (the test-load marker)", () => {
    const p = buildPlan([sheet("2026-10-19-triton-supers.csv", rows(2))], { extraTags: ["Q Test Load"] });
    assert.ok(p.load.every((l) => l.create.tags.at(-1) === "Q Test Load"));
  });
  test("rows from the client's own company are skipped", () => {
    const p = buildPlan([sheet("x.csv", "Name,Company,Phone\nAl Staff,Hoffman Inc.,5552340150\nBi Other,Acme,5552340151\n")], { client: "Hoffman" });
    assert.deepEqual(p.load.map((l) => l.create.name), ["Bi Other"]);
    assert.equal(p.summary.client_staff, 1);
  });
  test("a preamble note above the header is tolerated; Location splits into city and state", () => {
    const s = sheet("x.csv", 'NOTE v2: dedupe pending\nName,Company,Phone,Location\nCy Test,Acme,5552340160,"Tampa, FL"\n');
    assert.equal(s.headerRow, 2);
    const p = buildPlan([s]);
    assert.equal(p.load[0]!.create.city, "Tampa");
    assert.equal(p.load[0]!.create.state, "FL");
  });
  test("overrides and a blank Owner column: no Owner tag, a plain warning", () => {
    const p = buildPlan([sheet("x.csv", "Name,Company,Phone,Owner\nDi Test,Acme,5552340170,\n")], { client: "Moss", jo: "Moss Precon", date: "2026-11-02" });
    assert.deepEqual(p.load[0]!.create.tags, ["Client Moss", "JO Moss Precon", "Lead 2026-11-02"]);
    assert.ok(p.batches[0]!.warnings.some((w) => /no owner yet/.test(w)));
  });
});

// ---- xlsx: build a real .xlsx in the test (zip with deflate) and read it back ----
function zip(files: Record<string, string>): Buffer {
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const data = Buffer.from(text);
    const comp = deflateRawSync(data);
    const nameBuf = Buffer.from(name);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(crc32(data), 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nameBuf.length, 26);
    locals.push(lh, nameBuf, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(crc32(data), 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

describe("xlsx", () => {
  const dir = mkdtempSync(join(tmpdir(), "leadplan-"));
  const path = join(dir, "nida.xlsx");
  writeFileSync(path, zip({
    "xl/workbook.xml": '<workbook><sheets><sheet name="Leads" sheetId="1" r:id="rId1"/><sheet name="Other" sheetId="2" r:id="rId2"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels": '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="worksheets/sheet2.xml"/></Relationships>',
    "xl/sharedStrings.xml": '<sst><si><t>Name</t></si><si><t>Company</t></si><si><t>Phone</t></si><si><t>Pat &amp; Co Example</t></si><si><r><t>Acme </t></r><r><t>Builders</t></r></si></sst>',
    "xl/worksheets/sheet1.xml": '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2" t="s"><v>4</v></c><c r="C2"><v>5.5523401E9</v></c></row><row r="3"><c r="A3" t="inlineStr"><is><t>Lee Sample</t></is></c><c r="C3"><v>5552340102</v></c></row></sheetData></worksheet>',
    "xl/worksheets/sheet2.xml": '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Name</t></is></c></row></sheetData></worksheet>',
  }));
  test("reads the first sheet: shared strings, rich text, inline strings, numeric phones", () => {
    assert.deepEqual(readXlsx(path), [["Name", "Company", "Phone"], ["Pat & Co Example", "Acme Builders", "5552340100"], ["Lee Sample", "", "5552340102"]]);
  });
  test("an xlsx lead sheet plans like a csv", () => {
    const p = buildPlan([readSheet(path)]);
    assert.deepEqual(p.load.map((l) => [l.create.name, l.create.phone_numbers[0]]), [["Pat & Co Example", "+15552340100"], ["Lee Sample", "+15552340102"]]);
  });
  test("a named tab", () => {
    assert.deepEqual(readXlsx(path, "Other"), [["Name"]]);
  });
  test("a non-xlsx file is refused plainly", () => {
    const bad = join(dir, "bad.xlsx");
    writeFileSync(bad, "not a zip");
    assert.throws(() => readXlsx(bad), /not an xlsx/);
  });
});

describe("dry run on Scout's real sheets (they carry no phones)", () => {
  const dir = "employees/scout/sheets";
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^2026-10-19-.*\.csv$/.test(f)) : [];
  test("every row takes the no-phone path and nothing is loadable", { skip: files.length === 0 }, () => {
    const p = buildPlan(files.map((f) => readSheet(join(dir, f))), {});
    assert.equal(p.summary.load, 0);
    assert.equal(p.summary.no_phone, p.summary.rows - p.summary.no_name - p.summary.duplicate_in_sheet - p.summary.client_staff);
    assert.ok(p.summary.no_phone > 0);
    assert.ok(p.no_phone.every((r) => r.reason === "none"));
    for (const b of p.batches) assert.ok(b.client, `${b.file} should resolve a client from its name`);
  });
});
