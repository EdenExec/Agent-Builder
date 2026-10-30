import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as P from "./office-projects.js";
import { buildAgentProjects, ownerNames, type ProjectDef } from "./desk-projects.ts";
import { loadProjectDefs, parseDue, scheduleRows, scheduleStatus } from "../office/projects-load.ts";
import { buildFeed, repoLink, scrub, type SyncInput } from "./office.ts";
import { readOfficePage } from "../office/page-game.ts";

const NOW = Date.parse("2026-10-29T17:00:00Z");
const iso = (agoMs: number) => new Date(NOW - agoMs).toISOString();
const H = 3_600_000, D = 24 * H;
const tk = (o: Record<string, unknown>) => ({ id: "t1", agent: "q", status: "open", ask: "Do the thing", createdAt: iso(H), ...o }) as P.ProjectTicket;

describe("short titles", () => {
  test("cutWords never breaks a word and marks the cut", () => {
    assert.equal(P.cutWords("one two three", 8), "one two three");
    assert.equal(P.cutWords("Get two EOR and two BaaS quotes on identical assumptions", 8), "Get two EOR and two BaaS quotes on…");
    assert.equal(P.cutWords("alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota", 3), "alpha, beta, gamma…");
    assert.equal(P.cutWords("", 8), "");
  });
  test("the first clause stops at a sentence, semicolon, colon, dash or bracket", () => {
    assert.equal(P.firstClause("Matched 6 of 8; 2 left unknown."), "Matched 6 of 8");
    assert.equal(P.firstClause("Draft a day-one page (example)"), "Draft a day-one page");
    assert.equal(P.firstClause("Pack drafted. Docket reviews next."), "Pack drafted");
    assert.equal(P.firstClause("Rate is 6.5 percent today"), "Rate is 6.5 percent today");
  });
  test("a ticket's own title wins; otherwise the summary's first clause when done, else the ask's", () => {
    assert.equal(P.ticketTitle(tk({ title: "Crelate mirror schema" })), "Crelate mirror schema");
    assert.equal(P.ticketTitle(tk({ status: "done", result: { summary: "Matched 6 of 8 missed calls; 2 unknown" } })), "Matched 6 of 8 missed calls");
    assert.equal(P.ticketTitle(tk({ status: "working", ask: "Tidy the ZoomInfo pull notes. Remove stale columns.", result: { summary: "ignored while open" } })), "Tidy the ZoomInfo pull notes");
    assert.equal(P.ticketTitle(tk({ status: "done", ask: "Ask only", result: null })), "Ask only");
    assert.equal(P.ticketTitle(tk({ status: "done", result: { summary: "Passed 3/3; the numbers gate cleared for Tally and Docket" } })), "Passed 3/3; the numbers gate cleared for Tally…");
    assert.ok(P.ticketTitle(tk({ title: "a b c d e f g h i j k l" })).split(" ").length <= 8);
  });
  test("the need line is about twelve words, from blockedOn or the exact action", () => {
    assert.equal(P.needLine(tk({ status: "blocked", blockedOn: "CloudTalk connector sign-in expired; reconnect it so the load can run" })), "CloudTalk connector sign-in expired; reconnect it so the load can run");
    assert.ok(P.needLine(tk({ status: "blocked", blockedOn: "one two three four five six seven eight nine ten eleven twelve thirteen fourteen" })).endsWith("…"));
    assert.equal(P.needLine(tk({ status: "gated", proposed: { exact: "To: Kev\nSubject: Next steps" } })), "To: Kev Subject: Next steps");
    assert.equal(P.needLine(tk({ status: "blocked" })), "");
  });
});

describe("which project a ticket belongs to", () => {
  const defs = [{ id: "eden-crm", keywords: ["Eden CRM", "Crelate mirror"] }, { id: "eden-staffing", keywords: ["Eden Staffing", "EOR", "BaaS"] }];
  test("the ticket's project field first, then a projects/ path, then keywords", () => {
    assert.deepEqual(P.inferProject(tk({ project: "eden-crm", ask: "EOR quotes" }), defs), { id: "eden-crm", how: "field" });
    assert.deepEqual(P.inferProject(tk({ project: "unknown", ask: "Get EOR quotes" }), defs), { id: "eden-staffing", how: "keyword" });
    assert.deepEqual(P.inferProject(tk({ ask: "See projects/eden-crm/brief.md" }), defs), { id: "eden-crm", how: "path" });
    assert.deepEqual(P.inferProject(tk({ ask: "Build the Crelate mirror nightly" }), defs), { id: "eden-crm", how: "keyword" });
  });
  test("keywords are whole words and a ticket with no hit belongs to no project", () => {
    assert.equal(P.inferProject(tk({ ask: "Tidy the eoriented list" }), defs), null);
    assert.equal(P.inferProject(tk({ ask: "Refresh a lead bucket" }), defs), null);
  });
  test("tickets group by project; old done and cancelled ones drop out", () => {
    const g = P.groupTickets([tk({ id: "a", project: "eden-crm" }), tk({ id: "b", status: "done", doneAt: iso(8 * D), project: "eden-crm" }), tk({ id: "c", status: "done", doneAt: iso(D) }), tk({ id: "d", status: "cancelled" })], defs, NOW);
    assert.deepEqual(g.byProject["eden-crm"]!.map((x) => x.id), ["a"]);
    assert.deepEqual(g.loose.map((x) => x.id), ["c"]);
  });
});

describe("a project's items", () => {
  test("group needs, open, shipped; shipped newest first and only the last 7 days", () => {
    const items = P.mergeItems(
      [{ title: "file shipped old", state: "shipped", at: iso(9 * D) }, { title: "file open", state: "open" }],
      [tk({ id: "x", status: "done", doneAt: iso(2 * D), title: "older" }), tk({ id: "y", status: "done", doneAt: iso(H), title: "newer" }), tk({ id: "z", status: "gated", title: "needs kev" })], NOW);
    assert.deepEqual(items.map((i) => i.title), ["needs kev", "file open", "newer", "older"]);
    assert.deepEqual(P.countItems(items), { needs: 1, open: 1, shipped: 2 });
    assert.deepEqual(P.chips(P.countItems(items)), ["1 open", "1 needs you", "2 shipped"]);
    assert.deepEqual(P.chips({ needs: 0, open: 0, shipped: 0 }), []);
  });
  test("a status line is ten words or fewer", () => {
    assert.ok(P.autoStatus([{ title: "Waiting for the answers to three long open questions from Kev today", state: "needs" }]).split(" ").length <= 10);
    assert.equal(P.autoStatus([]), "Quiet this week");
  });
});

describe("the builder", () => {
  const defs: ProjectDef[] = [
    { id: "eden-crm", title: "Eden CRM", agents: ["q"], keywords: ["Crelate mirror"], link: "projects/eden-crm/brief.md" },
    { id: "eden-staffing", title: "Eden Staffing", agents: ["pm", "docket"], keywords: ["EOR"], status: "1 of 3 rows done", link: "projects/eden-staffing/schedule.md", rows: [
      { owner: "Kev", item: { title: "ES-01 Confirm owners", state: "needs", link: "", note: "Kev confirms" } },
      { owner: "Docket (A)", item: { title: "ES-06 Shortlists", state: "open", link: "projects/eden-staffing/legal/05-issues-memo.md" } },
      { owner: "Jenny", item: { title: "AB-04 Names", state: "shipped", at: iso(2 * D) } }] },
  ];
  const q = { id: "q", name: "Q" }, pm = { id: "pm", name: "Pam" }, docket = { id: "docket", name: "Docket" }, tally = { id: "tally", name: "Tally" };
  const run = (a: { id: string; name: string }, tickets: P.ProjectTicket[]) => buildAgentProjects(a, defs, tickets, new Date(NOW), repoLink, scrub);
  test("the owner sees every row, another agent only its own rows", () => {
    assert.equal(run(pm, [])[0]!.items.length, 3);
    assert.deepEqual(run(docket, [])[0]!.items.map((i) => i.title), ["ES-06 Shortlists"]);
    assert.deepEqual(run(tally, []), []);
  });
  test("a ticket that belongs to a project lists that project on the agent's desk, even one it does not own", () => {
    const p = run(tally, [tk({ id: "k1", agent: "tally", ask: "Re-run the EOR quote examples", status: "working" })]);
    assert.equal(p[0]!.id, "eden-staffing");
    assert.equal(p[0]!.items[0]!.ticket, "k1");
  });
  test("links become http(s) URLs, the project's status is the file's, and an empty project is kept for its owner", () => {
    const p = run(docket, [])[0]!;
    assert.match(p.items[0]!.link!, /^https:\/\/github\.com\/.+\/projects\/eden-staffing\/legal\/05-issues-memo\.md$/);
    assert.equal(p.status, "1 of 3 rows done"); assert.equal(p.statusAuto, false);
    const e = run(q, [])[0]!;
    assert.equal(e.id, "eden-crm"); assert.equal(e.statusAuto, true); assert.equal(e.items.length, 0); assert.match(e.link!, /^https:/);
  });
  test("ticket items carry the short title, the state and the result link; projects sort needs first", () => {
    const p = run(q, [tk({ id: "d1", status: "done", doneAt: iso(H), title: "Schema drafted", project: "eden-crm", result: { summary: "x", link: "projects/eden-crm/brief.md" } }), tk({ id: "b1", status: "blocked", ask: "Mirror the Crelate mirror", blockedOn: "Needs the API key" })]);
    assert.deepEqual(p[0]!.items.map((i) => [i.title, i.state]), [["Mirror the Crelate mirror", "needs"], ["Schema drafted", "shipped"]]);
    assert.match(p[0]!.items[1]!.link!, /^https:/);
  });
  test("owner names match by first word only", () => {
    assert.ok(ownerNames("Docket (A)", "Docket")); assert.ok(!ownerNames("Employment attorney (through Kev)", "Kev")); assert.ok(ownerNames("Kev", "Kev"));
  });
  test("the sync writes projects into each agent document, and none when the sync had no definitions", () => {
    const base = { now: new Date(NOW), agents: [{ id: "q", name: "Q" }], qc: [], gates: [], routines: [], tickets: [tk({ id: "d1", status: "done", doneAt: iso(H), project: "eden-crm", title: "Schema drafted" })] } as unknown as SyncInput;
    const withDefs = buildFeed({ ...base, projectDefs: defs }).docs["agents/q"] as { projects?: { id: string }[] };
    assert.deepEqual(withDefs.projects!.map((p) => p.id), ["eden-crm"]);
    assert.equal((buildFeed(base).docs["agents/q"] as { projects?: unknown }).projects, undefined);
  });
});

describe("reading the files", () => {
  test("dates in a schedule: day and month, an explicit year, the file's year otherwise", () => {
    assert.equal(parseDue("Wed 28 Oct (A)", 2026), "2026-10-28");
    assert.equal(parseDue("Fri 8 Jan 2027 (A)", 2026), "2027-01-08");
    assert.equal(parseDue("Not started", 2026), null);
  });
  const dir = mkdtempSync(join(tmpdir(), "desk-projects-"));
  const sched = join(dir, "schedule.md");
  writeFileSync(sched, `---
date: 2026-10-28
---
| ID | Deliverable | Milestone | Owner | Due | Status | Next action | Chase | Source |
|---|---|---|---|---|---|---|---|---|
| ES-01 | Owners and dates confirmed | M1 | Kev | Mon 26 Oct | Slipped (due Mon 26 Oct) | Kev confirms | | PM |
| ES-02 | Answers to the open questions | M1 | Kev | Fri 6 Nov (A) | Not started | Radar asks | | PM |
| ES-03 | Trades list | M2 | Nick (A) | Tue 27 Oct (A) | At risk | Kev sends Nick the ask (draft in \`draft.md\`) | | PM |
| AB-01 | First drafts | M6 | Docket | Fri 30 Oct (A) | Done (23 Oct) | Five drafts saved | | PM |
`);
  writeFileSync(join(dir, "draft.md"), "x");
  const today = "2026-10-29";
  test("a schedule's rows become items: Done is shipped (dated), a slipped Kev row needs him, the rest are open", () => {
    const rows = scheduleRows(sched, today);
    assert.deepEqual(rows.map((r) => [r.item.title.split(" ")[0], r.item.state]), [["ES-01", "needs"], ["ES-02", "open"], ["ES-03", "open"], ["AB-01", "shipped"]]);
    assert.equal(rows[3]!.item.at, "2026-10-23T12:00:00Z");
    assert.match(rows[2]!.item.link!, /draft\.md$/);
    assert.equal(rows[0]!.item.link, "");
    assert.equal(scheduleStatus(rows), "1 of 4 rows done, 1 slipped, 1 at risk");
  });
  test("the repo's own definitions: Pam owns Eden Staffing with the schedule's rows; every project names an owner agent", () => {
    const defs = loadProjectDefs("projects", "2026-10-29");
    const es = defs.find((d) => d.id === "eden-staffing")!;
    assert.equal(es.agents[0], "pm");
    assert.ok(es.rows!.length >= 20 && es.rows!.some((r) => r.item.title.startsWith("ES-01")));
    assert.ok(es.status!.split(" ").length <= 10);
    assert.ok(defs.every((d) => d.agents.length > 0 && d.title.length > 0));
    assert.ok(!defs.some((d) => /\d{3} SE|101st/i.test(d.title)), "no street address in a title");
  });
  test("a brief's own office block beats the owners file", () => {
    const root = mkdtempSync(join(tmpdir(), "desk-root-"));
    mkdirSync(join(root, "alpha")); mkdirSync(join(root, "virtual-office"));
    writeFileSync(join(root, "alpha", "brief.md"), "---\ntitle: Alpha brief\noffice:\n  agents: [scout]\n  keywords: [alphabet]\n---\n# Alpha\n");
    writeFileSync(join(root, "virtual-office", "project-owners.yaml"), "projects:\n  alpha:\n    title: Alpha project\n    agents: [q]\n    keywords: [other]\n");
    const d = loadProjectDefs(root, "2026-10-29").find((x) => x.id === "alpha")!;
    assert.deepEqual(d.agents, ["scout"]); assert.equal(d.title, "Alpha project"); assert.deepEqual(d.keywords, ["alphabet", "other"]);
  });
});

describe("the page's copy of the projects core", () => {
  test("is a verbatim copy of workshop/core/office-projects.js (run `npm run office -- build-page` if this fails)", async () => {
    const { buildProjectsBlock, currentProjectsBlock } = await import("../office/page-game.ts");
    const html = await readOfficePage();
    assert.equal(currentProjectsBlock(html), buildProjectsBlock(readFileSync("workshop/core/office-projects.js", "utf8")));
  });
  test("gives the same answers as the sync's", async () => {
    const { currentProjectsBlock } = await import("../office/page-game.ts");
    const Proj = new Function(currentProjectsBlock(await readOfficePage())! + "; return Proj;")();
    const t = tk({ status: "done", result: { summary: "Matched 6 of 8; 2 left" } });
    assert.equal(Proj.ticketTitle(t), P.ticketTitle(t));
    assert.deepEqual(Proj.mergeItems([], [t], NOW), P.mergeItems([], [t], NOW));
  });
});
