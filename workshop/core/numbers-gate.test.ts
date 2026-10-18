import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as g from "./numbers-gate.ts";

const items = [
  { label: "Cash at 30 Sep", claimed: 252085.8, unit: "usd" as const, source: "Chase 0816 Sept statement, ending balance" },
  { label: "Open placements", claimed: 12, unit: "count" as const, source: "Hub Rev Report, status open" },
  { label: "Fall-off rate", claimed: 16.2, unit: "pct" as const, source: "6 / 37" },
];
const fresh = () => mkdtempSync(join(tmpdir(), "gate-"));

describe("numbers gate", () => {
  test("opens with every number sourced and a different checker", () => {
    const root = fresh();
    assert.throws(() => g.open(root, { subject: "x", preparer: "tally", checker: "tally", items }), /cannot check its own/);
    assert.throws(() => g.open(root, { subject: "x", preparer: "tally", checker: "docket", items: [{ label: "a", claimed: 1, source: " " }] }), /source/);
    assert.throws(() => g.open(root, { subject: "x", preparer: "tally", checker: "docket", items: [] }), /at least one/);
    assert.throws(() => g.open(root, { subject: "x", preparer: "tally", checker: "docket", items: [items[0]!, items[0]!] }), /Duplicate/);
    const rec = g.open(root, { subject: "September packet", preparer: "tally", checker: "docket", items });
    assert.equal(rec.status, "open");
    assert.equal(g.isCleared(root, rec.id), false);
  });

  test("the blind view never shows the claimed numbers", () => {
    const root = fresh();
    const rec = g.open(root, { subject: "s", preparer: "tally", checker: "docket", items });
    const text = JSON.stringify(g.blindView(rec));
    assert.ok(!text.includes("252085"));
    assert.ok(text.includes("Chase 0816"));
  });

  test("tolerance: dollars to the dollar, counts exact, percent to a tenth", () => {
    assert.equal(g.withinTolerance("usd", 100, 100.9), true);
    assert.equal(g.withinTolerance("usd", 100, 101.5), false);
    assert.equal(g.withinTolerance("count", 12, 13), false);
    assert.equal(g.withinTolerance("pct", 16.2, 16.25), true);
    assert.equal(g.withinTolerance("pct", 16.2, 16.5), false);
  });

  test("passes only when every number matches; only the checker verifies", () => {
    const root = fresh();
    const rec = g.open(root, { subject: "s", preparer: "tally", checker: "docket", items });
    assert.throws(() => g.verify(root, rec.id, items[0]!.label, 252085.8, "tally"), /Only the checker/);
    g.verify(root, rec.id, "Cash at 30 Sep", 252085.8, "docket");
    g.verify(root, rec.id, "Open placements", 12, "docket");
    assert.equal(g.load(root, rec.id).status, "open");
    const done = g.verify(root, rec.id, "Fall-off rate", 16.2, "docket");
    assert.equal(done.status, "passed");
    assert.equal(g.isCleared(root, rec.id), true);
  });

  test("a mismatch fails the gate until the preparer revises and the checker re-derives", () => {
    const root = fresh();
    const rec = g.open(root, { subject: "s", preparer: "tally", checker: "docket", items });
    g.verify(root, rec.id, "Cash at 30 Sep", 252085.8, "docket");
    g.verify(root, rec.id, "Open placements", 13, "docket", "I count 13");
    const failed = g.verify(root, rec.id, "Fall-off rate", 16.2, "docket");
    assert.equal(failed.status, "failed");
    assert.equal(g.isCleared(root, rec.id), false);
    assert.throws(() => g.revise(root, rec.id, "Open placements", 13, "docket"), /Only the preparer/);
    assert.throws(() => g.revise(root, rec.id, "Cash at 30 Sep", 1, "tally"), /already matched/);
    const reopened = g.revise(root, rec.id, "Open placements", 13, "tally", "Hub Rev Report, status open, incl. Ben Davis");
    assert.equal(reopened.status, "open");
    assert.equal(reopened.items.find((i) => i.label === "Open placements")!.recomputed, undefined);
    assert.equal(g.verify(root, rec.id, "Open placements", 13, "docket").status, "passed");
  });

  test("only a recorded waiver clears a failed gate", () => {
    const root = fresh();
    const rec = g.open(root, { subject: "s", preparer: "tally", checker: "docket", items: [items[1]!] });
    g.verify(root, rec.id, "Open placements", 99, "docket");
    assert.equal(g.isCleared(root, rec.id), false);
    assert.throws(() => g.waive(root, rec.id, " "), /reason/);
    g.waive(root, rec.id, "Kev: Hub is mid-edit, ship with the flag");
    assert.equal(g.isCleared(root, rec.id), true);
    assert.throws(() => g.verify(root, rec.id, "Open placements", 12, "docket"), /waived/);
  });

  test("employees marked numbers_gate: required cannot send or publish without it", () => {
    assert.equal(g.gateRequired({ numbers_gate: "required" }, "send_message"), true);
    assert.equal(g.gateRequired({ numbers_gate: "required" }, "publish"), true);
    assert.equal(g.gateRequired({ numbers_gate: "required" }, "write_external"), false);
    assert.equal(g.gateRequired({}, "send_message"), false);
  });
});
