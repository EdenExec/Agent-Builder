import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertSafe, buildDaily, checkTick, hhmm, phoneFlag, pillarFor, tickId, writesFor, type PaperInput } from "./daily.ts";

const NOW = new Date("2026-10-28T14:00:00Z");
const lead = (o: object = {}) => ({ name: "Jamie Printz", title: "Chief Estimator", company: "Ronco Mechanical", ph: "D", src: "ZI", ...o });
const input = (o: Partial<PaperInput> = {}): PaperInput => ({
  scripture: "1 Timothy 1:1–2",
  run: [{ at: "13:00", title: "POWER HOUR · VMG", powerHour: true, sheetId: "vmg" }, { at: "05:45", title: "Pray" }],
  must: [{ at: "07:00", title: "Send retainers", note: "Due Thu." }],
  decisions: [{ text: "D1 Split-fee agreement.", pick: "Send." }],
  sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, eastCoast: true, leads: [lead()] }],
  ...o,
});
const build = (i: PaperInput = input(), opts = {}) => buildDaily("2026-10-28", i, { now: NOW, ...opts });

describe("daily document (the Eden Daily as data)", () => {
  test("pillar follows the weekday, Mon 01 to Sun 07", () => {
    assert.equal(pillarFor("2026-10-26").name, "Righteousness");
    assert.equal(pillarFor("2026-10-28").name, "Accountability");
    assert.equal(pillarFor("2026-11-01").name, "Execution");
  });

  test("builds the full shape: label, pillar, blank habits, null streaks, run sorted by time, ET window derived", () => {
    const { doc } = build();
    assert.equal(doc.label, "Wednesday, October 28");
    assert.deepEqual(doc.pillar, { n: 3, name: "Accountability", verse: "Matthew 12:36; James 5:16" });
    assert.equal(doc.scripture, "1 Timothy 1:1–2");
    assert.ok(Object.values(doc.habits).every((v) => v === ""));
    assert.ok(Object.values(doc.streaks).every((v) => v === null));
    assert.deepEqual(doc.run.map((r) => r.at), ["05:45", "13:00"]);
    assert.deepEqual(doc.sheets[0]!.window, { pt: "11:00-12:00", et: "14:00-15:00" });
    assert.equal(doc.sheets[0]!.leads[0]!.id, "vmg-01");
    assert.equal(doc.must[0]!.id, "m1");
    assert.equal(doc.builtAt, NOW.toISOString());
    assert.equal(doc.builtBy, "radar");
  });

  test("streaks pass through only as whole numbers; anything else stays null, never inferred", () => {
    const { doc } = build(input({ streaks: { bible: 4, rps: -1, mps: 2.5, workout: null } as never }));
    assert.equal(doc.streaks.bible, 4);
    assert.equal(doc.streaks.rps, null);
    assert.equal(doc.streaks.mps, null);
  });

  test("a phone is a flag only: M, D, M D or a dash; a number is refused, never guessed", () => {
    assert.equal(phoneFlag("m d", "x"), "M D");
    assert.equal(phoneFlag("D", "x"), "D");
    assert.equal(phoneFlag("", "x"), "—");
    assert.equal(phoneFlag("-", "x"), "—");
    assert.throws(() => phoneFlag("503-555-0142", "Jamie"), /phone must be a flag/);
    assert.throws(() => build(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead({ ph: "(503) 555 0142" })] }] })), /phone must be a flag/);
    // and the error never echoes the digits
    try { phoneFlag("503-555-0142", "Jamie"); } catch (e) { assert.ok(!/555/.test((e as Error).message)); }
  });

  test("unknown keys never survive: pay, phone, email, EEO fields on a lead are dropped by the whitelist", () => {
    const l = lead({ salary: "180000", phone: "5035550142", email: "j@x.com", gender: "F", ethnicity: "x", disability: "y", homeAddress: "1 Main St" });
    const { doc } = build(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [l] }] }));
    assert.deepEqual(Object.keys(doc.sheets[0]!.leads[0]!).sort(), ["addedAt", "company", "crelateUrl", "id", "linkedin", "name", "note", "ph", "src", "title"]);
    const text = JSON.stringify(doc);
    for (const bad of ["180000", "5035550142", "j@x.com", "ethnicity", "disability", "Main St"]) assert.ok(!text.includes(bad), bad);
  });

  test("free text: emails, phone numbers, addresses are scrubbed and logged by field, not content", () => {
    const { doc, redactions } = build(input({ must: [{ at: "07:00", title: "Call 503-555-0142 or mail kev@example.com", note: "Meet at 1200 Main Street" }] }));
    assert.equal(doc.must[0]!.title, "Call [number] or mail [email]");
    assert.equal(doc.must[0]!.note, "Meet at [address]");
    assert.deepEqual(redactions.map((r) => r.split(":")[0]).sort(), ["must[0].note", "must[0].title", "must[0].title"]);
    assert.ok(redactions.every((r) => !/555|kev@/.test(r)));
  });

  test("pay: a figure beside a pay word is removed; a plain business amount and invoice numbers stay", () => {
    const { doc } = build(input({ decisions: [
      { text: "Offer: base $185k plus 10% bonus", pick: "Hold at 190,000 salary" },
      { text: "Ringover $805 refund, your own draft.", pick: "Send as written." },
    ], must: [{ at: "07:00", title: "Send retainers 62063 and 62064" }] }));
    assert.equal(doc.decisions[0]!.text, "Offer: base [amount] plus 10% bonus");
    assert.equal(doc.decisions[0]!.pick, "Hold at [amount] salary");
    assert.equal(doc.decisions[1]!.text, "Ringover $805 refund, your own draft.");
    assert.equal(doc.must[0]!.title, "Send retainers 62063 and 62064");
  });

  test("health detail: a medical word blanks a schedule title and a decision; a hospital job site on a lead is not health", () => {
    const { doc } = build(input({
      run: [{ at: "09:00", title: "Dentist appointment", note: "root canal" }, { at: "10:00", title: "Pray" }],
      decisions: [{ text: "Research Graves' disease treatment", pick: "x" }],
      sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead({ title: "Hospital Superintendent", company: "Hospital Corporation", note: "Healthcare towers, clinic and hospital work" })] }],
    }));
    assert.equal(doc.run[0]!.title, "Private appointment");
    assert.equal(doc.run[0]!.note, "");
    assert.equal(doc.decisions[0]!.text, "Private item");
    assert.equal(doc.sheets[0]!.leads[0]!.title, "Hospital Superintendent");
    assert.equal(doc.sheets[0]!.leads[0]!.note, "Healthcare towers, clinic and hospital work");
    // a surname that is also a word is only a name
    const g = build(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead({ name: "Chris Graves" })] }] }));
    assert.equal(g.doc.sheets[0]!.leads[0]!.name, "Chris Graves");
  });

  test("a discreet client shows as 'Client · discreet' on QC rows and in any text", () => {
    const { doc } = build(input({
      discreetClients: ["Acme Secret Corp"],
      qc: [{ name: "Smith", client: "Acme Secret Corp", seat: "Gen Super", discreet: true, today: true }, { name: "Jones", client: "PB South", seat: "MEP Super" }],
      must: [{ at: "07:00", title: "Call Smith about Acme Secret Corp", note: "acme secret corp wants an answer" }],
    }));
    assert.equal(doc.qc[0]!.clientSeat, "Client · discreet · Gen Super");
    assert.equal(doc.qc[1]!.clientSeat, "PB South · MEP Super");
    assert.equal(doc.must[0]!.title, "Call Smith about Client · discreet");
    assert.equal(doc.must[0]!.note, "Client · discreet wants an answer");
    assert.ok(!/acme/i.test(JSON.stringify(doc)));
  });

  test("links: only Crelate and LinkedIn hosts on a lead; anything else is refused", () => {
    const ok = build(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead({ crelateUrl: "https://app.crelate.com/go#stage/x/y", linkedin: "https://www.linkedin.com/in/jamie" })] }] }));
    assert.match(ok.doc.sheets[0]!.leads[0]!.crelateUrl!, /^https:\/\/app\.crelate\.com\//);
    const mk = (o: object) => () => build(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead(o)] }] }));
    assert.throws(mk({ linkedin: "https://evil.example.com/in/x" }), /not allowed/);
    assert.throws(mk({ crelateUrl: "http://app.crelate.com/x" }), /not allowed/);
    assert.throws(mk({ linkedin: "https://www.linkedin.com/in/x?e=a@b.com" }), /email/);
  });

  test("times: 24-hour or am/pm; a bare 7:00 is ambiguous and refused", () => {
    assert.equal(hhmm("07:00", "t"), "07:00");
    assert.equal(hhmm("1:30 pm", "t"), "13:30");
    assert.equal(hhmm("12:00 am", "t"), "00:00");
    assert.equal(hhmm("12:15 pm", "t"), "12:15");
    assert.throws(() => hhmm("7:00", "t"), /ambiguous/);
    assert.throws(() => hhmm("25:00", "t"), /not a time/);
  });

  test("East Coast Power Hour after 1:00 PT warns; a sheet a run item points at must exist", () => {
    const w = build(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "14:00-15:00" }, eastCoast: true, leads: [lead()] }] })).warnings;
    assert.ok(w.some((x) => /after the 1:00 PT limit/.test(x)));
    const w2 = build(input({ run: [{ at: "11:00", title: "POWER HOUR", powerHour: true, sheetId: "ghost" }] })).warnings;
    assert.ok(w2.some((x) => /ghost/.test(x)));
    assert.equal(build().warnings.length, 0);
  });

  test("a rebuild keeps habits Kev or the check-out already filled in, and stamps only the new items 'added'", () => {
    const first = build().doc;
    first.habits.bible = "yes";
    const again = build(input({ must: [...input().must!, { at: "11:40", title: "Hot callback" }], sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead(), lead({ name: "New Lead" })] }] }), { existing: first, now: new Date("2026-10-28T19:40:00Z") }).doc;
    assert.equal(again.habits.bible, "yes");
    assert.equal(again.must[0]!.addedAt, null);
    assert.equal(again.must[1]!.addedAt, "2026-10-28T19:40:00.000Z");
    assert.equal(again.sheets[0]!.leads[0]!.addedAt, null);
    assert.equal(again.sheets[0]!.leads[1]!.addedAt, "2026-10-28T19:40:00.000Z");
    assert.equal(build().doc.must[0]!.addedAt, null);
  });

  test("assertSafe is the backstop: it rejects a finished document that carries a forbidden field or a leak", () => {
    const { doc } = build();
    assert.doesNotThrow(() => assertSafe(doc));
    assert.throws(() => assertSafe({ ...doc, run: [{ ...doc.run[0], note: "mail kev@example.com" }] }), /email/);
    assert.throws(() => assertSafe({ ...doc, sheets: [{ ...doc.sheets[0], leads: [{ ...doc.sheets[0]!.leads[0], ph: "5035550142" }] }] }), /phone/);
    assert.throws(() => assertSafe({ ...doc, salary: 1 }), /forbidden field/);
  });

  test("a bad date is refused", () => {
    assert.throws(() => buildDaily("10/28/2026", input()), /YYYY-MM-DD/);
  });
});

describe("ticks (Kev's live marks, daily/{date}/ticks/{kind}-{ref})", () => {
  test("ids are one document per thing ticked", () => {
    assert.equal(tickId("row", "vmg-07"), "row-vmg-07");
    assert.equal(tickId("must", "m1"), "must-m1");
  });
  test("a row tick carries d, v, c, out and note in one document; bad shapes are refused", () => {
    const at = "2026-10-28T18:00:00Z";
    assert.doesNotThrow(() => checkTick({ kind: "row", ref: "vmg-07", at, d: true, v: false, c: true, out: "F.U.", note: "call Fri" }));
    assert.throws(() => checkTick({ kind: "row", ref: "vmg-07", at, out: "X" as never }), /out/);
    assert.throws(() => checkTick({ kind: "dial" as never, ref: "x", at }), /kind/);
    assert.throws(() => checkTick({ kind: "habit", ref: "nonsense", at }), /habit/);
    assert.throws(() => checkTick({ kind: "must", ref: "a/b", at }), /ref/);
  });
});

describe("npm run daily (the writer)", () => {
  const run = (...a: string[]) => execFileSync(process.execPath, ["workshop/office/daily.ts", ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const fail = (...a: string[]) => { try { run(...a); return null; } catch (e) { return (e as { stderr: string }).stderr; } };
  const dir = mkdtempSync(join(tmpdir(), "daily-"));
  const inFile = join(dir, "in.json");
  writeFileSync(inFile, JSON.stringify(input()));

  test("build writes the doc file and a one-write batch; a new day has no if_version", () => {
    const out = join(dir, "new");
    run("build", "2026-10-28", "--in", inFile, "--out", out, "--now", NOW.toISOString());
    const w = JSON.parse(readFileSync(join(out, "writes-1.json"), "utf8")) as Record<string, unknown>[];
    assert.equal(w.length, 1);
    assert.deepEqual({ op: w[0]!.op, collection: w[0]!.collection, doc_id: w[0]!.doc_id }, { op: "set", collection: "daily", doc_id: "2026-10-28" });
    assert.ok(!("if_version" in w[0]!));
    assert.ok(existsSync(w[0]!.file_path as string));
    assert.equal((JSON.parse(readFileSync(w[0]!.file_path as string, "utf8")) as { date: string }).date, "2026-10-28");
  });

  test("--version pins the write; --existing carries version and habits over", () => {
    const ex = join(dir, "ex.json");
    writeFileSync(ex, JSON.stringify({ version: 4, data: { habits: { bible: "yes" } } }));
    const out = join(dir, "pinned");
    run("build", "2026-10-28", "--in", inFile, "--out", out, "--existing", ex);
    const w = JSON.parse(readFileSync(join(out, "writes-1.json"), "utf8")) as { if_version: number; file_path: string }[];
    assert.equal(w[0]!.if_version, 4);
    assert.equal((JSON.parse(readFileSync(w[0]!.file_path, "utf8")) as { habits: { bible: string } }).habits.bible, "yes");
    assert.deepEqual(writesFor("2026-10-28", "/x", 9)[0]!.if_version, 9);
  });

  test("a phone number in the input stops the build with exit 1 and writes nothing", () => {
    const bad = join(dir, "bad.json");
    writeFileSync(bad, JSON.stringify(input({ sheets: [{ id: "vmg", title: "VMG", window: { pt: "11:00-12:00" }, leads: [lead({ ph: "503-555-0142" })] }] })));
    const out = join(dir, "badout");
    const err = fail("build", "2026-10-28", "--in", bad, "--out", out);
    assert.match(err ?? "", /phone must be a flag/);
    assert.ok(!existsSync(join(out, "writes-1.json")));
  });

  test("check passes a clean document and fails a leaky one", () => {
    const good = join(dir, "good.json");
    writeFileSync(good, JSON.stringify(build().doc));
    assert.match(run("check", good), /safe to write/);
    const leaky = join(dir, "leaky.json");
    writeFileSync(leaky, JSON.stringify({ ...build().doc, phone: "x" }));
    assert.match(fail("check", leaky) ?? "", /forbidden field/);
  });

  test("the committed seed for 28 Oct builds clean, with the phone flags and 25 leads intact", () => {
    const out = join(dir, "seed");
    run("build", "2026-10-28", "--in", "projects/virtual-office/daily/2026-10-28.input.json", "--out", out, "--now", NOW.toISOString());
    const doc = JSON.parse(readFileSync(join(out, "docs", "daily--2026-10-28.json"), "utf8")) as ReturnType<typeof build>["doc"];
    assert.equal(doc.sheets[0]!.leads.length, 25);
    assert.ok(doc.sheets[0]!.leads.every((l) => /^(—|M|D|M D)$/.test(l.ph)));
    assert.equal(doc.scripture, "1 Timothy 1:1–2");
    assert.equal(doc.run.find((r) => r.powerHour)!.at, "11:00");
    assert.equal(doc.sheets[0]!.window.et, "14:00-15:00");
  });
});
