// Guards the employees that ship in this repo: they must load, be consistent, and have fresh compiled agents.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { listEmployeeDirs, loadEmployee, compileSubagent, ALWAYS_GATED } from "./employee.ts";

const dirs = listEmployeeDirs("employees");

describe("shipped employees", () => {
  test("there is at least one", () => assert.ok(dirs.length > 0));
  for (const d of dirs) {
    const emp = loadEmployee(d);
    describe(emp.spec.id, () => {
      test("gates spending and messaging", () => {
        for (const k of ALWAYS_GATED) assert.equal(emp.spec.autonomy[k], "approve");
      });
      test("compiled subagent is up to date (run: npm run hire -- compile)", () => {
        const f = join(".claude/agents", `${emp.spec.id}.md`);
        assert.ok(existsSync(f), `${f} missing`);
        assert.equal(readFileSync(f, "utf8"), compileSubagent(emp));
      });
      test("every skill and rubric has content", () => {
        for (const s of emp.skills) assert.ok(s.body.trim().length > 200, s.name);
        for (const r of emp.rubrics) assert.ok(readFileSync(join(d, "rubrics", r), "utf8").includes("Pass line"), r);
      });
      test("evals are well formed", () => {
        for (const e of emp.evals) {
          const doc = parse(readFileSync(join(d, "evals", e), "utf8"));
          assert.ok(Array.isArray(doc.cases) && doc.cases.length > 0, e);
          const ids = new Set<string>();
          for (const c of doc.cases) {
            assert.ok(c.id && c.opening, `${e}: case needs id and opening`);
            assert.ok(!ids.has(c.id), `duplicate case ${c.id}`);
            ids.add(c.id);
            assert.ok(c.must_not?.length, `${c.id} needs must_not`);
          }
        }
      });
    });
  }
  test("project settings deny agents from approving their own QC items", () => {
    const s = JSON.parse(readFileSync(".claude/settings.json", "utf8"));
    const deny: string[] = s.permissions.deny;
    assert.ok(deny.some((x) => x.includes("qc -- approve")));
    assert.ok(deny.some((x) => x.includes("qc -- reject")));
    assert.ok(deny.includes("Write(qc/**)"));
  });
});
