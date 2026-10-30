import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ptMidnightUtc, weekWindows, countActivities, buildBoard, parseRevCsv, revenueByRecruiter, makeClient, runBoard, slugsOf, money,
  ROSTER, VERBS, ACTIVE_COLUMNS, FILLED_COLUMN, GOALS, type ActivityRow, type JobRow, type StageRow,
} from "./recruiting-board.ts";
import type { Fetcher } from "../lib/http.ts";

const NOW = Date.parse("2026-10-23T03:44:00Z");           // Thu 22 Oct 2026, 8:44 PM Pacific
const W = weekWindows(NOW);
const id = (slug: string) => ROSTER.find((p) => p.slug === slug)!.ids[0]!;
const TOP = Object.keys(ACTIVE_COLUMNS)[1]!;

let n = 0;
function act(verb: keyof typeof VERBS, who: string | string[], when: string, o: { contact?: string | null; job?: string | null } = {}): ActivityRow {
  const owners = (Array.isArray(who) ? who : [who]).map((s, i) => ({ Id: id(s), IsPrimary: i === 0 }));
  return {
    Id: `a${++n}`, When: when, VerbId: { Id: VERBS[verb] }, Owners: owners, CreatedById: { Id: owners[0]!.Id },
    ParentId: o.contact === null ? null : { Id: o.contact ?? `c${n}` },
    RegardingId: o.job === null ? null : { Id: o.job ?? "job1", EntityName: "Jobs" },
  };
}
const jobs: JobRow[] = [
  { Id: "job1", JobNum: 8409, Name: "PB South - MEP Supers", SalesWorkflowItemStatusId: { Id: TOP, Title: "TOP Priority (2)" } },
  { Id: "job2", JobNum: 7, Name: "Old Filled", SalesWorkflowItemStatusId: { Id: FILLED_COLUMN, Title: "Filled" }, NumberOfPlacements: 1 },
];

describe("Pacific weeks", () => {
  test("Sunday 00:00 Pacific is 07:00Z in daylight time and 08:00Z after the November change", () => {
    assert.equal(new Date(ptMidnightUtc("2026-10-18")).toISOString(), "2026-10-18T07:00:00.000Z");
    assert.equal(new Date(ptMidnightUtc("2026-11-01")).toISOString(), "2026-11-01T07:00:00.000Z");   // the day the clocks go back: midnight is still PDT
    assert.equal(new Date(ptMidnightUtc("2026-11-02")).toISOString(), "2026-11-02T08:00:00.000Z");
  });
  test("Thursday evening Pacific is still Thursday, and the week began on Sunday 18 Oct", () => {
    assert.equal(W.today, "2026-10-22");
    assert.equal(W.weekStart, "2026-10-18");
    assert.equal(W.lastStart, "2026-10-11");
    assert.equal(W.lastEnd, "2026-10-17");
    assert.equal(new Date(W.thisFromMs).toISOString(), "2026-10-18T07:00:00.000Z");
  });
  test("last week to the same point is as long as this week so far", () => {
    assert.equal(W.lastSameToMs - W.lastFromMs, NOW - W.thisFromMs);
  });
  test("a Sunday starts a new week", () => {
    const sun = weekWindows(Date.parse("2026-10-25T17:00:00Z"));
    assert.equal(sun.weekStart, "2026-10-25");
    assert.equal(sun.lastStart, "2026-10-18");
  });
});

describe("counting (Dean's rules)", () => {
  const rows: ActivityRow[] = [
    act("rp", "max", "2026-10-19T17:00:00Z"), act("rp", "max", "2026-10-19T18:00:00Z"), act("rp", "max", "2026-10-20T18:00:00Z", { job: null }),
    act("ptcs", "max", "2026-10-20T19:00:00Z", { contact: "same" }), act("ptcs", "max", "2026-10-21T19:00:00Z", { contact: "same" }),  // one contact twice = one PTC
    act("ptcs", ["kev", "evan"], "2026-10-21T20:00:00Z", { contact: "pc" }),                                   // Kev co-owns: Evan is credited too
    act("ftis", "noah", "2026-10-21T20:00:00Z", { contact: null }),                                           // no contact: counts the activity
    act("ftis", "noah", "2026-10-21T21:00:00Z", { contact: null }),
    act("rp", "max", "2026-10-14T17:00:00Z"),                                                                 // last week, inside the same point
    act("rp", "max", "2026-10-17T17:00:00Z"),                                                                 // last week, after the same point
    act("rp", "max", "2026-10-30T17:00:00Z"),                                                                 // in the future: ignored
    act("rp", "max", "2026-09-30T17:00:00Z"),                                                                 // before last week: ignored
    act("rp", "evan", "2026-10-20T17:00:00Z", { job: "ghost" }),                                              // a job that is not an active JO
    act("mp", "max", "2026-10-20T17:00:00Z"),
  ];
  const r = countActivities(rows, jobs, [], W);
  test("RPs count activities; PTCs and FTIs count unique contacts", () => {
    assert.equal(r.persons.max!.this.rps, 3);
    assert.equal(r.persons.max!.this.ptcs, 1);
    assert.equal(r.persons.noah!.this.ftis, 2);
    assert.equal(r.persons.max!.this.mps, 1);
  });
  test("every owner on the roster is credited, as owner_ids does", () => {
    assert.equal(r.persons.kev!.this.ptcs, 1);
    assert.equal(r.persons.evan!.this.ptcs, 1);
    assert.deepEqual(slugsOf(rows[5]!).sort(), ["evan", "kev"]);
  });
  test("last week is split into the same point and the full week", () => {
    assert.equal(r.persons.max!.lastSame.rps, 1);
    assert.equal(r.persons.max!.lastFull.rps, 2);
  });
  test("future dates and old rows are ignored", () => {
    assert.equal(r.strayDates, 1);
    assert.equal(r.persons.max!.this.rps, 3);
  });
  test("RPs by Pacific day feed the 15-a-day count", () => {
    assert.deepEqual(r.persons.max!.rpsByDay, { "2026-10-19": 2, "2026-10-20": 1 });
  });
  test("each activity lands in exactly one of: an active JO, another job, no job", () => {
    const onJo = r.jos.reduce((s, j) => s + j.this.rps, 0);
    assert.equal(onJo + r.other.this.rps + r.none.this.rps, 4);
    assert.equal(r.none.this.rps, 1);
    assert.equal(r.other.this.rps, 1);
    assert.equal(r.jos[0]!.num, 8409);
    assert.equal(r.jos[0]!.this.ptcs, 3);                      // Max's contact once, plus the Kev/Evan PTC counted for each of them
    assert.deepEqual(r.jos[0]!.people, ["max", "evan", "noah", "kev"]);   // roster order
  });
  test("a person not on the roster is never counted", () => {
    const stranger: ActivityRow = { ...act("rp", "max", "2026-10-20T17:00:00Z"), Owners: [{ Id: "someone-else", IsPrimary: true }], CreatedById: { Id: "someone-else" } };
    assert.equal(countActivities([stranger], jobs, [], W).persons.max!.this.rps, 0);
  });
  test("offers: one per contact and person, from stage entries named Offer", () => {
    const st: StageRow[] = [
      { Date: "2026-10-21T20:00:00Z", Contact: { Id: "x" }, Stage: { Title: "Offer $" }, User: { Id: id("evan") } },
      { Date: "2026-10-22T20:00:00Z", Contact: { Id: "x" }, Stage: { Title: "Offer $" }, User: { Id: id("evan") } },
      { Date: "2026-10-22T20:00:00Z", Contact: { Id: "y" }, Stage: { Title: "Interviewing" }, User: { Id: id("evan") } },
      { Date: "2026-10-14T20:00:00Z", Contact: { Id: "z" }, Stage: { Title: "Offer $" }, User: { Id: id("noah") } },
    ];
    const o = countActivities([], jobs, st, W);
    assert.equal(o.persons.evan!.this.offers, 1);
    assert.equal(o.persons.noah!.lastSame.offers, 1);
  });
});

describe("the Monday week and today (the Command Center's recruiter leaderboard, Kev, 28 Oct 2026)", () => {
  const rows: ActivityRow[] = [
    act("rp", "max", "2026-10-18T20:00:00Z"),                                              // Sunday 1pm Pacific: in the Sunday-start week, not in the Monday week
    act("rp", "max", "2026-10-19T14:00:00Z"),                                              // Monday 7am Pacific: the Monday week starts here
    act("rp", "max", "2026-10-22T17:00:00Z"), act("rp", "max", "2026-10-22T18:00:00Z"),    // Thursday, today
    act("ptcs", "max", "2026-10-21T19:00:00Z", { contact: "same" }),                       // Wednesday
    act("ptcs", "max", "2026-10-22T19:00:00Z", { contact: "same" }),                       // the same contact again today
    act("ftis", "noah", "2026-10-22T07:30:00Z", { contact: "n1" }),                        // Thursday 00:30 Pacific: today, by the Pacific clock (UTC says the same day only by luck)
    act("ftis", "noah", "2026-10-22T06:30:00Z", { contact: "n2" }),                        // Wednesday 11:30pm Pacific: yesterday
  ];
  const w = weekWindows(NOW), r = countActivities(rows, jobs, [], w);
  test("a Thursday's Monday is the 19th, and a Sunday belongs to the week that is ending", () => {
    assert.equal(w.monStart, "2026-10-19");
    assert.equal(weekWindows(Date.parse("2026-10-25T17:00:00Z")).monStart, "2026-10-19");
    assert.equal(weekWindows(Date.parse("2026-10-26T17:00:00Z")).monStart, "2026-10-26");
    assert.equal(new Date(w.todayFromMs).toISOString(), "2026-10-22T07:00:00.000Z");
  });
  test("RPs: the Sunday call is in the Sunday-start week and not in the Monday week", () => {
    assert.equal(r.persons.max!.this.rps, 4);
    assert.equal(r.persons.max!.monWeek.rps, 3);
    assert.equal(r.persons.max!.today.rps, 2);
  });
  test("unique contacts are counted again inside each window", () => {
    assert.equal(r.persons.max!.monWeek.ptcs, 1);
    assert.equal(r.persons.max!.today.ptcs, 1);
  });
  test("today starts at Pacific midnight, not UTC midnight", () => {
    assert.equal(r.persons.noah!.today.ftis, 1);
    assert.equal(r.persons.noah!.monWeek.ftis, 2);
  });
  test("the board document carries mon_week and today per person, and the Monday the week starts on", () => {
    const b = buildBoard({ nowMs: NOW, counts: r, jobsRead: 0, stageJobsRead: 0, fetchedActivities: rows.length });
    const max = b.recruiters.find((p) => p.slug === "max")!;
    assert.equal(max.mon_week.rps, 3);
    assert.equal(max.today.rps, 2);
    assert.equal(b.week.mon_start, "2026-10-19");
  });
});

describe("the board document", () => {
  const rows = [act("rp", "max", "2026-10-19T17:00:00Z"), act("rp", "kunji", "2026-10-19T18:00:00Z")];
  const board = buildBoard({ nowMs: NOW, counts: countActivities(rows, jobs, [], W), jobsRead: 2, stageJobsRead: 2, fetchedActivities: 2 });
  test("goals: 75 RPs and 100 MPs a week per recruiter with a standard; Kyle (start TBD) is not in it yet", () => {
    assert.equal(board.goals.recruiters_in_goal, 5);
    assert.equal(board.goals.rps_team_week, 75 * 5);
    assert.equal(board.goals.mps_team_week, 100 * 5);
    assert.equal(board.goals.accelerator_team_quarter, 25000 * 5);
    assert.equal(board.recruiters.find((p) => p.slug === "kyle")!.status, "starts");
    assert.equal(board.recruiters.find((p) => p.slug === "kyle")!.start, "tbd");
  });
  test("a hidden person (Kunji, Kev 29 Oct) is off the board and out of the totals", () => {
    assert.equal(board.recruiters.find((p) => p.slug === "kunji"), undefined);
    assert.equal(board.team.this.rps, 1);
  });
  test("Nick and Kev sit below the line, not in the recruiter totals", () => {
    assert.deepEqual(board.leadership.map((p) => p.slug), ["nick", "kev"]);
  });
  test("with no Rev Report and no Hub figure, revenue is 'not synced' and no per-person amount is invented", () => {
    assert.equal(board.revenue.hub.status, "not synced");
    assert.equal(board.revenue.recruiters.status, "not synced");
    assert.ok(board.recruiters.every((p) => p.revenue_qtd === null && p.pct_to_accelerator === null));
  });
  test("a Hub figure is labelled as not gated by Tally", () => {
    const b = buildBoard({ nowMs: NOW, counts: countActivities([], jobs, [], W), jobsRead: 0, stageJobsRead: 0, fetchedActivities: 0, hub: { billings_ytd: 100, as_of: "2026-10-16", source: "Hub" } });
    assert.match(b.revenue.hub.status, /not gated/);
  });
  test("the week is labelled partial and compared to last week at the same point", () => {
    assert.equal(board.week.partial, true);
    assert.equal(board.week.label, "Sun 18 Oct to Thu 22 Oct");
    assert.match(board.week.note, /same point/);
  });
  test("no contact name, phone or email can reach the document", () => {
    const named: ActivityRow = { ...act("rp", "max", "2026-10-19T17:00:00Z"), ParentId: { Id: "c1", ...({ Title: "Hernandez, Danny", Phone: "5551230000" } as object) } };
    const json = JSON.stringify(buildBoard({ nowMs: NOW, counts: countActivities([named], jobs, [], W), jobsRead: 1, stageJobsRead: 1, fetchedActivities: 1 }));
    assert.ok(!/Hernandez|Danny|5551230000|@/.test(json));
  });
});

describe("Rev Report (optional export of the 2026 Rev Report tab)", () => {
  const csv = [
    ",2026 - REV REPORT - EPG,,,,,,,,,,,,,,,,,,,",
    "Prtnr,Rec.,Split %,#,Candidate,Start Date,Net Terms,Date: $ In,Client,Role,H.A.,Salary,Rate,Fee,Discount,Eden Gross,Tax,External Split,Sign-On,Eden Net,Notes",
    'JG,,,62021,A Person,1/5/2026,,,PB South,Super,Jeff,"$ 170,000.00",18%,"$ 30,600.00","$ 7,500.00","$ 23,100.00","$ 3,465.00",$ -,$ -,"$ 23,100.00",',
    ',Juice,25.00%,62060,B Person,10/12/2026,,,Swinerton,Super,Tyler,"$ 150,000.00",20%,"$ 30,000.00",$ -,"$ 30,000.00",$ 4,500.00,$ -,$ -,"$ 30,000.00",',
    ',Max,50%,62061,C Person,10/20/2026,,,Hoffman,PM,X,"$ 100,000.00",20%,"$ 20,000.00",$ -,"$ 20,000.00",$ 3,000.00,$ -,$ -,"$ 20,000.00",',
    ',Zed,50%,62062,D Person,10/21/2026,,,Hoffman,PM,X,"$ 100,000.00",20%,"$ 20,000.00",$ -,"$ 20,000.00",$ 3,000.00,$ -,$ -,"$ 20,000.00",',
    ',Evan,,62063,E Person,10/22/2026,,,Hoffman,PM,X,"$ 100,000.00",20%,"$ 10,000.00",$ -,"$ 10,000.00",$ 3,000.00,$ -,$ -,"$ 10,000.00",',
    ",,,62064,Triton Retainer,10/1/2026,,,Triton,N/A,,$ -,100%,\"$ 7,500.00\",$ -,\"$ 7,500.00\",$ -,$ -,$ -,\"$ 7,500.00\",",
  ].join("\n");
  const rows = parseRevCsv(csv);
  const rev = revenueByRecruiter(rows, W);
  test("money parsing handles dollars, dashes and commas", () => {
    assert.equal(money("$ 23,100.00"), 23100);
    assert.equal(money("$ -"), 0);
    assert.equal(money(""), null);
  });
  test("credit is Eden Gross x split, by start date in the quarter; other quarters are left out", () => {
    assert.equal(rev.perPerson.andrew, 7500);                  // Juice is Andrew
    assert.equal(rev.perPerson.max, 10000);
    assert.equal(rev.perPerson.evan, undefined);               // recruiter named, no split: not credited, not guessed
  });
  test("unknown names and missing splits are reported, not hidden", () => {
    assert.deepEqual(rev.unmapped, ["Zed"]);
    assert.equal(rev.noSplit, 1);
  });
  test("placements this quarter skip retainers", () => {
    assert.equal(rev.placementsQtd, 4);
    assert.equal(rev.placementsWeek, 3);
  });
  test("percent to the $25k accelerator appears only when the Rev Report is supplied", () => {
    const b = buildBoard({ nowMs: NOW, counts: countActivities([], jobs, [], W), rev, jobsRead: 0, stageJobsRead: 0, fetchedActivities: 0 });
    assert.equal(b.recruiters.find((p) => p.slug === "andrew")!.pct_to_accelerator, 30);
    assert.equal(b.recruiters.find((p) => p.slug === "noah")!.revenue_qtd, 0);
    assert.equal(b.recruiters.find((p) => p.slug === "kyle")!.revenue_qtd, null);   // no Crelate user yet
    assert.ok(b.notes.some((x) => /Zed/.test(x)));
  });
  test("a file with no header row is refused", () => {
    assert.throws(() => parseRevCsv("a,b\n1,2"), /header/);
  });
});

describe("the Crelate client", () => {
  const SECRET = "sekrit-key-123";
  function fake(handler: (url: string) => { status?: number; body: unknown }): { f: Fetcher; calls: { url: string; headers: Record<string, string> }[] } {
    const calls: { url: string; headers: Record<string, string> }[] = [];
    const f: Fetcher = async (url, init) => {
      calls.push({ url, headers: init?.headers ?? {} });
      const r = handler(url), status = r.status ?? 200;
      return { ok: status < 400, status, statusText: "", headers: { get: () => null }, json: async () => r.body, text: async () => JSON.stringify(r.body) };
    };
    return { f, calls };
  }
  test("pages until a short page, sends the key and a browser User-Agent, and only reads", async () => {
    const { f, calls } = fake((u) => ({ body: { Data: u.includes("offset=0") ? Array.from({ length: 200 }, (_, i) => ({ Id: `x${i}` })) : [{ Id: "last" }], Errors: [] } }));
    const rows = await makeClient(SECRET, f).activities("2026-10-11T07:00:00Z");
    assert.equal(rows.length, 201);
    assert.equal(calls.length, 2);
    assert.equal(calls[0]!.headers["X-Api-Key"], SECRET);
    assert.match(calls[0]!.headers["user-agent"]!, /Mozilla/);
    assert.match(calls[0]!.url, /verb_ids=/);
  });
  test("an ignored filter stops the run rather than counting the whole company", async () => {
    const { f } = fake(() => ({ body: { Data: [], Errors: [{ Code: "IgnoredParameter", Message: "verb_ids" }] } }));
    await assert.rejects(makeClient(SECRET, f).activities("x"), /ignored a filter/);
  });
  test("a failed call reports the status and endpoint, never the key", async () => {
    const { f } = fake(() => ({ status: 403, body: {} }));
    await assert.rejects(makeClient(SECRET, f).jobs(), (e: Error) => /403/.test(e.message) && /jobs/.test(e.message) && !e.message.includes(SECRET));
  });
  test("runBoard builds the document from the client's reads", async () => {
    const client = {
      activities: async () => [act("rp", "max", "2026-10-19T17:00:00Z")],
      jobs: async () => jobs,
      stageEntries: async () => [] as StageRow[],
    };
    const b = await runBoard({ client, nowMs: NOW });
    assert.equal(b.team.this.rps, 1);
    assert.equal(b.jos_meta.active_total, 1);
    assert.equal(b.goals.rps_week, GOALS.rps_week);
  });
});
