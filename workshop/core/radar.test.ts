import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { compileAll, validateRoutines } from "./radar.ts";
import { loadEmployee } from "./employee.ts";

const DIR = "employees/radar";

describe("radar employee", () => {
  test("loads on the shared chassis with gated spend and messages", () => {
    const e = loadEmployee(DIR);
    assert.equal(e.spec.name, "Radar");
    assert.equal(e.spec.autonomy.spend, "approve");
    assert.equal(e.spec.autonomy.send_message, "approve");
    assert.ok(e.skills.some((s) => s.name === "standing-rules"));
    assert.ok(e.skills.some((s) => s.name === "roster-liaison"));
  });
});

describe("radar routines", () => {
  const { file, prompts } = compileAll(DIR);

  test("four routines, none on Saturday except the stand-up run that builds the Sunday Edition", () => {
    assert.equal(file.routines.length, 4);
    for (const r of file.routines) {
      const dow = r.cron.split(" ").at(-1)!;
      if (r.id === "stand-up") assert.match(dow, /6/);
      else assert.ok(!/6/.test(dow), `${r.id} must not fire on Saturday (got ${dow})`);
    }
  });
  test("the Friday review and the Sunday Edition ride on connector-bearing routines", () => {
    const byId = Object.fromEntries(file.routines.map((r) => [r.id, r]));
    assert.ok(byId["check-out"]!.skills.includes("week-review"));
    assert.ok(byId["stand-up"]!.skills.includes("sunday-edition"));
    for (const r of file.routines) assert.ok(r.trigger_id, `${r.id} must reuse an existing trigger with connectors`);
  });

  test("brief runs at 5:30 Sunday to Friday, sweeps hourly on weekdays", () => {
    const brief = file.routines.find((r) => r.id === "brief")!;
    assert.match(brief.cron, / 22 5 \* \* 0-5$/);
    const sweep = file.routines.find((r) => r.id === "sweep")!;
    assert.match(sweep.cron, / 7 7-18 \* \* 1-5$/);
  });

  test("every prompt is self-contained: persona, brand, standing rules, its playbook, its seeds, and the repo refresh step", () => {
    for (const r of file.routines) {
      const p = prompts[r.id]!;
      assert.match(p, /STEP 0, READ THE LIVE FILES/);
      assert.match(p, /Saturday is the Sabbath/);
      assert.match(p, /git clone --depth 1 --branch/);
      assert.match(p, /PERSONA \(employees\/radar\/persona\.md\)/);
      assert.match(p, /BRAND STANDARD/);
      assert.match(p, /PLAYBOOK: standing-rules/);
      assert.match(p, /Saturday: no Eden Daily/);
      for (const s of r.skills) assert.match(p, new RegExp(`PLAYBOOK: ${s} `));
      for (const s of r.seeds) assert.match(p, new RegExp(`SEED MEMORY: ${s} `));
      assert.ok(p.length < 60_000, `${r.id} prompt is ${p.length} chars; routine prompts are bounded to 64 KiB`);
    }
  });

  test("every routine updates a trigger Kev's account already holds", () => {
    const byId = Object.fromEntries(file.routines.map((r) => [r.id, r]));
    assert.equal(byId["brief"]!.trigger_id, "trig_01CWiJZcDZS9xJGZrxo5sjVh");
    assert.equal(byId["check-out"]!.trigger_id, "trig_01W4kTyfCd7VhMkvt5LDRZ9s");
    assert.equal(byId["stand-up"]!.trigger_id, "trig_016GSTsKArqZBPRZc2ZzFaTj");
    assert.equal(byId["sweep"]!.trigger_id, "trig_012VfA1Y4EBzyFoixKVGmNug");
  });

  test("validator catches Saturday firing, missing standing rules and bad cron", () => {
    const bad = {
      branch: "x",
      routines: [
        { id: "sweep", name: "s", trigger_id: null, cron: "CRON_TZ=America/Los_Angeles 0 9 * * 1-6", model: "m", skills: ["inbox-sweep"], seeds: [], notify: "none" },
        { id: "Bad Id", name: "", trigger_id: null, cron: "not a cron", model: "m", skills: [], seeds: [], notify: "sms" },
      ],
    };
    const p = validateRoutines(bad);
    assert.ok(p.some((x) => /Sabbath/.test(x)));
    assert.ok(p.some((x) => /standing-rules/.test(x)));
    assert.ok(p.some((x) => /kebab-case/.test(x)));
    assert.ok(p.some((x) => /5-field cron/.test(x)));
    assert.ok(p.some((x) => /notify/.test(x)));
  });
});
