import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { addRunnerMinutes, buildGame, failedAt, fmtWait, isRunnerTime, isSabbathAt, mergeRecords, newRecords, pacificDate, runnerMinutes, sabbathPlace, sabbathWindow, slaState, slaTitle, sunsetAt, ticketScore, type GameTicket } from "./office-game.js";

const at = (iso: string) => Date.parse(iso);
// Pacific is UTC-7 until 1 Nov 2026 (PDT), UTC-8 after. Thu 22 Oct 2026 is a working day. The Sabbath runs Fri 23 Oct 6:11pm to Sat 24 Oct 6:10pm PDT (Vancouver, WA).
const THU_2PM = at("2026-10-22T21:10:00Z");
const ago = (min: number, now = THU_2PM) => new Date(now - min * 60000).toISOString();
const tk = (o: Partial<GameTicket>): GameTicket => ({ id: "t", agent: "scout", status: "open", priority: "today", createdAt: ago(0), ...o });

describe("the runner clock: 6am to 10pm Pacific, Sunday to Thursday, Friday 6am to sunset", () => {
  test("only runner hours count; nights and Saturday are skipped", () => {
    assert.equal(isRunnerTime(THU_2PM), true);
    assert.equal(isRunnerTime(at("2026-10-23T04:30:00Z")), true, "Thu 9:30pm");
    assert.equal(isRunnerTime(at("2026-10-23T05:30:00Z")), false, "Thu 10:30pm");
    assert.equal(isRunnerTime(at("2026-10-23T12:59:00Z")), false, "Fri 5:59am");
    assert.equal(isRunnerTime(at("2026-10-24T19:00:00Z")), false, "Saturday noon");
    assert.equal(isRunnerTime(at("2026-10-25T13:00:00Z")), true, "Sunday 6:00am");
  });
  test("Friday's clock stops at sunset: Fri 5:41pm to Sun 7:00am is 90 minutes, 30 on Friday and 60 on Sunday", () => {
    assert.equal(isRunnerTime(at("2026-10-24T00:41:00Z")), true, "Fri 5:41pm, before sunset");
    assert.equal(isRunnerTime(at("2026-10-24T01:30:00Z")), false, "Fri 6:30pm, after sunset");
    assert.equal(Math.round(runnerMinutes(at("2026-10-24T00:41:00Z"), at("2026-10-25T14:00:00Z"))), 91);
  });
  test("a ticket filed on the Sabbath (Fri 9:30pm) reaches its 60th minute Sunday 7:00am Pacific", () => {
    assert.equal(new Date(addRunnerMinutes(at("2026-10-24T04:30:00Z"), 60)).toISOString(), "2026-10-25T14:00:00.000Z");
  });
  test("Saturday after sundown is still off the clock: held work launches then, but nothing filed can FAIL that night", () => {
    assert.equal(isRunnerTime(at("2026-10-25T03:00:00Z")), false, "Sat 8:00pm");
    assert.equal(slaState(tk({ createdAt: "2026-10-24T04:30:00Z" }), at("2026-10-25T04:00:00Z")).state, "ok");
  });
  test("it follows the clocks going back on 1 Nov (UTC-7 to UTC-8)", () => {
    assert.equal(pacificDate(at("2026-11-02T07:59:00Z")), "2026-11-01");
    assert.equal(runnerMinutes(at("2026-11-02T14:00:00Z"), at("2026-11-02T15:00:00Z")), 60);   // 6:00 to 7:00am PST
  });
  test("fmtWait", () => { assert.equal(fmtWait(130), "2h 10m"); assert.equal(fmtWait(45), "45m"); assert.equal(fmtWait(26 * 60), "1d 2h"); });
});

describe("FAIL and STALL", () => {
  test("open for exactly 60 minutes is fine; one minute more is a FAIL", () => {
    assert.equal(slaState(tk({ createdAt: ago(60) }), THU_2PM).state, "ok");
    const s = slaState(tk({ createdAt: ago(61) }), THU_2PM);
    assert.equal(s.state, "fail");
    assert.equal(Math.round(s.minutes), 61);
  });
  test("a ticket filed at 9:30pm Thursday is not failing at 6:30am: the night does not count", () => {
    const filed = at("2026-10-23T04:30:00Z");                                       // Thu 9:30pm PDT
    assert.equal(slaState(tk({ createdAt: new Date(filed).toISOString() }), at("2026-10-23T13:30:00Z")).state, "ok");   // 30 + 30 = 60
    assert.equal(slaState(tk({ createdAt: new Date(filed).toISOString() }), at("2026-10-23T13:45:00Z")).state, "fail");
  });
  test("done, gated and blocked tickets are never in a FAIL state, however old", () => {
    for (const status of ["done", "gated", "blocked"]) assert.equal(slaState(tk({ status, createdAt: ago(500), pickedAt: ago(400), doneAt: ago(10) }), THU_2PM).state, "ok", status);
  });
  test("picked or working more than 4 hours with no result is a STALL; a result, or 4 hours exactly, is not", () => {
    assert.equal(slaState(tk({ status: "working", createdAt: ago(400), pickedAt: ago(250) }), THU_2PM).state, "stall");
    assert.equal(slaState(tk({ status: "picked", createdAt: ago(400), pickedAt: ago(240) }), THU_2PM).state, "ok");
    assert.equal(slaState(tk({ status: "working", createdAt: ago(400), pickedAt: ago(250), result: { summary: "built" } }), THU_2PM).state, "ok");
  });
  test("Saturday: nothing fails and nothing stalls", () => {
    const sat = at("2026-10-24T19:00:00Z");                                          // Sat noon PDT
    assert.equal(slaState(tk({ createdAt: ago(300, sat) }), sat).state, "ok");
    assert.equal(slaState(tk({ status: "working", createdAt: ago(900, sat), pickedAt: ago(800, sat) }), sat).state, "ok");
  });
  test("a ticket picked up late is a FAIL on the day it crossed 60 minutes, whatever it became", () => {
    const t = tk({ status: "done", createdAt: ago(200), pickedAt: ago(100), doneAt: ago(50) });
    assert.equal(pacificDate(failedAt(t, THU_2PM)!), "2026-10-22");
    assert.equal(failedAt(tk({ status: "done", createdAt: ago(200), pickedAt: ago(150), doneAt: ago(50) }), THU_2PM), null);
  });
  test("the title carries the wait and the ask cut to 60 characters", () => {
    const t = slaTitle("fail", 130, "x".repeat(100));
    assert.match(t, /^Ticket waiting 2h 10m: x+…$/);
    assert.ok(t.length <= "Ticket waiting 2h 10m: ".length + 60);
    assert.match(slaTitle("stall", 300, "Chase"), /^Ticket stalled 5h 0m: Chase$/);
  });
});

describe("points", () => {
  test("priority today, picked within 60, closed the day it was filed: 3 + 1 + 2", () => {
    assert.deepEqual(ticketScore(tk({ status: "done", createdAt: ago(120), pickedAt: ago(100), doneAt: ago(10) }))?.points, 6);
  });
  test("any other priority scores 2 as the base", () => {
    assert.equal(ticketScore(tk({ priority: "whenever", status: "done", createdAt: ago(120), pickedAt: ago(100), doneAt: ago(10) }))?.base, 2);
    assert.equal(ticketScore(tk({ priority: "now", status: "done", createdAt: ago(120), pickedAt: ago(100), doneAt: ago(10) }))?.base, 2);
  });
  test("late pickup loses the on-the-clock point; closing a day later loses the same-day two", () => {
    assert.equal(ticketScore(tk({ status: "done", createdAt: ago(300), pickedAt: ago(200), doneAt: ago(10) }))?.points, 5);
    assert.equal(ticketScore(tk({ status: "done", createdAt: ago(25 * 60), pickedAt: ago(25 * 60 - 10), doneAt: ago(10) }))?.points, 4);
  });
  test("a day adds closed tickets, Kev's taps and QC approvals at 2 each, and a FAIL at -3", () => {
    const g = buildGame({
      now: THU_2PM,
      tickets: [tk({ id: "a", status: "done", createdAt: ago(120), pickedAt: ago(100), doneAt: ago(10) }), tk({ id: "b", createdAt: ago(200) })],
      actions: [{ action: "done", at: ago(30) }, { action: "followup", at: ago(20) }, { action: "snooze", at: ago(10) }],
      qcByDay: { "2026-10-22": 1 },
    });
    assert.deepEqual([g.day.points, g.day.closed, g.day.fails, g.day.kev, g.day.qc], [6 + 4 + 2 - 3, 1, 1, 2, 1]);
  });
  test("the Sabbath scores nothing, from Friday's sunset on; Saturday after sundown scores again", () => {
    const fri = at("2026-10-24T03:00:00Z");                                          // Fri 8pm PDT, inside the Sabbath
    const g = buildGame({ now: fri, tickets: [tk({ status: "done", createdAt: ago(300, fri), pickedAt: ago(290, fri), doneAt: ago(10, fri) })], actions: [{ action: "done", at: ago(5, fri) }] });
    assert.equal(g.sabbath, true);
    assert.deepEqual([g.day.points, g.day.closed, g.day.kev], [0, 0, 0]);
    const night = at("2026-10-25T04:00:00Z");                                        // Sat 9pm PDT, after sundown
    const n = buildGame({ now: night, tickets: [tk({ status: "done", createdAt: "2026-10-24T04:30:00Z", doneAt: ago(10, night) })] });
    assert.equal(n.sabbath, false);
    assert.equal(n.day.closed, 1);
  });
  test("Saturday scores nothing", () => {
    const sat = at("2026-10-24T19:00:00Z");
    const g = buildGame({ now: sat, tickets: [tk({ status: "done", createdAt: ago(100, sat), pickedAt: ago(90, sat), doneAt: ago(10, sat) })], actions: [{ action: "done", at: ago(5, sat) }], qcByDay: { "2026-10-24": 2 } });
    assert.equal(g.sabbath, true);
    assert.deepEqual([g.day.points, g.day.closed], [0, 0]);
  });
  test("this week runs Sunday to Saturday and is set against last week", () => {
    const g = buildGame({ now: THU_2PM, tickets: [
      tk({ id: "a", status: "done", createdAt: ago(120), pickedAt: ago(100), doneAt: ago(10) }),
      tk({ id: "b", status: "done", createdAt: ago(7 * 24 * 60 + 120), pickedAt: ago(7 * 24 * 60 + 100), doneAt: ago(7 * 24 * 60 + 10) }),
    ] });
    assert.deepEqual([g.week.start, g.week.points, g.lastWeek.start, g.lastWeek.points], ["2026-10-18", 6, "2026-10-11", 6]);
  });
  test("leaderboard: closed, median time to close, FAILs, points, per agent", () => {
    const g = buildGame({ now: THU_2PM, tickets: [
      tk({ id: "a", agent: "scout", status: "done", createdAt: ago(120), pickedAt: ago(100), doneAt: ago(60) }),
      tk({ id: "b", agent: "scout", status: "done", createdAt: ago(300), pickedAt: ago(299), doneAt: ago(60) }),
      tk({ id: "c", agent: "q", createdAt: ago(90) }),
    ] });
    const by = Object.fromEntries(g.agents.map((r) => [r.agent, r]));
    assert.deepEqual([by.scout!.closed, by.scout!.medianCloseMin, by.scout!.fails], [2, 150, 0]);
    assert.deepEqual([by.q!.closed, by.q!.fails, by.q!.points], [0, 1, -3]);
    assert.equal(g.agents[0]!.agent, "scout");
  });
  test("median pickup, open now and the oldest open ticket", () => {
    const g = buildGame({ now: THU_2PM, tickets: [
      tk({ id: "a", status: "working", createdAt: ago(100), pickedAt: ago(70) }),                  // 30 minutes
      tk({ id: "b", status: "done", createdAt: ago(100), pickedAt: ago(50), doneAt: ago(5) }),     // 50
      tk({ id: "c", createdAt: ago(40) }), tk({ id: "d", createdAt: ago(15) }),
    ] });
    assert.equal(g.medianPickupMin, 40);
    assert.equal(g.openNow, 3);
    assert.deepEqual([g.oldest?.id, Math.round(g.oldest?.waitedMin ?? 0)], ["c", 40]);
  });
});

describe("streak and records", () => {
  test("counts working days with no FAIL, skips Saturday without breaking, and a FAIL resets it", () => {
    const first = at("2026-10-18T19:00:00Z");                                              // Sunday noon: the first ticket on record
    const quiet = [tk({ id: "s", status: "done", createdAt: new Date(first).toISOString(), pickedAt: new Date(first + 600000).toISOString(), doneAt: new Date(first + 3600000).toISOString() })];
    // Sun, Mon, Tue, Wed, Thu = 5 working days
    assert.equal(buildGame({ now: THU_2PM, tickets: quiet }).streak, 5);
    // a Friday and the Sabbath later: Fri counts, Sat skipped, Sun counts
    assert.equal(buildGame({ now: at("2026-10-25T20:00:00Z"), tickets: quiet }).streak, 7);
    const failed = [...quiet, tk({ id: "f", createdAt: new Date(THU_2PM - 3 * 86400000).toISOString(), status: "done", pickedAt: new Date(THU_2PM - 3 * 86400000 + 3 * 3600000).toISOString(), doneAt: new Date(THU_2PM - 3 * 86400000 + 4 * 3600000).toISOString() })];
    assert.equal(buildGame({ now: THU_2PM, tickets: failed }).streak, 3);                  // FAIL on Monday resets it: Tue, Wed, Thu
  });
  test("on Saturday the streak holds", () => {
    const first = at("2026-10-22T19:00:00Z");
    const t = [tk({ status: "done", createdAt: new Date(first).toISOString(), pickedAt: new Date(first + 600000).toISOString(), doneAt: new Date(first + 3600000).toISOString() })];
    const thu = buildGame({ now: THU_2PM, tickets: t }).streak, sat = buildGame({ now: at("2026-10-24T19:00:00Z"), tickets: t }).streak;
    assert.equal(sat, thu + 1);                                                           // Friday was a clean working day; Saturday adds nothing and breaks nothing
  });
  test("records: most closed in a day, best week, longest streak; they only advance", () => {
    const mk = (id: string, created: string) => tk({ id, status: "done", createdAt: created, pickedAt: new Date(Date.parse(created) + 600000).toISOString(), doneAt: new Date(Date.parse(created) + 1800000).toISOString() });
    const g = buildGame({ now: THU_2PM, tickets: [mk("1", "2026-10-19T17:00:00Z"), mk("2", "2026-10-19T18:00:00Z"), mk("3", "2026-10-19T19:00:00Z"), mk("4", "2026-10-22T17:00:00Z")] });
    assert.deepEqual([g.records.mostClosedDay.n, g.records.mostClosedDay.date], [3, "2026-10-19"]);
    assert.equal(g.records.bestWeek.weekOf, "2026-10-18");
    const merged = mergeRecords(g.records, { mostClosedDay: { n: 9, date: "2026-09-01", on: "2026-09-01" } });
    assert.equal(merged.mostClosedDay.n, 9);
    assert.equal(mergeRecords(g.records, null).mostClosedDay.n, 3);
  });
  test("a banner only for a record set today above the floor, never on Saturday, with a key that makes it once", () => {
    const rec = { mostClosedDay: { n: 4, date: "2026-10-22", on: "2026-10-22" }, bestWeek: { points: 12, weekOf: "2026-10-18", on: "2026-10-21" }, longestStreak: { days: 2, on: "2026-10-22" } };
    const r = newRecords(rec, "2026-10-22");
    assert.deepEqual(r.map((x) => x.key), ["closed:2026-10-22"]);
    assert.match(r[0]!.text, /4 tickets closed in a day/);
    assert.deepEqual(newRecords({ ...rec, mostClosedDay: { n: 2, date: "2026-10-22", on: "2026-10-22" } }, "2026-10-22"), []);
    assert.deepEqual(newRecords(rec, "2026-10-24"), []);
  });
});

describe("the Sabbath: Friday sunset to Saturday sunset (Kev, 24 Oct 2026)", () => {
  const local = (ms: number, tz: string) => new Date(ms).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  test("sunset matches the almanac within a few minutes, in Vancouver and in Boise", () => {
    const V = sabbathPlace("2026-10-23"), B = sabbathPlace("2026-11-06");
    assert.deepEqual([V.name, B.name], ["Vancouver, WA", "Boise, ID"]);
    const near = (date: string, place: typeof V, hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number), ms = sunsetAt(date, place), p = new Intl.DateTimeFormat("en-US", { timeZone: place.tz, hourCycle: "h23", hour: "numeric", minute: "numeric" }).formatToParts(new Date(ms));
      const got = +p.find((x) => x.type === "hour")!.value * 60 + +p.find((x) => x.type === "minute")!.value;
      assert.ok(Math.abs(got - (h! * 60 + m!)) <= 4, `${date} ${place.name}: ${local(ms, place.tz)}, almanac ${hhmm}`);
    };
    near("2026-10-23", V, "18:11"); near("2026-12-21", V, "16:29"); near("2026-06-21", V, "21:03");
    near("2026-12-21", B, "17:11"); near("2026-06-21", B, "21:29");
  });
  test("the family moves to Boise on Fri 6 Nov 2026: that Sabbath is kept on Boise's sunset", () => {
    assert.equal(sabbathPlace("2026-11-05").name, "Vancouver, WA");
    const w = sabbathWindow(at("2026-11-06T18:00:00Z"));
    assert.deepEqual([w.friday, w.place, w.tz], ["2026-11-06", "Boise, ID", "America/Boise"]);
  });
  test("inside from Friday's sunset to Saturday's, and never on any other day", () => {
    assert.equal(isSabbathAt(at("2026-10-24T01:00:00Z")), false, "Fri 6:00pm, before sunset");
    assert.equal(isSabbathAt(at("2026-10-24T01:20:00Z")), true, "Fri 6:20pm");
    assert.equal(isSabbathAt(at("2026-10-24T19:00:00Z")), true, "Sat noon");
    assert.equal(isSabbathAt(at("2026-10-25T01:05:00Z")), true, "Sat 6:05pm");
    assert.equal(isSabbathAt(at("2026-10-25T01:15:00Z")), false, "Sat 6:15pm, after sundown");
    assert.equal(isSabbathAt(THU_2PM), false);
    const w = sabbathWindow(at("2026-10-25T03:00:00Z"));                                  // after sundown: the next one
    assert.equal(w.friday, "2026-10-30");
  });
  test("npm run sabbath: exit 0 inside, 1 outside, 2 for a bad time", async () => {
    const { spawnSync } = await import("node:child_process");
    const run = (...a: string[]) => spawnSync(process.execPath, ["workshop/office/sabbath.ts", ...a], { encoding: "utf8" });
    const sab = run("2026-10-24T12:00:00-07:00");
    assert.equal(sab.status, 0);
    assert.match(sab.stdout, /SABBATH: yes/);
    assert.match(sab.stdout, /Friday sunset: +Fri, Oct 23, 6:1\d PM PDT/);
    assert.equal(run("2026-10-22T14:00:00-07:00").status, 1);
    assert.equal(run("not-a-time").status, 2);
    assert.equal(JSON.parse(run("2026-11-07T10:00:00-07:00", "--json").stdout).place, "Boise, ID");
  });
});
