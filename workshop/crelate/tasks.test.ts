import { test } from "node:test";
import assert from "node:assert/strict";
import { screen, cleanTitle, isStale, pullTasks, type RawTask } from "./tasks.ts";

const NOW = Date.parse("2026-10-30T12:00:00Z");
const ago = (d: number) => new Date(NOW - d * 86_400_000).toISOString();
const SELF = "kev";
const task = (over: Partial<RawTask>): RawTask => ({
  Id: "t1", Display: "Call back about Boise super role", When: ago(2), CreatedOn: ago(10), ModifiedOn: ago(10),
  CreatedById: { Id: SELF, Title: "Kev Williams" }, ParentId: { Id: "c1", EntityName: "Contacts", Title: "Moore, Brad" }, ...over,
});

test("severely old, untouched tasks move off the list", () => {
  assert.ok(isStale(task({ When: ago(200), ModifiedOn: ago(200) }), SELF, NOW));
  assert.ok(!isStale(task({ When: ago(200), ModifiedOn: ago(3) }), SELF, NOW), "touched recently stays");
  assert.ok(!isStale(task({ When: ago(20), ModifiedOn: ago(60) }), SELF, NOW), "recently due stays");
  assert.ok(isStale(task({ When: null, ModifiedOn: ago(90) }), SELF, NOW), "no due date, long untouched");
  assert.ok(!isStale(task({ When: ago(200), ModifiedOn: ago(200), CreatedOn: ago(5), CreatedById: { Id: "nick", Title: "Nick" } }), SELF, NOW),
    "a fresh assignment from someone else always shows");
});

test("others' assignments first, then most overdue, then soonest due", () => {
  const doc = screen([
    task({ Id: "soon", When: new Date(NOW + 3 * 86_400_000).toISOString() }),
    task({ Id: "late", When: ago(10) }),
    task({ Id: "nick", When: ago(1), CreatedById: { Id: "nick", Title: "Nick Smith" } }),
    task({ Id: "old", When: ago(300), ModifiedOn: ago(300) }),
  ], SELF, NOW);
  assert.deepEqual(doc.active.map((t) => t.id), ["nick", "late", "soon"]);
  assert.equal(doc.active[0].assignedBy, "other");
  assert.equal(doc.active[0].assignerName, "Nick Smith");
  assert.equal(doc.active[1].overdueDays, 10);
  assert.equal(doc.active[2].overdueDays, null);
  assert.equal(doc.movedOn.count, 1);
  assert.equal(doc.movedOn.oldestDue, ago(300).slice(0, 10));
  assert.deepEqual(doc.active[1].record, { type: "Contact", name: "Moore, Brad" });
});

test("titles carry no emails, phones or markup", () => {
  assert.equal(cleanTitle("<p>Email brad@x.com or call (503) 555-1212</p>"), "Email [email] or call [phone]");
  assert.equal(cleanTitle(JSON.stringify(["Follow up", "on offer"])), "Follow up on offer");
  assert.equal(cleanTitle("x".repeat(200)).length, 140);
});

test("the pull only sends GETs, filtered to Kev's open tasks", async () => {
  const calls: { url: string; method?: string }[] = [];
  const fetcher = async (url: string, init: any = {}) => {
    calls.push({ url, method: init.method });
    const data = url.includes("users/self") ? { Id: "kev" } : [task({})];
    return { ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => ({ Data: data }), text: async () => "" };
  };
  const { selfId, tasks } = await pullTasks("k", fetcher as any);
  assert.equal(selfId, "kev");
  assert.equal(tasks.length, 1);
  assert.ok(calls.every((c) => c.method === "GET"));
  assert.match(calls[1].url, /tasks\?owner_ids=kev&completed=false/);
});
