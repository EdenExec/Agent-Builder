import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCredits, parseLine, mondayOf } from "./credits.ts";

const NOW = new Date("2026-11-10T18:00:00Z");   // Tue 10 Nov

test("reads Scout's run line in either seat spelling", () => {
  assert.deepEqual(parseLine("- 2026-11-03 (run 15:58-16:15 PT) · EL-033 · 110 rows · paid credits 0 (refused: ZoomInfo credits exhausted on kev1 seat) · free records 14"),
    { date: "2026-11-03", seat: "kev1", paid: 0, exhausted: true });
  assert.deepEqual(parseLine("- 2026-11-09 · EL-040 · seat nick2 · paid credits 1,250 · free 3"), { date: "2026-11-09", seat: "nick2", paid: 1250, exhausted: false });
  assert.equal(parseLine("Notes about the month"), null);
  assert.equal(mondayOf("2026-11-10"), "2026-11-09");
});

test("week and month totals per seat, a month-end pace, and flags", () => {
  const md = [
    "- 2026-10-28 · seat a · paid credits 900",        // last month: not counted
    "- 2026-11-02 · seat a · paid credits 400",
    "- 2026-11-09 · seat a · paid credits 300",
    "- 2026-11-03 · on b seat · paid credits 0 · credits exhausted",
    "- 2026-11-04 · seat c · paid credits 50",
    "- 2026-11-20 · seat c · paid credits 999",        // future-dated: ignored
  ].join("\n");
  const d = buildCredits(md, NOW);
  const a = d.seats.find((s) => s.seat === "a")!, b = d.seats.find((s) => s.seat === "b")!, c = d.seats.find((s) => s.seat === "c")!;
  assert.deepEqual([a.monthPaid, a.weekPaid, a.projected, a.status], [700, 300, 2100, "over"]);   // 700 in 10 days of 30
  assert.equal(b.status, "out");
  assert.deepEqual([c.monthPaid, c.status], [50, "ok"]);
  assert.equal(d.flagged, 2);
  assert.equal(d.month, "2026-11");
  assert.ok(!/@|\$/.test(JSON.stringify(d)));
});
