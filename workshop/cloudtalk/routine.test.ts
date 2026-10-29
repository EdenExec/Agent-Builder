import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { compileAllQ, validateQRoutines } from "./routine.ts";
import { loadEmployee } from "../core/employee.ts";

describe("q's CloudTalk nightly routine", () => {
  const { file, prompts } = compileAllQ();
  const r = file.routines.find((x) => x.id === "cloudtalk-nightly")!;

  test("is 11pm Pacific on weekdays only, never Saturday or Sunday", () => {
    assert.match(r.cron, /^CRON_TZ=America\/Los_Angeles \d+ 23 \* \* 1-5$/);
  });
  test("waits for Kev: no trigger id until he creates it with the connectors attached", () => {
    assert.equal(r.trigger_id, null);
    assert.deepEqual([...r.connectors].sort(), ["cloudtalk", "gmail"]);
  });
  test("validation refuses a Saturday run and a missing connector", () => {
    assert.ok(validateQRoutines({ ...file, routines: [{ ...r, cron: "CRON_TZ=America/Los_Angeles 3 23 * * 1-6" }] }).some((p) => /Saturday/.test(p)));
    assert.ok(validateQRoutines({ ...file, routines: [{ ...r, connectors: ["gmail"] }] }).some((p) => /cloudtalk/.test(p)));
  });
  test("the compiled prompt carries the playbook, the standing rules and the safety rails", () => {
    const p = prompts["cloudtalk-nightly"]!;
    assert.match(p, /PLAYBOOK: cloudtalk-nightly/);
    assert.match(p, /PLAYBOOK: standing-rules/);
    assert.match(p, /DRY RUN/);
    assert.match(p, /THE SABBATH is Friday sunset to Saturday sunset/);
    assert.match(p, /node workshop\/office\/sabbath\.ts/);
    assert.match(p, /ZoomInfo phone/);
    assert.match(p, /`send_draft` is never called/);
    assert.match(p, /no connectors|connector is missing/i);
    assert.ok(!/CRELATE_API_KEY=\S/.test(p) && !/sk-[a-z0-9]{10,}/i.test(p), "no secret in the prompt");
  });
  test("Q lists the playbook as one of its skills", () => {
    assert.ok(loadEmployee("employees/q").skills.some((s) => s.name === "cloudtalk-nightly"));
  });
});
