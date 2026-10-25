import { test } from "node:test";
import assert from "node:assert/strict";
import { backHtml, checkPacket, CONSENT, coverHtml, googleLink, googleQuery, nameVariants, scoreLine, stateName, type Packet } from "./packet.ts";

const sample = (): Packet => ({
  candidate: { first: "Mike", last: "Example", middle: "James", title: "Low Voltage Project Manager", years: 12 },
  role_submitted: "Low Voltage PM, TX",
  pay: { basis: "desired", base: "$140K", bonus: "10%", vehicle: "$800/mo" },
  current_location: "Baton Rouge, LA",
  past_states: ["TX", "Mississippi"],
  highlights: ["Division 27 and 28 scopes", "Data center experience"],
  start_availability: "ASAP",
  actively_interviewing: "Not yet",
  concerns: "None known",
  must_dos: Array.from({ length: 7 }, (_, i) => ({ item: `Must do ${i + 1}`, rating: i === 6 ? "partial" : "meets", evidence: "From the screen" })),
  resume: "resume.pdf",
  references: [{ name: "Ref One", relationship: "Former PX" }],
  references_consent: true,
});

test("state names are spelled out from codes, cities and names", () => {
  assert.equal(stateName("TX"), "Texas");
  assert.equal(stateName("Baton Rouge, LA"), "Louisiana");
  assert.equal(stateName("louisiana"), "Louisiana");
  assert.equal(stateName("Bay Area"), "Bay Area");
});

test("name variations cover formal, nickname, middle initial and reversed", () => {
  const v = nameVariants({ first: "Mike", last: "Example", middle: "James" });
  assert.ok(v.includes("Mike Example") && v.includes("Michael Example") && v.includes("Mike J Example") && v.includes("Example, Mike"));
  assert.ok(v.length <= 6);
});

test("the Boolean searches names in the current state and every past state (Kev, 24 Oct)", () => {
  const q = googleQuery(sample());
  assert.match(q, /\("Mike Example" OR .*"Michael Example"/);
  assert.match(q, /\("Louisiana" OR "Texas" OR "Mississippi"\)$/);
  assert.ok(googleLink(sample()).startsWith("https://www.google.com/search?q=(%22Mike"));
});

test("the cover page marks pay current or desired and carries the scorecard", () => {
  const html = coverHtml(sample());
  assert.match(html, /<span class="tag">Desired<\/span>Base \$140K/);
  assert.match(html, /Pre-screen scorecard/);
  assert.equal(scoreLine(sample().must_dos!), "6 of 7 met · 1 partial");
});

test("references carry the consent line", () => {
  assert.ok(backHtml(sample()).includes(CONSENT));
});

test("the checklist passes a full packet and stops a thin one", () => {
  assert.deepEqual(checkPacket(sample()), []);
  const thin = { ...sample(), pay: { basis: "maybe" as never }, must_dos: [], concerns: "", references_consent: false };
  const miss = checkPacket(thin);
  assert.ok(miss.some((m) => m.startsWith("Pay marked")) && miss.some((m) => m.startsWith("Must Dos")) && miss.some((m) => m.startsWith("Concerns")) && miss.some((m) => m.includes("consent")));
});
