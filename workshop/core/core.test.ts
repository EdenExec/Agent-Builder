import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateSpec, loadEmployee, policyFor, compileSubagent, EmployeeError, type EmployeeSpec } from "./employee.ts";
import * as qc from "./qc.ts";
import { remember, recall } from "./memory.ts";

const goodSpec: EmployeeSpec = {
  id: "tester", name: "Tess", title: "Tester", summary: "Tests things.", model: "sonnet", tools: ["Read"],
  autonomy: { spend: "approve", send_message: "approve", start_work: "auto" },
  limits: { maxSpendUsd: 5, maxMinutesPerTask: 30 }, skills: ["a"],
};
const tmp = () => mkdtempSync(join(tmpdir(), "ab-"));

describe("validateSpec", () => {
  test("accepts a good spec", () => assert.deepEqual(validateSpec(goodSpec), []));
  test("rejects auto spend and auto messaging", () => {
    const bad = { ...goodSpec, autonomy: { spend: "auto", send_message: "auto" } };
    const p = validateSpec(bad);
    assert.equal(p.length, 2);
    assert.match(p.join(" "), /spend must be "approve"/);
    assert.match(p.join(" "), /send_message must be "approve"/);
  });
  test("rejects missing and malformed fields", () => {
    const p = validateSpec({ id: "Bad Id", autonomy: { spend: "approve", send_message: "approve", x: "maybe" }, limits: { maxSpendUsd: -1 } });
    assert.ok(p.some((m) => /kebab-case/.test(m)));
    assert.ok(p.some((m) => /"name" is required/.test(m)));
    assert.ok(p.some((m) => /autonomy.x/.test(m)));
    assert.ok(p.some((m) => /maxSpendUsd/.test(m)));
    assert.ok(p.some((m) => /maxMinutesPerTask/.test(m)));
  });
});

describe("policyFor", () => {
  test("gated kinds are always approve, unspecified default to approve", () => {
    assert.equal(policyFor({ ...goodSpec, autonomy: { spend: "auto" } as any }, "spend"), "approve");
    assert.equal(policyFor(goodSpec, "start_work"), "auto");
    assert.equal(policyFor(goodSpec, "delete"), "approve");
  });
});

describe("loadEmployee + compile", () => {
  function scaffold(omit?: string) {
    const root = tmp();
    const d = join(root, "tester");
    mkdirSync(d, { recursive: true });
    if (omit !== "brand") { mkdirSync(join(root, "_shared")); writeFileSync(join(root, "_shared", "eden-brand.md"), "# Eden\n\nMontserrat only.\n"); }
    for (const sub of ["skills", "memory/seed", "rubrics", "evals"]) mkdirSync(join(d, sub), { recursive: true });
    writeFileSync(join(d, "agent.yaml"), `id: tester\nname: Tess\ntitle: Tester\nsummary: Tests things.\nmodel: sonnet\ntools: [Read, Bash]\nautonomy: {spend: approve, send_message: approve, start_work: auto}\nlimits: {maxSpendUsd: 5, maxMinutesPerTask: 30}\nskills: [a]\n`);
    if (omit !== "persona") writeFileSync(join(d, "persona.md"), "You are Tess.\n");
    if (omit !== "skill") writeFileSync(join(d, "skills", "a.md"), "# a\n");
    writeFileSync(join(d, "memory/seed/s.md"), "seed\n");
    writeFileSync(join(d, "rubrics/r.md"), "rubric\n");
    writeFileSync(join(d, "evals/e.yaml"), "cases: []\n");
    return d;
  }
  test("loads a complete folder and compiles", () => {
    const emp = loadEmployee(scaffold());
    const out = compileSubagent(emp);
    assert.match(out, /^---\nname: tester\n/);
    assert.match(out, /tools: Read, Bash/);
    assert.match(out, /Needs a QC touch point before it happens: spend, send_message/);
    assert.match(out, /Runs without asking: start_work/);
    assert.match(out, /You are Tess\./);
    assert.match(out, /## Brand standard[\s\S]*Montserrat only\./);
  });
  test("reports every missing piece", () => {
    assert.throws(() => loadEmployee(scaffold("persona")), (e: any) => e instanceof EmployeeError && /persona.md is missing/.test(e.message));
    assert.throws(() => loadEmployee(scaffold("skill")), /skills\/a.md is listed/);
    assert.throws(() => loadEmployee(scaffold("brand")), /eden-brand\.md is missing/);
    assert.throws(() => loadEmployee(tmp()), /agent.yaml not found/);
  });
});

describe("qc", () => {
  test("gate honours limits and policy", () => {
    assert.equal(qc.gate(goodSpec, "start_work").allowed, true);
    assert.equal(qc.gate(goodSpec, "spend", 1).allowed, false);
    assert.equal(qc.gate(goodSpec, "send_message").allowed, false);
    const loose = { ...goodSpec, autonomy: { ...goodSpec.autonomy, publish: "auto" as const } };
    assert.equal(qc.gate(loose, "publish").allowed, true);
  });
  test("submit, list, decide, isApproved", () => {
    const root = tmp();
    const a = qc.submit(root, { employee: "tester", kind: "spend", summary: "Buy stock photo", detail: "d", amountUsd: 12 });
    const b = qc.submit(root, { employee: "tester", kind: "send_message", summary: "Email contractor", detail: "d", recipients: ["a@b.co"] });
    assert.equal(qc.list(root).length, 2);
    assert.equal(qc.isApproved(root, a.id), false);
    qc.decide(root, a.id, "approved", "ok");
    qc.decide(root, b.id, "rejected");
    assert.equal(qc.isApproved(root, a.id), true);
    assert.equal(qc.isApproved(root, b.id), false);
    assert.equal(qc.list(root).length, 0);
    assert.equal(qc.list(root, "rejected")[0]!.id, b.id);
    assert.equal(qc.list(root, "approved")[0]!.note, "ok");
  });
  test("validates input and unknown ids", () => {
    const root = tmp();
    assert.throws(() => qc.submit(root, { employee: "t", kind: "send_message", summary: "x", detail: "d" }), /recipients/);
    assert.throws(() => qc.submit(root, { employee: "t", kind: "spend", summary: "x", detail: "d" }), /amountUsd/);
    assert.throws(() => qc.submit(root, { employee: "t", kind: "delete", summary: " ", detail: "d" }), /summary/);
    assert.throws(() => qc.decide(root, "nope", "approved"), /No pending/);
    assert.equal(existsSync(join(root, "pending")), true);
  });
});

describe("memory", () => {
  test("remember appends, recall reads, bad topics refused", () => {
    const d = tmp();
    remember(d, "taste", "Likes\nwarm oak", new Date("2026-10-03T00:00:00Z"));
    remember(d, "taste", "Hates chrome", new Date("2026-10-04T00:00:00Z"));
    assert.equal(recall(d).taste, "- 2026-10-03: Likes warm oak\n- 2026-10-04: Hates chrome\n");
    assert.deepEqual(recall(d, "nothing"), {});
    assert.throws(() => remember(d, "../evil", "x"), /Topic/);
    assert.throws(() => remember(d, "taste", "  "), /Nothing/);
  });
});
