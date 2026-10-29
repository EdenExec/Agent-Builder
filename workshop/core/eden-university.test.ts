import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { batchFor, behindModules, checkTrack, moduleStatus, percentDone, trackDoc, type Track } from "./eden-university.ts";

const page = readFileSync("projects/eden-university/site/eden-university.html", "utf8");
const sample: Track[] = JSON.parse(page.match(/id="eu-sample-tracks">\s*([\s\S]*?)<\/script>/)![1]!);
const t = sample[0]!;
const D = 86_400_000;

describe("eden university track contract", () => {
  test("the page's sample tracks pass the loader's checks", () => {
    for (const s of sample) assert.deepEqual(checkTrack(s, s.id), { errors: [], warnings: [] });
  });
  test("errors: bad checker, unknown phase, repeated module id, email, phone", () => {
    const bad = structuredClone(t) as Track;
    bad.modules[0]!.checker = "mallory" as never;
    bad.modules[1]!.phase = "nope";
    bad.modules[2]!.id = bad.modules[3]!.id;
    bad.modules[4]!.goal = "Mail kev@example.com";
    bad.modules[5]!.proof = "Call 208-555-0147";
    const e = checkTrack(bad).errors.join("\n");
    for (const w of ["checker", "not a phase", "repeated", "email", "phone"]) assert.match(e, new RegExp(w));
  });
  test("pay words only warn", () => {
    const x = structuredClone(t) as Track; x.modules[0]!.goal = "Ask about the stipend";
    const c = checkTrack(x); assert.equal(c.errors.length, 0); assert.equal(c.warnings.length, 1);
  });
  test("trackDoc and batchFor shape the writes for tracks/{id}", () => {
    const d = trackDoc(t, "src", "2026-10-29T00:00:00Z");
    assert.equal(d.moduleCount, 6); assert.equal(d.totalMinutes, 330);
    assert.deepEqual(batchFor([{ id: t.id, file: "/x/a.json" }]).writes[0], { op: "set", collection: "tracks", doc_id: t.id, file_path: "/x/a.json" });
  });
  test("the loader CLI writes a batch and exits 1 on a bad track while still writing the good one", () => {
    const from = mkdtempSync(join(tmpdir(), "eu-from-")), out = mkdtempSync(join(tmpdir(), "eu-out-"));
    for (const s of sample) { mkdirSync(join(from, s.id)); writeFileSync(join(from, s.id, "track.json"), JSON.stringify(s)); }
    mkdirSync(join(from, "broken")); writeFileSync(join(from, "broken", "track.json"), "{}");
    mkdirSync(join(from, "no-track-here"));
    let code = 0;
    try { execFileSync(process.execPath, ["workshop/office/eu.ts", "load", "--from", from, "--out", out], { stdio: "pipe" }); } catch (e) { code = (e as { status: number }).status; }
    assert.equal(code, 1);
    const b = JSON.parse(readFileSync(join(out, "tracks-batch.json"), "utf8"));
    assert.deepEqual(b.writes.map((w: { doc_id: string }) => w.doc_id).sort(), sample.map((s) => s.id).sort());
  });
});

describe("progress arithmetic", () => {
  const start = "2026-09-29", day = (n: number) => new Date(start + "T00:00:00").getTime() + n * D;
  test("status: signed beats submitted; a self-checked submission counts as done", () => {
    const p = { submissions: { M01: { text: "x" }, M02: { text: "y" } }, steps: { M05: [0] } };
    const s = { modules: { M02: { by: "u" } } };
    assert.equal(moduleStatus(t.modules[0]!, p, s), "self");
    assert.equal(moduleStatus(t.modules[1]!, p, s), "signed");
    assert.equal(moduleStatus(t.modules[4]!, p, s), "progress");
    assert.equal(moduleStatus(t.modules[5]!, p, s), "new");
    assert.equal(percentDone(t, p, s), 33);
  });
  test("behind: not submitted more than 3 days after the phase window; submitted is not behind", () => {
    const p = { startDate: start, submissions: {} as Record<string, { text: string }> };
    assert.equal(behindModules(t, p, undefined, day(7 + 3)).length, 0);          // p1 ends day 7, grace to day 10
    assert.equal(behindModules(t, p, undefined, day(7 + 3) + 1).length, 2);       // M01, M02
    p.submissions.M02 = { text: "done" };
    assert.deepEqual(behindModules(t, p, undefined, day(11)).map((m) => m.id), ["M01"]);
    assert.equal(behindModules(t, { submissions: {} }, undefined, day(99)).length, 0); // no start date, no flag
  });
});
