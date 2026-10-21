import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildFeed, buildAlerts, buildAgents, findUnused, planWrites, chunk, scrub, type SyncInput } from "./office.ts";
import type { QcItem } from "./qc.ts";
import type { GateRecord } from "./numbers-gate.ts";

const now = new Date("2026-10-21T18:00:00Z");
const agents = [
  { id: "radar", name: "Radar" }, { id: "q", name: "Q" }, { id: "dean", name: "Dean" },
  { id: "tally", name: "Tally" }, { id: "housing-architect", name: "Marlowe" }, { id: "scout", name: "Scout" },
];
const qcItem = (o: Partial<QcItem>): QcItem => ({ id: "x", employee: "q", kind: "spend", summary: "s", detail: "d", status: "pending", createdAt: "2026-10-21T10:00:00Z", ...o });
const base = (o: Partial<SyncInput> = {}): SyncInput => ({ now, agents, qc: [], gates: [], routines: [], ...o });
const gate = (o: Partial<GateRecord>): GateRecord => ({ id: "g1", subject: "September packet", preparer: "tally", checker: "docket", status: "passed", items: [], createdAt: "2026-10-20T10:00:00Z", closedAt: "2026-10-21T10:00:00Z", ...o });

describe("office lights", () => {
  test("a pending message draft is green-blink review; a spend is amber; 5 days old goes red", () => {
    const a = buildAlerts(base({ qc: [qcItem({ id: "a", employee: "dean", kind: "send_message" }), qcItem({ id: "b", kind: "spend" }), qcItem({ id: "c", kind: "spend", createdAt: "2026-10-10T00:00:00Z" })] }));
    assert.deepEqual(Object.fromEntries(a.map((x) => [x.id, x.light])), { "sync-qc-a": "review", "sync-qc-b": "blocked", "sync-qc-c": "urgent" });
    assert.ok(a.every((x) => x.needsKev));
  });
  test("a recently cleared gate lights its preparer; an old one does not; a failed one is red and not for Kev", () => {
    const a = buildAlerts(base({ gates: [gate({ id: "new" }), gate({ id: "old", closedAt: "2026-10-10T00:00:00Z" }), gate({ id: "bad", status: "failed", preparer: "dean" })] }));
    assert.deepEqual(a.map((x) => [x.id, x.agent, x.light, x.needsKev]), [["sync-gate-new", "tally", "review", true], ["sync-gate-bad", "dean", "urgent", false]]);
  });
  test("a routine with no trigger blocks on Kev", () => {
    const a = buildAlerts(base({ routines: [{ id: "n", name: "Nightly", agent: "q", trigger_id: null }, { id: "ok", name: "Brief", agent: "radar", trigger_id: "trig_1" }] }));
    assert.equal(a.length, 1);
    assert.equal(a[0]!.light, "blocked");
  });
  test("priority: urgent beats reply beats review beats blocked beats working", () => {
    const input = base({
      qc: [qcItem({ id: "r", employee: "radar", kind: "send_message" })],
      inbox: [{ title: "Evan: submittal question", kind: "team", raisedAt: "2026-10-21T17:00:00Z" }],
      nowFiles: { radar: { state: "working", task: "Sweep", updated: "2026-10-21T17:30:00Z" } },
    });
    const radar = () => buildAgents(input, buildAlerts(input)).find((x) => x.id === "radar")!;
    assert.equal(radar().light, "reply");
    input.calls = [{ who: "A Client", at: "2026-10-21T16:00:00Z" }];
    assert.equal(radar().light, "urgent");
    assert.equal(radar().counts.review, 1);
    assert.equal(radar().counts.working, 1);
  });
  test("a returned call raises nothing", () => {
    assert.equal(buildAlerts(base({ calls: [{ who: "A", at: "2026-10-21T16:00:00Z", returned: true }] })).length, 0);
  });
  test("overdue ledger rows map owners to agents; Kev's go to Radar and need him; Marlowe maps to housing-architect", () => {
    const a = buildAlerts(base({ ledger: [
      { item: "Send deck", owner: "Kev", due: "2026-10-20", status: "Not started" },
      { item: "Courtyard study", owner: "Marlowe", due: "2026-10-19" },
      { item: "Done thing", owner: "Kev", due: "2026-10-01", status: "Done" },
      { item: "Not due yet", owner: "Kev", due: "2026-10-21" },
    ] }));
    assert.deepEqual(a.map((x) => [x.agent, x.needsKev]), [["radar", true], ["housing-architect", false]]);
  });
});

describe("staleness: a green glow on a dead agent is the worst lie", () => {
  const nf = { q: { state: "working" as const, task: "Mirror sync" } };
  test("working and heard within 4 hours: working", () => {
    const i = base({ nowFiles: { q: { ...nf.q, updated: "2026-10-21T15:00:00Z" } } });
    const q = buildAgents(i, []).find((x) => x.id === "q")!;
    assert.equal(q.light, "working");
    assert.equal(q.stale, false);
  });
  test("working but silent for a day: idle and stale, never green", () => {
    const i = base({ nowFiles: { q: { ...nf.q, updated: "2026-10-20T12:00:00Z" } } });
    const q = buildAgents(i, []).find((x) => x.id === "q")!;
    assert.equal(q.light, "idle");
    assert.equal(q.stale, true);
  });
  test("a ticket Radar picked up an hour ago counts as heard", () => {
    const i = base({ tickets: [{ id: "t1", agent: "scout", status: "picked", pickedAt: "2026-10-21T17:00:00Z" }] });
    const s = buildAgents(i, []).find((x) => x.id === "scout")!;
    assert.equal(s.light, "working");
    assert.equal(s.openTickets, 1);
  });
  test("no news for longer than the expected rhythm is silent", () => {
    const i = base({ heard: { dean: "2026-10-10T00:00:00Z", radar: "2026-10-21T16:00:00Z" } });
    const by = Object.fromEntries(buildAgents(i, []).map((x) => [x.id, x]));
    assert.equal(by.dean!.silent, true);
    assert.equal(by.radar!.silent, false);
  });
});

describe("privacy", () => {
  test("scrub removes emails, phone numbers and amounts, and truncates", () => {
    assert.equal(scrub("Mail kyle@example.com or call (509) 555-0134 about $85,000 base"), "Mail [email] or call [number] about [amount] base");
    assert.equal(scrub("Plan $22/month", 90, true), "Plan $22/month");
    assert.ok(scrub("x".repeat(200), 50).length <= 50);
  });
  test("QC summaries are scrubbed in alerts, and family, finance and coaching alerts are marked sensitive", () => {
    const a = buildAlerts(base({ qc: [qcItem({ id: "s", employee: "tally", kind: "send_message", summary: "Send to joel@edenexec.com salary $120,000" })] }));
    assert.ok(!/joel@|120,000/.test(a[0]!.title));
    assert.equal(a[0]!.sensitive, true);
    assert.equal(buildAlerts(base({ qc: [qcItem({ employee: "scout" })] }))[0]!.sensitive, false);
  });
});

describe("unused tools", () => {
  const tools = [
    { id: "hub", name: "Hub", kind: "artifact" as const, owner: "radar", expectedEveryDays: 3 },
    { id: "nightly", name: "Nightly", kind: "routine" as const, owner: "q", routineId: "n" },
    { id: "gate", name: "Gate", kind: "queue" as const, owner: "tally", expectedEveryDays: 14 },
    { id: "spendy", name: "Spendy", kind: "script" as const, owner: "q", qcId: "pend" },
  ];
  test("flags routines without triggers, pending approvals, quiet tools and unrecorded ones; leaves used ones alone", () => {
    const f = findUnused(tools, [{ id: "n", name: "N", agent: "q", trigger_id: null }], [qcItem({ id: "pend" })], { "open-gate": "2026-10-20T00:00:00Z", "open-hub": "2026-10-01T00:00:00Z" }, {}, now);
    const by = Object.fromEntries(f.map((x) => [x.id, x]));
    assert.match(by.nightly!.why, /never switched on/);
    assert.match(by.spendy!.why, /Waiting on your yes/);
    assert.match(by.hub!.why, /Quiet for 20 days/);
    assert.equal(by.gate, undefined);
    assert.equal(by.hub!.evidence, "office-clicks");
  });
  test("a tool with no evidence is flagged as unrecorded, not as proven unused", () => {
    const f = findUnused([tools[0]!], [], [], {}, {}, now);
    assert.equal(f[0]!.evidence, "none");
  });
});

describe("write plan", () => {
  test("new docs are plain sets, existing docs carry if_version, unchanged docs are skipped, resolved sync alerts are deleted, radar alerts survive", () => {
    const docs = { "agents/q": { id: "q", updated: "t2" }, "agents/radar": { id: "radar", light: "idle" }, "alerts/sync-new": { a: 1 } };
    const existing = {
      "agents/q": { version: 4, data: { id: "q", updated: "t1" } },
      "agents/radar": { version: 2, data: { id: "radar", light: "urgent" } },
      "alerts/sync-gone": { version: 7 },
      "alerts/radar-manual": { version: 1 },
    };
    const ops = planWrites(docs, existing);
    assert.deepEqual(ops.map((o) => `${o.op} ${o.collection}/${o.doc_id} v${o.if_version ?? "-"}`), ["set agents/radar v2", "set alerts/sync-new v-", "delete alerts/sync-gone v7"]);
  });
  test("batches hold at most 50", () => {
    assert.deepEqual(chunk(Array.from({ length: 120 }, (_, i) => i)).map((c) => c.length), [50, 50, 20]);
  });
  test("a full feed has one agents doc per agent, a sync doc that names what was skipped, and no secrets", () => {
    const f = buildFeed(base({ qc: [qcItem({})] }));
    assert.equal(Object.keys(f.docs).filter((k) => k.startsWith("agents/")).length, agents.length);
    assert.ok((f.docs["meta/sync"] as { skipped: string[] }).skipped.some((s) => /ledger/.test(s)));
    const t = buildFeed(base({ qc: [qcItem({ id: "pend" })], routines: [{ id: "n", name: "N", agent: "q", trigger_id: null }] }), [{ id: "x", name: "X", kind: "routine", owner: "q", routineId: "n", qcId: "pend" }]);
    assert.deepEqual([(t.docs["tools/x"] as any).noTrigger, (t.docs["tools/x"] as any).waitingOnKev], [true, true]);
    assert.ok(!/api[_-]?key|secret|password/i.test(JSON.stringify(f.docs)));
  });
});
