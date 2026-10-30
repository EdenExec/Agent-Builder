import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertCrelateSafe, buildCrelateDoc, isBehind, mondayOf, ptHour, pulseDayKeys, rpDaysFor, rpsFromDays, standardToDate, weekdaysThrough, type BoardForLeaderboard } from "./recruiter-board.ts";
import { buildBenches } from "./benches.ts";
import { buildFeed, planWrites } from "./office.ts";

// Wed 28 Oct 2026. 8:59 AM Pacific = 15:59Z; 1:15 PM Pacific = 20:15Z.
const MORNING = new Date("2026-10-28T15:59:00Z"), AFTERNOON = new Date("2026-10-28T20:15:00Z");

const person = (name: string, o: Record<string, unknown> = {}) => ({ slug: name.toLowerCase(), name, status: "active", in_goal: true, ...o });
const live = (at: Date, rec: BoardForLeaderboard["recruiters"]): BoardForLeaderboard => ({
  generated_at: at.toISOString(), week: { start: "2026-10-25", mon_start: "2026-10-26", through: "2026-10-28" }, goals: { rps_per_day: 15 }, recruiters: rec,
});
const c = (rps: number, ptcs = 0, subs = 0, ftis = 0, mps = 0) => ({ rps, mps, ptcs, subs, ftis, resumes: 9, offers: 9 });

describe("pace math", () => {
  test("Monday of a date: a Sunday belongs to the week that is ending", () => {
    assert.equal(mondayOf("2026-10-28"), "2026-10-26");
    assert.equal(mondayOf("2026-10-26"), "2026-10-26");
    assert.equal(mondayOf("2026-11-01"), "2026-10-26");   // Sunday
    assert.equal(mondayOf("2026-10-31"), "2026-10-26");   // Saturday
  });
  test("weekdays so far stop at the day the data runs through, and at Friday", () => {
    assert.deepEqual(weekdaysThrough("2026-10-26", "2026-10-26"), ["2026-10-26"]);
    assert.equal(weekdaysThrough("2026-10-26", "2026-10-28").length, 3);
    assert.equal(weekdaysThrough("2026-10-26", "2026-10-31").length, 5);   // Saturday: Monday to Friday
    assert.equal(weekdaysThrough("2026-10-26", "2026-11-01").length, 5);   // Sunday
  });
  test("a day's 15 falls due at noon Pacific: Wednesday 8:59am owes Monday and Tuesday only", () => {
    assert.equal(standardToDate("2026-10-26", "2026-10-28", 8), 30);
    assert.equal(standardToDate("2026-10-26", "2026-10-28", 11), 30);
    assert.equal(standardToDate("2026-10-26", "2026-10-28", 12), 45);
    assert.equal(standardToDate("2026-10-26", "2026-10-28", 17), 45);
  });
  test("Monday morning owes nothing yet; Friday after noon owes the full 75; a weekend owes the full 75", () => {
    assert.equal(standardToDate("2026-10-26", "2026-10-26", 9), 0);
    assert.equal(standardToDate("2026-10-26", "2026-10-30", 13), 75);
    assert.equal(standardToDate("2026-10-26", "2026-10-31", 6), 75);
    assert.equal(standardToDate("2026-10-26", "2026-11-01", 6), 75);
  });
  test("exactly on the number is on pace; one under is behind; no standard is never behind", () => {
    assert.equal(isBehind(45, 45), false);
    assert.equal(isBehind(44, 45), true);
    assert.equal(isBehind(0, null), false);
  });
  test("the Pacific hour follows the clock change", () => {
    assert.equal(ptHour(Date.parse("2026-10-28T19:00:00Z")), 12);   // PDT
    assert.equal(ptHour(Date.parse("2026-11-02T20:00:00Z")), 12);   // PST
  });
  test("RPs cut from daily counts to a Monday-to-through window", () => {
    assert.equal(rpsFromDays({ "2026-10-25": 7, "2026-10-26": 10, "2026-10-28": 5 }, "2026-10-26", "2026-10-28"), 15);
    assert.equal(rpsFromDays(undefined, "2026-10-26", "2026-10-28"), 0);
  });
});

describe("the recruiter leaderboard document", () => {
  const rec = [
    person("Max", { mon_week: c(30, 2, 1, 1, 1), today: c(10, 1) }),
    person("Noah", { mon_week: c(50, 3, 2, 0), today: c(20, 0, 1) }),
    person("Evan", { mon_week: c(45, 1, 0, 2), today: c(15) }),
    person("Kunji", { in_goal: false, mon_week: c(0), today: c(0) }),
    person("Kyle", { status: "starts" }),
  ];
  const d = buildCrelateDoc(live(AFTERNOON, rec.slice(0, 5)), true, AFTERNOON);
  test("sorted by RPs; a recruiter who has not started is left out", () => {
    assert.deepEqual(d.recruiters.map((r) => r.name), ["Noah", "Evan", "Max", "Kunji"]);
  });
  test("pace: at 1:15pm Wednesday 45 RPs are due; Max at 30 is behind by 15, Evan on pace, Noah ahead", () => {
    const by = Object.fromEntries(d.recruiters.map((r) => [r.name, r]));
    assert.equal(by.Max!.standardToDate, 45); assert.equal(by.Max!.gap, -15); assert.equal(by.Max!.behind, true);
    assert.equal(by.Evan!.gap, 0); assert.equal(by.Evan!.behind, false);
    assert.equal(by.Noah!.gap, 5); assert.equal(by.Noah!.behind, false);
  });
  test("a trainee is counted but has no standard, no gap and no red mark", () => {
    const k = d.recruiters.find((r) => r.name === "Kunji")!;
    assert.equal(k.standardToDate, null); assert.equal(k.gap, null); assert.equal(k.behind, false);
  });
  test("the same data at 8:59am: only Monday and Tuesday are due, so 30 is on pace", () => {
    const m = buildCrelateDoc(live(MORNING, rec.slice(0, 3)), true, MORNING);
    assert.equal(m.recruiters.find((r) => r.name === "Max")!.standardToDate, 30);
    assert.equal(m.recruiters.find((r) => r.name === "Max")!.behind, false);
    assert.equal(m.team.behind, 0);
  });
  test("team row: totals over everyone counted; the standard and gap over those with one", () => {
    assert.deepEqual(d.team.week, { rps: 125, mps: 1, ptcs: 6, subs: 3, ftis: 3 });
    assert.deepEqual(d.team.today, { rps: 45, mps: 0, ptcs: 1, subs: 1, ftis: 0 });
    assert.equal(d.team.standardToDate, 135);       // three people in the goal x 45
    assert.equal(d.team.gap, 125 - 135);
    assert.equal(d.team.behind, 1);
    assert.equal(d.team.people, 4);
  });
  test("asOf is the data's own time, with the source named and the week labelled", () => {
    assert.equal(d.asOf, AFTERNOON.toISOString());
    assert.equal(d.weekOf, "2026-10-26"); assert.equal(d.through, "2026-10-28");
    assert.equal(d.live, true); assert.match(d.source, /Crelate, read-only/);
    assert.equal(d.weekIsCurrent, true); assert.equal(d.todayCurrent, true); assert.equal(d.weekBasis, "monday");
  });
  test("counts only: nothing but the five measures per person, and no resumes or offers", () => {
    assert.deepEqual(Object.keys(d.recruiters[0]!.week).sort(), ["ftis", "mps", "ptcs", "rps", "subs"]);
    assert.ok(!/resumes|offers|salary|pay|commission|phone|email|\$|@/i.test(JSON.stringify(d)));
  });
  test("the safety check refuses a stray field, an email, a phone number or a dollar figure", () => {
    assert.throws(() => assertCrelateSafe({ recruiters: [{ name: "Max", salary: 1 }] }), /not a count/);
    assert.throws(() => assertCrelateSafe({ notes: ["call 360-555-0123"] }), /phone/);
    assert.throws(() => assertCrelateSafe({ notes: ["max@example.com"] }), /email/);
    assert.throws(() => assertCrelateSafe({ notes: ["fee $25,000"] }), /dollar/);
  });
});

describe("the saved board file, when there is no live pull", () => {
  const file = JSON.parse(readFileSync("projects/workforce/board/current.json", "utf8")) as BoardForLeaderboard;
  const NOW = new Date("2026-10-28T16:00:00Z");     // five days after the file
  const d = buildCrelateDoc(file, false, NOW);
  test("shows the file's true age and says it is not live", () => {
    assert.equal(d.live, false);
    assert.equal(d.asOf, file.generated_at);
    assert.equal(d.ageMin, Math.round((NOW.getTime() - Date.parse(file.generated_at!)) / 60000));
    assert.ok(d.ageMin > 5 * 24 * 60 - 60);
    assert.match(d.source, /board file/);
    assert.ok(d.notes.some((n) => /Not a live read/.test(n)));
  });
  test("last week's figures are labelled as another week, with no Today column", () => {
    assert.equal(d.weekOf, "2026-10-19"); assert.equal(d.through, "2026-10-23");
    assert.equal(d.weekIsCurrent, false); assert.equal(d.todayCurrent, false);
    assert.equal(d.team.today, null); assert.ok(d.recruiters.every((r) => r.today === null));
    assert.equal(d.weekBasis, "sunday-file");
  });
  test("RPs are re-cut to Monday from the daily counts, and judged at the hour the file was read (9:56am Friday: Friday's 15 not yet due)", () => {
    const noah = d.recruiters.find((r) => r.name === "Noah")!;
    assert.equal(noah.week.rps, 3 + 20 + 15 + 14 + 18);           // Fri 23 Oct 3, Thu 20, Wed 15, Tue 14, Mon 18
    assert.equal(noah.standardToDate, 60);
    assert.equal(noah.behind, false);
    assert.equal(d.recruiters.find((r) => r.name === "Andrew")!.behind, true);
  });
  test("the same file read the same day shows today's RPs and nothing it cannot know", () => {
    const same = buildCrelateDoc(file, false, new Date(Date.parse(file.generated_at!) + 30 * 60000));
    const noah = same.recruiters.find((r) => r.name === "Noah")!;
    assert.equal(same.todayCurrent, true); assert.equal(same.weekIsCurrent, true);
    assert.equal(noah.today!.rps, 3); assert.equal(noah.today!.ptcs, 0);
  });
});

describe("the feed", () => {
  const board = live(AFTERNOON, [person("Max", { mon_week: c(30), today: c(10) })]);
  test("buildBenches returns meta/crelate beside the benches, and the feed writes it", () => {
    const b = buildBenches({ now: AFTERNOON, board: board as never, boardLive: true });
    assert.ok(b.crelate && b.crelate.recruiters.length === 1);
    assert.ok("benches/recruiting" in b.docs);
    const f = buildFeed({ now: AFTERNOON, agents: [], routines: [], nowFiles: {}, heard: {}, qc: [], gates: [], benches: b } as never);
    assert.deepEqual((f.docs["meta/crelate"] as { recruiters: { name: string }[] }).recruiters.map((r) => r.name), ["Max"]);
  });
  test("a second write with the same counts is skipped; new counts carry the version", () => {
    const b = buildBenches({ now: AFTERNOON, board: board as never, boardLive: true });
    const docs = { "meta/crelate": b.crelate };
    const same = planWrites(docs, { "meta/crelate": { version: 4, data: b.crelate } });
    assert.equal(same.length, 0);
    const later = buildBenches({ now: new Date(AFTERNOON.getTime() + 3600e3), board: live(new Date(AFTERNOON.getTime() + 3600e3), [person("Max", { mon_week: c(41), today: c(21) })]) as never, boardLive: true });
    const w = planWrites({ "meta/crelate": later.crelate }, { "meta/crelate": { version: 4, data: b.crelate } });
    assert.equal(w.length, 1); assert.equal(w[0]!.if_version, 4);
  });
  test("with no board there is no document, and the skip is named", () => {
    const b = buildBenches({ now: AFTERNOON });
    assert.equal(b.crelate, undefined);
    assert.ok(b.skipped.some((s) => /recruiting and depth/.test(s)));
  });
});

describe("the Team pulse: RPs by day for the last 10 weekdays (Kev, 30 Oct 2026)", () => {
  const KEYS = ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30"];
  test("ten weekdays: last Monday to Friday, then this Monday to Friday", () => {
    assert.deepEqual(pulseDayKeys("2026-10-26"), KEYS);
    assert.equal(pulseDayKeys("2026-11-02")[0], "2026-10-26");   // across a month end
  });
  test("with the 10-day map every reached day is a number (a day with no entry is a real zero) and later days are null", () => {
    const d = rpDaysFor(KEYS, "2026-10-28", "2026-10-25", { "2026-10-19": 16, "2026-10-23": 5, "2026-10-26": 15, "2026-10-28": 12 }, undefined);
    assert.deepEqual(d, [16, 0, 0, 0, 5, 15, 0, 12, null, null]);
  });
  test("an older board file has only this week's days: last week is null (not read), not zero", () => {
    const d = rpDaysFor(KEYS, "2026-10-28", "2026-10-25", undefined, { "2026-10-26": 15, "2026-10-28": 12 });
    assert.deepEqual(d, [null, null, null, null, null, 15, 0, 12, null, null]);
  });
  const rec = [person("Max", { mon_week: c(27), today: c(12), rp_by_day_2w: { "2026-10-22": 14, "2026-10-26": 15, "2026-10-28": 12 } }),
    person("Noah", { mon_week: c(40), today: c(20), rp_by_day_2w: { "2026-10-22": 9, "2026-10-26": 20, "2026-10-27": 20 } })];
  const board = live(AFTERNOON, rec); board.goals = { rps_per_day: 15, rps_week: 75, mps_week: 100 };
  const d = buildCrelateDoc(board, true, AFTERNOON);
  test("the document carries the day keys, each person's days, and a team row that sums them", () => {
    assert.deepEqual(d.dayKeys, KEYS);
    const noah = d.recruiters.find((r) => r.name === "Noah")!;
    assert.equal(noah.rpDays.length, 10); assert.equal(noah.rpDays[3], 9); assert.equal(noah.rpDays[8], null);
    assert.deepEqual(d.team.rpDays.slice(3, 8), [23, 0, 35, 20, 12]);
    assert.equal(d.team.rpDays[9], null);
  });
  test("the weekly goals ride along: 75 RPs and 100 MPs per recruiter in goal", () => {
    assert.deepEqual(d.goals, { rpsWeek: 75, mpsWeek: 100 });
  });
  test("a day count is never mixed with a name or a phone: the safety check still passes and the doc stays counts only", () => {
    assert.doesNotThrow(() => assertCrelateSafe(d));
    assert.ok(!/@|\$|phone/i.test(JSON.stringify(d)));
  });
  test("the saved board file has no 10-day map, so last week reads null and this week's days are counted", () => {
    const file = JSON.parse(readFileSync("projects/workforce/board/current.json", "utf8")) as BoardForLeaderboard;
    const f = buildCrelateDoc(file, false, new Date("2026-10-23T18:00:00Z"));
    const noah = f.recruiters.find((r) => r.name === "Noah")!;
    assert.deepEqual(f.dayKeys.slice(0, 5), ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]);
    assert.ok(noah.rpDays.slice(0, 5).every((x) => x === null));
    assert.equal(noah.rpDays[9], 3);                       // Fri 23 Oct, the file's last day
  });
});
