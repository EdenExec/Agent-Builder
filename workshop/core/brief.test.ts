import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseBrief, missingFields, renderBrief, type Brief } from "./brief.ts";
import { lintDoc } from "../brand/lint.ts";

const full: Brief = {
  project: "Lakeside Infill", audience: "family", status: "draft",
  site: { jurisdiction: "Boise, ID (Ada County)", lotSizeSqFt: 9500, lotDims: "50 x 190 ft", constraints: ["west light"] },
  program: { type: "executive-home", bedrooms: 4, bathrooms: 3.5, targetSqFt: 3800, stories: 2, garageBays: 3, mustHaves: ["office", "mudroom"] },
  style: { words: ["quiet", "timber"], avoid: ["chrome"] },
  budget: { low: 1_500_000, high: 2_000_000, confidence: "rough" },
  assumptions: ["Public sewer and water"],
};

describe("brief", () => {
  test("complete brief has nothing missing and renders key facts", () => {
    assert.deepEqual(missingFields(full), []);
    const md = renderBrief(full);
    assert.match(md, /^---\ntitle: Lakeside Infill\n/);
    assert.match(md, /\| Jurisdiction \| Boise, ID \(Ada County\) \|/);
    assert.match(md, /4 bed \/ 3\.5 bath, about 3,800 sq ft, 2 stories, 3-bay garage/);
    assert.match(md, /\$1,500,000 to \$2,000,000 \(rough\)/);
    assert.match(md, /\| office \|\s+\|/);
    assert.doesNotMatch(md, /Incomplete/);
  });
  test("lists every gap and flags it in the render", () => {
    const m = missingFields({ audience: "nobody" as any, program: { bedrooms: 0 } as any, style: { words: ["one"] }, budget: { low: 5, high: 1 } });
    for (const k of ["project name", "audience", "site.jurisdiction", "program.bedrooms", "program.bathrooms", "program.mustHaves", "style.words", "budget.low is above", "assumptions"]) {
      assert.ok(m.some((x) => x.includes(k)), k);
    }
    assert.match(renderBrief({ ...full, site: { jurisdiction: "" } }), /Incomplete\.\*\* Missing: site\.jurisdiction/);
  });
  test("explicit empty assumptions list is allowed, missing is not", () => {
    assert.deepEqual(missingFields({ ...full, assumptions: [] }), []);
    assert.ok(missingFields({ ...full, assumptions: undefined as any }).length > 0);
  });
  test("parses YAML", () => {
    const b = parseBrief("project: X\naudience: public\nstatus: draft\nsite: {jurisdiction: Boise}\nprogram: {type: ranch, bedrooms: 3, bathrooms: 2, mustHaves: [porch]}\nstyle: {words: [a, b]}\nbudget: {high: 900000}\nassumptions: []\n");
    assert.deepEqual(missingFields(b), []);
    assert.match(renderBrief(b), /\$900,000 \(unknown\)/);
  });
  test("the review copy follows the Eden rules: result first, tables for data, no long bullet lists, passes the linter", () => {
    const md = renderBrief({ ...full, program: { ...full.program, mustHaves: ["a", "b", "c", "d", "e"] }, assumptions: ["1", "2", "3", "4", "5"] });
    assert.deepEqual(lintDoc(md), { errors: [], warnings: [] });
    assert.doesNotMatch(md, /^- /m);
    assert.match(md, /## Summary\n\n[^\n]*Boise/);
    assert.match(renderBrief({ ...full, assumptions: ["has | pipe"] }), /has \/ pipe/);
  });
});
