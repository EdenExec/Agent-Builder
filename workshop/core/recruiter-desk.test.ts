import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConfig, renderDesk, readConfigFrom, rampFor, checkpointsFor, scanForbidden, jobsForRecruiter, jobWrites, seedWrites, daysOn, validSlug, addDays, type HubJob } from "./recruiter-desk.ts";

const template = readFileSync("projects/recruiter-desk/draft/recruiter-desk.html", "utf8");

describe("config", () => {
  test("Kyle: accelerated ramp, checkpoints from his 2 Nov start match Dean's pre-start dates", () => {
    const c = buildConfig({ slug: "kyle", name: "Kyle Cockell", start: "2026-11-02", track: "accelerated", office: "Boise", today: "2026-10-21" });
    assert.equal(c.first, "Kyle");
    assert.deepEqual(c.checkpoints.map((x) => x.date), ["2026-11-06", "2026-11-13", "2026-11-20", "2026-12-01"]);
    assert.deepEqual(c.ramp, [{ from: "2026-11-02", rpsDay: 0 }, { from: "2026-11-09", rpsDay: 15 }]);
    assert.deepEqual(c.standards, { rpsDay: 15, rpsWeek: 75, rotateDays: 14 });
  });
  test("standard ramp steps 0, 5, 10, 15 by week; established has none", () => {
    assert.deepEqual(rampFor("2026-11-02", "standard").map((r) => r.rpsDay), [0, 5, 10, 15]);
    assert.deepEqual(rampFor("2026-11-02", "established"), []);
    assert.deepEqual(checkpointsFor("2026-11-02", "established"), []);
    assert.equal(checkpointsFor("2026-11-02", "standard").at(-1)!.date, addDays("2026-11-02", 89));
  });
  test("bad input is refused: slug, name with digits or an email, date, office, track", () => {
    const ok = { slug: "max", name: "Max Betcher", start: "2026-11-09" };
    assert.throws(() => buildConfig({ ...ok, slug: "Max Betcher" }));
    assert.throws(() => buildConfig({ ...ok, name: "max@example.com" }));
    assert.throws(() => buildConfig({ ...ok, name: "Max 555-123-4567" }));
    assert.throws(() => buildConfig({ ...ok, start: "11/09/2026" }));
    assert.throws(() => buildConfig({ ...ok, office: "Mars" }));
    assert.throws(() => buildConfig({ ...ok, track: "boss" as never }));
    assert.ok(validSlug("kyle") && !validSlug("-x") && !validSlug("a-"));
  });
  test("the config holds no pay, phone or email field", () => {
    const json = JSON.stringify(buildConfig({ slug: "kyle", name: "Kyle Cockell", start: "2026-11-02" }));
    assert.ok(!/salary|pay|comp|commission|phone|email|address/i.test(Object.keys(JSON.parse(json)).join(",")));
  });
});

describe("stamp-out", () => {
  test("renders the config and title into the template, and reads it back", () => {
    const c = buildConfig({ slug: "kyle", name: "Kyle Cockell", start: "2026-11-02", track: "accelerated" });
    const html = renderDesk(template, c);
    assert.match(html, /<title>Kyle's Desk<\/title>/);
    assert.deepEqual(readConfigFrom(html), c);
    assert.ok(!html.includes('"example":true'));
    assert.equal(html.split("DESK_CONFIG_START").length, 2);
  });
  test("a hostile name cannot close the script tag", () => {
    const c = { ...buildConfig({ slug: "x", name: "Xavier Q", start: "2026-11-02" }), hubName: "</script><img onerror=1>" };
    const html = renderDesk(template, c);
    assert.ok(!html.includes("</script><img"));
    assert.equal(readConfigFrom(html).hubName, c.hubName);
  });
  test("a template without exactly one marker pair is refused", () => {
    const c = buildConfig({ slug: "x", name: "Xavier Q", start: "2026-11-02" });
    assert.throws(() => renderDesk("<title>t</title>", c));
    assert.throws(() => renderDesk(template + "/*DESK_CONFIG_START*/{}/*DESK_CONFIG_END*/", c));
  });
  test("seed documents carry the profile and training only", () => {
    const w = seedWrites(buildConfig({ slug: "kyle", name: "Kyle Cockell", start: "2026-11-02" }), "2026-10-21T00:00:00Z");
    assert.deepEqual(w.map((x) => `${x.collection}/${x.doc_id}`), ["profile/me", "training/track"]);
  });
});

describe("privacy", () => {
  test("the template and every example string carry no client name, phone, email or dollar amount", () => {
    assert.deepEqual(scanForbidden(template), []);
  });
  test("the scanner catches each kind", () => {
    assert.ok(scanForbidden("call (208) 555-0142").includes("phone number"));
    assert.ok(scanForbidden("a@b.co").includes("email address"));
    assert.ok(scanForbidden("fee $12,000").includes("dollar amount"));
    assert.ok(scanForbidden("the Triton role").includes('client name "Triton"'));
    assert.deepEqual(scanForbidden("Senior Project Manager, Client A, 2026-11-02"), []);
  });
});

describe("jobs filter: the isolation guarantee", () => {
  const hub: HubJob[] = [
    { id: "a", client: "Acme Co", client_slug: "acme", role: "Senior PM", location: "Metro", status: "active", rank: 1, source: "meeting", condition: "only if Pat Doe lands the seat", leads: [{ title: "PM sheet", url: "https://drive.google.com/x", count: 40, built: "2026-10-19" }], team: [{ recruiter: "Kyle", since: "2026-10-30", role_on_job: "lead", note: "call 208 555 0142" }, { recruiter: "Max Betcher", since: "2026-10-01", role_on_job: "co-lead" }] },
    { id: "b", client: "Other Co", role: "Estimator", status: "active", team: [{ recruiter: "Evan", since: "2026-10-19", role_on_job: "lead" }] },
    { id: "c", client: "Quiet Co", discreet: true, role: "Safety", status: "active", team: [{ recruiter: "kyle", since: "2026-10-19", role_on_job: "standby" }] },
    { id: "d", client: "Old Co", role: "Closed role", status: "filled", team: [{ recruiter: "Kyle", since: "2026-09-01", role_on_job: "lead" }] },
  ];
  const mine = jobsForRecruiter(hub, "Kyle");
  test("only this recruiter's active jobs come through", () => {
    assert.deepEqual(mine.map((j) => j.id), ["a", "c"]);
    assert.ok(!JSON.stringify(mine).includes("Estimator"));
  });
  test("co-workers are a first name and a role, never dates or notes; condition, note, rank and source are dropped", () => {
    const j = mine[0]!;
    assert.deepEqual(j.coWorkers, [{ name: "Max", roleOnJob: "co-lead" }]);
    const s = JSON.stringify(mine);
    assert.ok(!/Betcher|Pat Doe|2026-10-01|555|meeting|rank/.test(s));
  });
  test("a discreet job keeps the Hub's label and standby is flagged", () => {
    const c = mine[1]!;
    assert.equal(c.client, "Client · discreet");
    assert.ok(c.standby && c.discreet);
    assert.ok(!JSON.stringify(c).includes("Quiet Co"));
  });
  test("what is written passes the privacy scan, and days on the job counts from `since`", () => {
    assert.deepEqual(scanForbidden(JSON.stringify(jobWrites(mine, "2026-10-21T00:00:00Z"))), []);
    assert.equal(daysOn("2026-10-19", new Date("2026-11-04T12:00:00Z")), 16);
  });
  test("nobody else's jobs for a name that is on none", () => {
    assert.deepEqual(jobsForRecruiter(hub, "Noah"), []);
  });
});
